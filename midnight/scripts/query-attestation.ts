import { getSafetyAttestation } from '../src/oracle-api.js'
import { SentinelMidnightError } from '../src/errors.js'

async function main() {
  const target = process.argv[2]
  if (!target) {
    console.error('Usage: npm run query -- <target-address>')
    process.exit(1)
  }

  try {
    const attestation = await getSafetyAttestation(target)
    if (!attestation) {
      console.log(JSON.stringify({ found: false, target }, null, 2))
      process.exit(2)
    }
    console.log(JSON.stringify({ found: true, ...attestation }, null, 2))
  } catch (err) {
    const message = err instanceof SentinelMidnightError ? err.userMessage : err instanceof Error ? err.message : String(err)
    console.error(JSON.stringify({ error: message }))
    process.exit(1)
  }
}

void main()
