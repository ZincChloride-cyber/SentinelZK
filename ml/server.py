"""FastAPI inference server for SentinelZK GBDT risk model."""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# Allow `python server.py` from ml/ without installing the package
ML_ROOT = Path(__file__).resolve().parent
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from sentinel_ml.bootstrap import load_or_bootstrap  # noqa: E402
from sentinel_ml.features import (  # noqa: E402
    FeatureVector,
    risk_flags_from_features,
    telemetry_payload,
)
from sentinel_ml.model import MODEL_VERSION  # noqa: E402
from sentinel_ml.telemetry import telemetry_from_address  # noqa: E402

app = FastAPI(title="SentinelZK Risk Model", version=MODEL_VERSION)

_model, _artifact_path, _model_hash = load_or_bootstrap()


class FeatureInput(BaseModel):
    lp_removal_velocity: float
    ownership_change_count: float
    top_holder_concentration: float
    contract_age_days: float
    is_verified_source: float = Field(description="1.0 verified, 0.0 unverified")
    holder_growth_rate: float


class ScoreRequest(BaseModel):
    address: str
    features: FeatureInput | None = None


class ScoreResponse(BaseModel):
    address: str
    score: float
    verdict: str
    isSafe: bool
    threshold: float
    modelHash: str
    modelVersionId: str
    summary: str
    telemetry: dict[str, Any]
    riskFlags: list[str]


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "modelVersionId": _model.version_id,
        "modelHash": _model_hash,
        "artifact": str(_artifact_path),
        "threshold": _model.threshold,
    }


@app.post("/score", response_model=ScoreResponse)
def score(req: ScoreRequest) -> ScoreResponse:
    address = req.address.strip()
    if not address:
        raise HTTPException(status_code=400, detail="address is required")

    if req.features is not None:
        features = FeatureVector.from_dict(req.features.model_dump())
    else:
        features = telemetry_from_address(address)

    bundle = _model.score_bundle(features)
    return ScoreResponse(
        address=address,
        score=bundle["score"],
        verdict=bundle["verdict"],
        isSafe=bundle["isSafe"],
        threshold=bundle["threshold"],
        modelHash=_model_hash,
        modelVersionId=bundle["modelVersionId"],
        summary=bundle["summary"],
        telemetry=telemetry_payload(features),
        riskFlags=risk_flags_from_features(features),
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)
