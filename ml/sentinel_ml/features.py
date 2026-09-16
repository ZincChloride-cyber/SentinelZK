"""Feature schema aligned with TypeScript FeatureTelemetry."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

import numpy as np

FEATURE_NAMES: list[str] = [
    "lp_removal_velocity",
    "ownership_change_count",
    "top_holder_concentration",
    "contract_age_days",
    "is_verified_source",
    "holder_growth_rate",
]

# Heuristic anomaly cutoffs (private product rules; bootstrap / UI flags only)
ANOMALY_RULES = {
    "lp_removal_velocity": lambda v: v >= 10.0,
    "ownership_change_count": lambda v: v >= 2,
    "top_holder_concentration": lambda v: v >= 60.0,
    "contract_age_days": lambda v: v < 30,
    "is_verified_source": lambda v: v < 0.5,
    "holder_growth_rate": lambda v: v <= -20.0,
}


@dataclass
class FeatureVector:
    lp_removal_velocity: float
    ownership_change_count: float
    top_holder_concentration: float
    contract_age_days: float
    is_verified_source: float  # 1.0 = verified, 0.0 = unverified
    holder_growth_rate: float

    def to_array(self) -> np.ndarray:
        return np.array(
            [
                self.lp_removal_velocity,
                self.ownership_change_count,
                self.top_holder_concentration,
                self.contract_age_days,
                self.is_verified_source,
                self.holder_growth_rate,
            ],
            dtype=np.float64,
        ).reshape(1, -1)

    def to_dict(self) -> dict[str, float]:
        return asdict(self)

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> FeatureVector:
        return cls(
            lp_removal_velocity=float(data["lp_removal_velocity"]),
            ownership_change_count=float(data["ownership_change_count"]),
            top_holder_concentration=float(data["top_holder_concentration"]),
            contract_age_days=float(data["contract_age_days"]),
            is_verified_source=float(data["is_verified_source"]),
            holder_growth_rate=float(data["holder_growth_rate"]),
        )


def telemetry_payload(features: FeatureVector) -> dict[str, Any]:
    """Build FeatureTelemetry-shaped JSON for the Next.js UI."""
    verified = features.is_verified_source >= 0.5
    return {
        "lpRemovalVelocity": {
            "value": round(features.lp_removal_velocity, 2),
            "label": f"{features.lp_removal_velocity:.1f}% / hour",
            "isAnomalous": ANOMALY_RULES["lp_removal_velocity"](features.lp_removal_velocity),
        },
        "ownershipChangeCount": {
            "value": int(features.ownership_change_count),
            "label": f"{int(features.ownership_change_count)} admin transfers (30d)",
            "isAnomalous": ANOMALY_RULES["ownership_change_count"](
                features.ownership_change_count
            ),
        },
        "topHolderConcentration": {
            "value": round(features.top_holder_concentration, 2),
            "label": f"{features.top_holder_concentration:.1f}% held by top wallets",
            "isAnomalous": ANOMALY_RULES["top_holder_concentration"](
                features.top_holder_concentration
            ),
        },
        "contractAgeDays": {
            "value": int(features.contract_age_days),
            "label": f"{int(features.contract_age_days)} days since deployment",
            "isAnomalous": ANOMALY_RULES["contract_age_days"](features.contract_age_days),
        },
        "isVerifiedSource": {
            "value": verified,
            "label": "Verified source bytecode" if verified else "Unverified bytecode",
            "isAnomalous": ANOMALY_RULES["is_verified_source"](features.is_verified_source),
        },
        "holderGrowthRate": {
            "value": round(features.holder_growth_rate, 2),
            "label": f"{features.holder_growth_rate:+.1f}% unique wallets / 7d",
            "isAnomalous": ANOMALY_RULES["holder_growth_rate"](features.holder_growth_rate),
        },
    }


def risk_flags_from_features(features: FeatureVector) -> list[str]:
    flags: list[str] = []
    if ANOMALY_RULES["lp_removal_velocity"](features.lp_removal_velocity):
        flags.append("Elevated liquidity removal velocity")
    if ANOMALY_RULES["ownership_change_count"](features.ownership_change_count):
        flags.append("Frequent privileged ownership changes")
    if ANOMALY_RULES["top_holder_concentration"](features.top_holder_concentration):
        flags.append("High top-holder concentration")
    if ANOMALY_RULES["contract_age_days"](features.contract_age_days):
        flags.append("Short contract operational history")
    if ANOMALY_RULES["is_verified_source"](features.is_verified_source):
        flags.append("Unverified smart contract bytecode")
    if ANOMALY_RULES["holder_growth_rate"](features.holder_growth_rate):
        flags.append("Sharp decline in active holders")
    if not flags:
        flags.append("No major telemetry anomalies")
        flags.append("Liquidity and ownership within normal bands")
    return flags
