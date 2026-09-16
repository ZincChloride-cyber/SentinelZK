"""GBDT risk model: score 0–100 with integrity hashing."""

from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any, Literal

import joblib
import numpy as np
from sklearn.ensemble import HistGradientBoostingRegressor

from .features import FEATURE_NAMES, FeatureVector

MODEL_VERSION = "v1.2.0-gbdt"
DEFAULT_THRESHOLD = 50
Verdict = Literal["SAFE", "SUSPICIOUS", "EXPLOIT_DETECTED"]


def score_to_verdict(score: float, threshold: float = DEFAULT_THRESHOLD) -> tuple[Verdict, bool]:
    """Map continuous score to UI verdict and boolean isSafe.

    ZK story uses score < threshold for safe attestations.
    SUSPICIOUS is a UI band around the threshold (45–54).
    """
    if score < 45:
        return "SAFE", True
    if score < 55:
        return "SUSPICIOUS", False
    return "EXPLOIT_DETECTED", False


def summary_for_verdict(verdict: Verdict) -> str:
    if verdict == "SAFE":
        return (
            "GBDT risk model indicates stable liquidity dynamics, healthy holder "
            "dispersion, and ownership structure within safe bounds."
        )
    if verdict == "SUSPICIOUS":
        return (
            "WARNING: Risk score borders the safety margin. Recent telemetry shows "
            "elevated signals; interaction flagged for caution."
        )
    return (
        "CRITICAL: GBDT risk model exceeded the exploit/rug threshold. Rapid liquidity "
        "stress and concentrated control patterns detected."
    )


class RiskModel:
    """Off-chain gradient-boosted risk scorer."""

    def __init__(
        self,
        estimator: HistGradientBoostingRegressor | None = None,
        version_id: str = MODEL_VERSION,
        threshold: float = DEFAULT_THRESHOLD,
    ) -> None:
        self.estimator = estimator or HistGradientBoostingRegressor(
            max_depth=4,
            learning_rate=0.08,
            max_iter=120,
            random_state=42,
        )
        self.version_id = version_id
        self.threshold = threshold
        self.feature_names = list(FEATURE_NAMES)
        self._fitted = estimator is not None and hasattr(estimator, "n_features_in_")

    def fit(self, X: np.ndarray, y: np.ndarray) -> RiskModel:
        self.estimator.fit(X, y)
        self._fitted = True
        return self

    def predict_score(self, features: FeatureVector | np.ndarray) -> float:
        if not self._fitted:
            raise RuntimeError("RiskModel is not fitted. Run bootstrap or train first.")
        if isinstance(features, FeatureVector):
            X = features.to_array()
        else:
            X = np.asarray(features, dtype=np.float64)
            if X.ndim == 1:
                X = X.reshape(1, -1)
        raw = float(self.estimator.predict(X)[0])
        return float(np.clip(raw, 0.0, 100.0))

    def score_bundle(self, features: FeatureVector) -> dict[str, Any]:
        score = self.predict_score(features)
        verdict, is_safe = score_to_verdict(score, self.threshold)
        return {
            "score": round(score, 2),
            "verdict": verdict,
            "isSafe": is_safe,
            "threshold": self.threshold,
            "modelVersionId": self.version_id,
            "summary": summary_for_verdict(verdict),
        }

    def save(self, path: str | Path) -> Path:
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "estimator": self.estimator,
            "version_id": self.version_id,
            "threshold": self.threshold,
            "feature_names": self.feature_names,
            "fitted": self._fitted,
        }
        joblib.dump(payload, path)
        return path

    @classmethod
    def load(cls, path: str | Path) -> RiskModel:
        path = Path(path)
        payload = joblib.load(path)
        model = cls(
            estimator=payload["estimator"],
            version_id=payload.get("version_id", MODEL_VERSION),
            threshold=float(payload.get("threshold", DEFAULT_THRESHOLD)),
        )
        model.feature_names = list(payload.get("feature_names", FEATURE_NAMES))
        model._fitted = bool(payload.get("fitted", True))
        return model

    @staticmethod
    def hash_file(path: str | Path) -> str:
        digest = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(65536), b""):
                digest.update(chunk)
        return "0x" + digest.hexdigest()

    def model_hash(self, path: str | Path | None = None) -> str:
        if path is None:
            raise ValueError("path to serialized artifact is required for model_hash")
        return self.hash_file(path)
