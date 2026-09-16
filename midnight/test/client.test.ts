import { describe, expect, it } from 'vitest'
import { SentinelMidnightError, userFacingError } from '../src/errors.js'
import { getNetworkName, resolveWalletSecret } from '../src/config.js'

describe('client construction and configuration', () => {
  it('rejects unknown networks', () => {
    const prev = process.env.MIDNIGHT_NETWORK
    process.env.MIDNIGHT_NETWORK = 'mainnet-please'
    expect(() => getNetworkName()).toThrow(/Unknown MIDNIGHT_NETWORK/)
    process.env.MIDNIGHT_NETWORK = prev
  })

  it('requires a seed on preprod and never reads NEXT_PUBLIC secrets', () => {
    const prevNet = process.env.MIDNIGHT_NETWORK
    const prevSeed = process.env.MIDNIGHT_PREPROD_SEED
    const prevMnemonic = process.env.MIDNIGHT_PREPROD_MNEMONIC
    process.env.MIDNIGHT_NETWORK = 'preprod'
    delete process.env.MIDNIGHT_PREPROD_SEED
    delete process.env.MIDNIGHT_PREPROD_MNEMONIC
    expect(() => resolveWalletSecret('preprod')).toThrow(/Deployment configuration missing/)
    process.env.MIDNIGHT_NETWORK = prevNet
    process.env.MIDNIGHT_PREPROD_SEED = prevSeed
    process.env.MIDNIGHT_PREPROD_MNEMONIC = prevMnemonic
  })

  it('maps wallet rejection and missing attestations to user-facing errors', () => {
    const rejected = userFacingError(new Error('user Rejected the request'))
    expect(rejected).toBeInstanceOf(SentinelMidnightError)
    expect(rejected.code).toBe('TX_REJECTED')
    expect(rejected.userMessage).not.toMatch(/seed|mnemonic|private/i)

    const missing = userFacingError(new Error('No attestation for target'))
    expect(missing.code).toBe('MISSING_ATTESTATION')
  })
})
