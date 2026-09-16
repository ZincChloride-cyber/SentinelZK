# ML ↔ Midnight interface

The ML pipeline is owned by the ML teammate (`ml/`). The Midnight side consumes a **stable scoring result**. It does not import training code, feature engineering, or model internals.

## Request (ML already implements this)

`POST {SENTINEL_ML_URL}/score`

```json
{ "address": "0x..." }
```

Optional override already supported by `ml/server.py`:

```json
{
  "address": "0x...",
  "features": {
    "lp_removal_velocity": 1.2,
    "ownership_change_count": 0,
    "top_holder_concentration": 14.1,
    "contract_age_days": 400,
    "is_verified_source": 1.0,
    "holder_growth_rate": 9.5
  }
}
```

## Response (current FastAPI shape)

```json
{
  "address": "0x...",
  "score": 18.4,
  "verdict": "SAFE",
  "isSafe": true,
  "threshold": 50,
  "modelHash": "0x...",
  "modelVersionId": "v1.2.0-gbdt",
  "summary": "...",
  "telemetry": {},
  "riskFlags": []
}
```

Midnight only needs this subset:

| Field | Type | Midnight use |
| --- | --- | --- |
| `address` | string | Hashed to `Bytes<32>` target id |
| `score` | number 0–100 | **Private witness** `privateRiskScore` |
| `threshold` | number 1–100 | Must match the on-chain `safetyThreshold` |
| `modelHash` | 32-byte hex | **Private witness** compared to `expectedModelHash` |
| `isSafe` | boolean | UI hint only; on-chain `isSafe` is recomputed in-circuit |

`verdict` (`SAFE` / `SUSPICIOUS` / `EXPLOIT_DETECTED`) is an ML/UI band. The Compact oracle is binary: `score < threshold`.

## Privacy

| Data | Private? | Public on Midnight? |
| --- | --- | --- |
| Feature vector | yes | no (never sent to Compact) |
| Raw `score` | yes | no |
| `modelHash` | compared privately, then disclosed if the proof succeeds | yes, on the attestation |
| `threshold` | configured at deploy | yes |
| `address` / target id | hashed off-chain | yes, as map key |
| `isSafe` | derived in-circuit | yes |

## How an ML result becomes an attestation

1. Operator/verifier calls ML `/score`.
2. TypeScript private state is `{ riskScore, modelHash }`.
3. Compact witnesses feed those values into `submitAttestation`.
4. The circuit asserts `modelHash == expectedModelHash` and `score <= 100`, then discloses `isSafe = score < threshold`.
5. dApps query the ledger map; they never receive the score.

No ML implementation change is required. If the teammate later stops returning `score` to HTTP clients, a verifier-only adapter can still pass the score into Compact witnesses.
