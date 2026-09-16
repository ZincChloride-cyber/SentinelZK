#!/usr/bin/env python3
"""Train (or retrain) the SentinelZK GBDT risk model from a CSV.

Expected columns:
  lp_removal_velocity, ownership_change_count, top_holder_concentration,
  contract_age_days, is_verified_source, holder_growth_rate, risk_score

Example:
  python train.py --csv data/labeled_risk.csv --out artifacts/risk_gbdt.joblib

Without --csv, runs the synthetic bootstrap (integration placeholder only).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

import numpy as np

ML_ROOT = Path(__file__).resolve().parent
if str(ML_ROOT) not in sys.path:
    sys.path.insert(0, str(ML_ROOT))

from sentinel_ml.bootstrap import ARTIFACT_PATH, bootstrap_artifact  # noqa: E402
from sentinel_ml.features import FEATURE_NAMES  # noqa: E402
from sentinel_ml.model import RiskModel  # noqa: E402


def train_from_csv(csv_path: Path, out_path: Path) -> tuple[Path, str]:
    try:
        import pandas as pd
    except ImportError as exc:  # pragma: no cover
        raise SystemExit("pandas is required for CSV training") from exc

    df = pd.read_csv(csv_path)
    missing = [c for c in FEATURE_NAMES + ["risk_score"] if c not in df.columns]
    if missing:
        raise SystemExit(f"CSV missing columns: {missing}")

    X = df[FEATURE_NAMES].to_numpy(dtype=np.float64)
    y = df["risk_score"].to_numpy(dtype=np.float64)
    model = RiskModel()
    model.fit(X, y)
    model.save(out_path)
    return out_path, RiskModel.hash_file(out_path)


def main() -> None:
    parser = argparse.ArgumentParser(description="Train SentinelZK GBDT risk model")
    parser.add_argument("--csv", type=Path, help="Labeled CSV with features + risk_score")
    parser.add_argument(
        "--out",
        type=Path,
        default=ARTIFACT_PATH,
        help="Output joblib path (default: ml/artifacts/risk_gbdt.joblib)",
    )
    args = parser.parse_args()

    if args.csv:
        path, digest = train_from_csv(args.csv, args.out)
        print(f"Trained from {args.csv}")
    else:
        path, digest = bootstrap_artifact(args.out)
        print("No --csv provided; wrote synthetic bootstrap artifact")

    print(f"artifact={path}")
    print(f"modelHash={digest}")


if __name__ == "__main__":
    main()
