import { submitSafetyAttestation } from '../src/oracle-api.js'
import { SentinelMidnightError } from '../src/errors.js'

function arg(name: string): string | undefined {
  const prefix = `--${name}=`
  const hit = process.argv.find((a) => a.startsWith(prefix))
  return hit?.slice(prefix.length)
}

async function main() {
  const target = arg('target') ?? process.argv[2]
  const riskScore = arg('score') ?? process.argv[3]
  const modelHash = arg('modelHash') ?? process.env.MIDNIGHT_EXPECTED_MODEL_HASH
  if (!target || riskScore === undefined || !modelHash) {
    console.error('Usage: npm run submit -- --target=0xabc --score=12 --modelHash=0x...')
    process.exit(1)
  }

  try {
    const result = await submitSafetyAttestation({
      target,
      riskScore,
      modelHash,
    })
    console.log('\nAttestation submitted')
    console.log(`  target:     ${result.attestation.target}`)
    console.log(`  isSafe:     ${result.attestation.isSafe}`)
    console.log(`  modelHash:  ${result.attestation.modelHash}`)
    console.log(`  threshold:  ${result.attestation.threshold}`)
    console.log(`  txId:       ${result.txId ?? '(pending)'}`)
    console.log(`  block:      ${result.blockHeight ?? '(pending)'}`)
  } catch (err) {
    const message = err instanceof SentinelMidnightError ? err.userMessage : err instanceof Error ? err.message : String(err)
    console.error(`Submit failed: ${message}`)
    process.exit(1)
  }
}

void main()
