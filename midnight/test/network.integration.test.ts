import { describe, it } from 'vitest'

const network = process.env.MIDNIGHT_NETWORK ?? 'local'

/**
 * Live deploy/submit tests need a proof server, funded wallet, and compiled keys.
 * They are not run in `npm test`. Use `npm run test:preprod` after `npm run proof:up`
 * and a real MIDNIGHT_PREPROD_SEED.
 */
describe.skip(`SafetyOracle network integration (${network})`, () => {
  it('deploys, submits SAFE and NOT_SAFE attestations, and queries them back', () => {
    // Intentionally skipped until MIDNIGHT_*_SEED + proof server are available.
    // Use: npm run deploy && npm run submit && npm run query
  })
})
