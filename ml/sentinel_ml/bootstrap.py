"""Bootstrap a synthetic-fitted GBDT artifact for local inference (not real training)."""

from __future__ import annotations

from pathlib import Path

import numpy as np

from .features import FeatureVector
from .model import RiskModel

ARTIFACT_DIR = Path(__file__).resolve().parent.parent / "artifacts"
ARTIFACT_PATH = ARTIFACT_DIR / "risk_gbdt.joblib"


def _synthetic_training_set(n: int = 400, seed: int = 42) -> tuple[np.ndarray, np.ndarray]:
    rng = np.random.default_rng(seed)
    rows: list[list[float]] = []
    labels: list[float] = []

    for _ in range(n):
        # Sample across safe → risky manifolds so the bootstrap model is usable
        kind = rng.integers(0, 3)
        if kind == 0:  # safe
            fv = FeatureVector(
                lp_removal_velocity=float(rng.uniform(0.1, 5.0)),
                ownership_change_count=float(rng.integers(0, 2)),
                top_holder_concentration=float(rng.uniform(5.0, 35.0)),
                contract_age_days=float(rng.uniform(90, 1500)),
                is_verified_source=1.0,
                holder_growth_rate=float(rng.uniform(0.0, 40.0)),
            )
            base = 8.0
        elif kind == 1:  # borderline
            fv = FeatureVector(
                lp_removal_velocity=float(rng.uniform(6.0, 25.0)),
                ownership_change_count=float(rng.integers(1, 3)),
                top_holder_concentration=float(rng.uniform(45.0, 75.0)),
                contract_age_days=float(rng.uniform(7, 60)),
                is_verified_source=float(rng.integers(0, 2)),
                holder_growth_rate=float(rng.uniform(-15.0, 10.0)),
            )
            base = 48.0
        else:  # risky
            fv = FeatureVector(
                lp_removal_velocity=float(rng.uniform(30.0, 95.0)),
                ownership_change_count=float(rng.integers(2, 6)),
                top_holder_concentration=float(rng.uniform(70.0, 98.0)),
                contract_age_days=float(rng.uniform(1, 20)),
                is_verified_source=0.0,
                holder_growth_rate=float(rng.uniform(-80.0, -10.0)),
            )
            base = 82.0

        noise = float(rng.normal(0, 4.0))
        # Lightweight linear prior so labels correlate with risk drivers
        prior = (
            0.35 * fv.lp_removal_velocity
            + 4.0 * fv.ownership_change_count
            + 0.25 * fv.top_holder_concentration
            - 0.01 * fv.contract_age_days
            - 12.0 * fv.is_verified_source
            - 0.15 * fv.holder_growth_rate
        )
        score = float(np.clip(0.45 * base + 0.55 * prior + noise, 0, 100))
        rows.append(fv.to_array().ravel().tolist())
        labels.append(score)

    return np.asarray(rows, dtype=np.float64), np.asarray(labels, dtype=np.float64)


def bootstrap_artifact(path: Path | None = None) -> tuple[Path, str]:
    path = path or ARTIFACT_PATH
    X, y = _synthetic_training_set()
    model = RiskModel()
    model.fit(X, y)
    model.save(path)
    model_hash = RiskModel.hash_file(path)
    return path, model_hash


def load_or_bootstrap(path: Path | None = None) -> tuple[RiskModel, Path, str]:
    path = path or ARTIFACT_PATH
    if not path.exists():
        bootstrap_artifact(path)
    model = RiskModel.load(path)
    return model, path, RiskModel.hash_file(path)


if __name__ == "__main__":
    artifact, digest = bootstrap_artifact()
    print(f"Wrote {artifact}")
    print(f"modelHash={digest}")
