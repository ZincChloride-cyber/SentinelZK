import { describe, expect, it } from 'vitest'
import { createPrivateState, witnesses } from '../src/witnesses.js'

const modelHash = new Uint8Array(32).fill(7)

describe('witnesses', () => {
  it('returns private score and model hash without mutating caller state identity', () => {
    const privateState = createPrivateState(12n, modelHash)
    const context = { privateState } as never
    const [nextScoreState, score] = witnesses.privateRiskScore(context)
    const [nextHashState, hash] = witnesses.privateModelHash(context)
    expect(score).toBe(12n)
    expect(hash).toEqual(modelHash)
    expect(nextScoreState).toBe(privateState)
    expect(nextHashState).toBe(privateState)
  })

  it('rejects a model hash that is not 32 bytes', () => {
    expect(() => createPrivateState(1n, new Uint8Array(16))).toThrow(/32 bytes/)
  })
})
