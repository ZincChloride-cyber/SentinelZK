import { writeFileSync } from 'node:fs'
import { deploySafetyOracle } from '../src/oracle-api.js'
import { SentinelMidnightError } from '../src/errors.js'

async function main() {
  try {
    const result = await deploySafetyOracle()
    const payload = {
      ...result,
      deployedAt: new Date().toISOString(),
    }
    writeFileSync('deployment.json', JSON.stringify(payload, null, 2) + '\n', 'utf8')
    console.log('\nSafetyOracle deployment')
    console.log(`  network:            ${result.network}`)
    console.log(`  contract address:   ${result.contractAddress}`)
    console.log(`  expected model hash:${result.expectedModelHash}`)
    console.log(`  threshold:          ${result.threshold}`)
    console.log('\nWrote midnight/deployment.json')
    console.log('Set MIDNIGHT_CONTRACT_ADDRESS and NEXT_PUBLIC_MIDNIGHT_CONTRACT_ADDRESS to the address above.')
  } catch (err) {
    const message = err instanceof SentinelMidnightError ? err.userMessage : err instanceof Error ? err.message : String(err)
    console.error(`Deploy failed: ${message}`)
    process.exit(1)
  }
}

void main()
