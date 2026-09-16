"""Deterministic synthetic telemetry until a real chain indexer exists."""

from __future__ import annotations

import hashlib

from .features import FeatureVector

# Known demo addresses aligned with lib/sentinel-service.ts mocks
KNOWN_PROFILES: dict[str, FeatureVector] = {
    "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640": FeatureVector(
        lp_removal_velocity=0.8,
        ownership_change_count=0,
        top_holder_concentration=14.2,
        contract_age_days=1220,
        is_verified_source=1.0,
        holder_growth_rate=18.4,
    ),
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": FeatureVector(
        lp_removal_velocity=84.6,
        ownership_change_count=4,
        top_holder_concentration=91.8,
        contract_age_days=3,
        is_verified_source=0.0,
        holder_growth_rate=-64.2,
    ),
    "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc": FeatureVector(
        lp_removal_velocity=12.4,
        ownership_change_count=1,
        top_holder_concentration=68.5,
        contract_age_days=14,
        is_verified_source=0.0,
        holder_growth_rate=4.1,
    ),
}


def _address_seed(address: str) -> int:
    digest = hashlib.sha256(address.lower().encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def telemetry_from_address(address: str) -> FeatureVector:
    normalized = address.lower().strip()
    if normalized in KNOWN_PROFILES:
        return KNOWN_PROFILES[normalized]

    seed = _address_seed(normalized)
    # Mix bands so arbitrary addresses span safe / suspicious / risky
    band = seed % 3
    if band == 0:
        return FeatureVector(
            lp_removal_velocity=1.0 + (seed % 40) / 10.0,
            ownership_change_count=float(seed % 2),
            top_holder_concentration=12.0 + (seed % 25),
            contract_age_days=180 + (seed % 900),
            is_verified_source=1.0,
            holder_growth_rate=5.0 + (seed % 20),
        )
    if band == 1:
        return FeatureVector(
            lp_removal_velocity=8.0 + (seed % 20),
            ownership_change_count=float(1 + seed % 2),
            top_holder_concentration=55.0 + (seed % 20),
            contract_age_days=10 + (seed % 40),
            is_verified_source=float(seed % 2),
            holder_growth_rate=-5.0 + (seed % 15),
        )
    return FeatureVector(
        lp_removal_velocity=45.0 + (seed % 50),
        ownership_change_count=float(2 + seed % 4),
        top_holder_concentration=75.0 + (seed % 20),
        contract_age_days=1 + (seed % 14),
        is_verified_source=0.0,
        holder_growth_rate=-20.0 - (seed % 50),
    )
