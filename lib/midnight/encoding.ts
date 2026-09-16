export function normalizeTarget(address: string): string {
  return address.trim().toLowerCase()
}

function hexToBytes(hex: string): Uint8Array {
  const h = hex.trim().toLowerCase().replace(/^0x/, '')
  if (h.length % 2 !== 0) throw new Error('invalid hex')
  const out = new Uint8Array(h.length / 2)
  for (let i = 0; i < out.length; i++) {
    out[i] = Number.parseInt(h.slice(i * 2, i * 2 + 2), 16)
  }
  return out
}

export function bytesToHex(bytes: Uint8Array): string {
  return `0x${Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')}`
}

export async function sha256Utf8(text: string): Promise<Uint8Array> {
  const encoded = new TextEncoder().encode(text)
  if (globalThis.crypto?.subtle) {
    return new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', encoded))
  }
  const { createHash } = await import('node:crypto')
  return createHash('sha256').update(text, 'utf8').digest()
}

export async function targetIdFromAddress(address: string): Promise<Uint8Array> {
  return sha256Utf8(normalizeTarget(address))
}

export function parseModelHash(hex: string): Uint8Array {
  const bytes = hexToBytes(hex)
  if (bytes.length !== 32) {
    throw new Error('modelHash must be 32 bytes')
  }
  return bytes
}
