# SentinelZK ML — Off-chain GBDT Risk Model

Gradient-boosted risk scorer for SentinelZK. Scores six telemetry features to a **0–100** risk score, then maps to `SAFE` / `SUSPICIOUS` / `EXPLOIT_DETECTED`.

## Setup

```bash
cd ml
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
# source .venv/bin/activate

pip install -r requirements.txt
python train.py
```

`train.py` without `--csv` writes a **synthetic bootstrap** artifact to `artifacts/risk_gbdt.joblib` so inference works before real training.

## Run inference API

```bash
cd ml
uvicorn server:app --host 127.0.0.1 --port 8000
```

- `GET /health` — model version + SHA-256 hash
- `POST /score` — body `{ "address": "0x..." }` (optional `features` override)

## Train later (real data)

Prepare a CSV with columns:

```text
lp_removal_velocity,ownership_change_count,top_holder_concentration,contract_age_days,is_verified_source,holder_growth_rate,risk_score
```

Then:

```bash
python train.py --csv path/to/labeled_risk.csv --out artifacts/risk_gbdt.joblib
```

Restart the FastAPI server so it loads the new artifact.

## Wire into Next.js

Copy `.env.example` → `.env.local` in the project root:

```env
SENTINEL_ML_URL=http://127.0.0.1:8000
NEXT_PUBLIC_SENTINEL_USE_ML=1
```

The app calls `/api/score`, which proxies to this service. If unset or unreachable, `SentinelService` falls back to demo mocks.
