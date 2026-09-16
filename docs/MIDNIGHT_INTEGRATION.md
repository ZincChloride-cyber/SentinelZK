# Midnight integration (technical)

## Toolchain actually used

This repo did not previously contain Compact/SDK code. The implementation follows the **installed** Compact compiler in WSL, not newer docs that mention Compact 0.23 / compactc 0.31.

| Piece | Version found / pinned |
| --- | --- |
| Compact toolchain (`compact`) | 0.5.2 |
| compactc | 0.30.0 |
| Compact language pragma | 0.22 |
| Generated runtime guard | `@midnight-ntwrk/compact-runtime@0.15.0` |
| midnight-js stack | 4.0.4 (`@midnight-ntwrk/compact-js@2.5.0`) |
| DApp connector (Lace) | `@midnight-ntwrk/dapp-connector-api@4.0.1` |
| Proof server image | `midnightntwrk/proof-server:8.0.3` |
| Intended public network | Midnight Preprod |

Windows native Compact is **not** supported (the OS `compact.exe` is NTFS compression). Compile with WSL:

```bash
wsl -e bash -lc "cd /mnt/d/Koding/SentinelZK/midnight && compact compile contracts/SafetyOracle.compact contracts/managed/safety-oracle"
```

or from `midnight/`: `npm run compile`.

## Contract

`midnight/contracts/SafetyOracle.compact` compiles to three impure/provable circuits:

- `submitAttestation(target, attestedAt)`
- `hasAttestation(target)`
- `getAttestation(target)`

Constructor args: `expectedModelHash: Bytes<32>`, `threshold: Uint<8>`.

Target keys are SHA-256 of the lowercase address, computed off-chain. Compact `persistentHash` is a field hash, **not** SHA-256, so hashing is a documented TypeScript convention.

## Proofs

`compactc` emitted real prover/verifier keys under `midnight/contracts/managed/safety-oracle/keys/`. Off-chain tests execute the generated JS module with `@midnight-ntwrk/compact-runtime`. That checks circuit `assert`s and produces `proofData`; it does **not** by itself talk to a proof server. Network deploy/submit uses midnight-js + a local proof server.

## Wallet

Browser: Lace injects `window.midnight`. The app calls `wallet.connect(networkId)` from `@midnight-ntwrk/dapp-connector-api` 4.0.1.

Operator submit: Node `MidnightWalletProvider` from `@midnight-ntwrk/testkit-js` 4.0.4 with `MIDNIGHT_PREPROD_SEED`. Browser Lace currently authorizes connection / network checks. Building an unsealed Compact transaction inside the Next.js client bundle requires the full midnight-js + Lace `getProvingProvider` path; that is wired as a follow-up if Next.js bundling of those packages is proven. Until then the verifier publishes from `midnight/` or `/api/midnight/submit` using the server seed.

## Frontend switch

`NEXT_PUBLIC_USE_MOCK_ORACLE=true` (default) keeps the existing demo inspector.

Set it to `false` and set `NEXT_PUBLIC_MIDNIGHT_CONTRACT_ADDRESS` plus server `MIDNIGHT_CONTRACT_ADDRESS` to query the live oracle. Seeds never go in `NEXT_PUBLIC_*`.

## Known limits

- Compact 0.22 / compactc 0.30.0 does not expose a block-height ledger field. `attestedAt` is a disclosed Unix timestamp supplied by the caller.
- On-chain verdict is boolean SAFE / NOT SAFE. `SUSPICIOUS` remains an ML/UI band.
- Proof server sees witness data in the clear; run it locally (`localhost:6300`) even on Preprod.
