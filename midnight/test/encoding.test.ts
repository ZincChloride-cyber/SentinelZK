import { describe, expect, it } from 'vitest'
import {
  bytesToHex,
  parseHexBytes32,
  parseRiskScore,
  parseThreshold,
  targetIdFromAddress,
} from '../src/encoding.js'

describe('encoding', () => {
  it('hashes addresses as lowercase SHA-256', () => {
    const a = targetIdFromAddress('0xAbCDef')
    const b = targetIdFromAddress('  0xabcdef  ')
    expect(a).toEqual(b)
    expect(a).toHaveLength(32)
    expect(bytesToHex(a)).toMatch(/^0x[0-9a-f]{64}$/)
  })

  it('rejects malformed model hashes', () => {
    expect(() => parseHexBytes32('0xabc', 'modelHash')).toThrow(/32-byte/)
    expect(() => parseHexBytes32('zz'.repeat(32), 'modelHash')).toThrow(/32-byte/)
  })

  it('accepts 32-byte hex with or without 0x', () => {
    const hex = '7e'.repeat(32)
    expect(parseHexBytes32(hex)).toEqual(parseHexBytes32(`0x${hex}`))
  })

  it('rejects out-of-range scores and thresholds', () => {
    expect(() => parseRiskScore(101)).toThrow(/0 and 100/)
    expect(() => parseRiskScore(-1)).toThrow(/0 and 100/)
    expect(() => parseThreshold(0)).toThrow(/1 and 100/)
    expect(() => parseThreshold(101)).toThrow(/1 and 100/)
    expect(parseRiskScore(0)).toBe(0n)
    expect(parseRiskScore(100)).toBe(100n)
    expect(parseThreshold(50)).toBe(50n)
  })
})
