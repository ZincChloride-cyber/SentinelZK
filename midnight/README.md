# SentinelZK Midnight package

Isolated Compact contract, witnesses, deployment, and circuit tests for the Safety Oracle.

This package is compiled against the **installed** toolchain:

| Component | Version |
| --- | --- |
| Compact toolchain | 0.5.2 |
| compactc | 0.30.0 |
| Compact language | 0.22.0 |
| `@midnight-ntwrk/compact-runtime` | 0.15.0 |
| `@midnight-ntwrk/midnight-js-*` | 4.0.4 |

## What is private / public

**Private (never written to the ledger):**

- `privateRiskScore` witness — ML risk score 0–100
- submitted model bytes until the circuit discloses the registered hash
- ML feature vectors (they never enter Compact)

**Public (ledger):**

- expected model hash
- safety threshold
- target id (SHA-256 of the lowercase address)
- `isSafe`
- disclosed model hash and threshold on the attestation
- `attestedAt`

The Compact circuit proves `score < threshold` and `submittedHash == expectedModelHash`. That is a real ZK circuit produced by `compactc`, not a hash masquerading as a proof.

## Commands

Windows: Compact is not `C:\Windows\System32\compact.exe`. Use WSL.

```bash
cd midnight
npm install
npm run compile
npm test
```

Proof server (needed for deploy/submit and Lace):

```bash
npm run proof:up
```

Deploy to Preprod (seed from `midnight/.env.preprod`, never commit it):

```bash
copy .env.example .env.preprod
# fill MIDNIGHT_PREPROD_SEED and MIDNIGHT_EXPECTED_MODEL_HASH
npm run deploy
```

Query / submit:

```bash
npm run query -- 0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640
npm run submit -- --target=0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640 --score=12 --modelHash=0x...
```

Local network (optional):

```bash
npm run env:up
npm run test:local
```
