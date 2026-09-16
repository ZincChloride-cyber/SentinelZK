import { createHash } from 'node:crypto'

export function normalizeTarget(address: string): string {
  return address.trim().toLowerCase()
}

export function targetIdFromAddress(address: string): Uint8Array {
  return createHash('sha256').update(normalizeTarget(address), 'utf8').digest()
}

export function parseHexBytes32(hex: string, label = 'hash'): Uint8Array {
  const h = hex.trim().toLowerCase().replace(/^0x/, '')
  if (!/^[0-9a-f]{64}$/.test(h)) {
    throw new Error(`${label} must be a 32-byte hex string (64 hex chars, optional 0x prefix)`)
  }
  return Uint8Array.from(Buffer.from(h, 'hex'))
}

export function bytesToHex(bytes: Uint8Array): string {
  return '0x' + Buffer.from(bytes).toString('hex')
}

export function parseRiskScore(value: number | bigint | string): bigint {
  const n = typeof value === 'bigint' ? value : BigInt(Math.trunc(Number(value)))
  if (n < 0n || n > 100n) {
    throw new Error('risk score must be an integer between 0 and 100')
  }
  return n
}

export function parseThreshold(value: number | bigint | string): bigint {
  const n = typeof value === 'bigint' ? value : BigInt(Math.trunc(Number(value)))
  if (n <= 0n || n > 100n) {
    throw new Error('threshold must be an integer between 1 and 100')
  }
  return n
}
