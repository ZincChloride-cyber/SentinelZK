import { describe, expect, it } from 'vitest'

type InitialAPI = {
  rdns: string
  name: string
  icon: string
  apiVersion: string
  connect: (networkId: string) => Promise<unknown>
}

function listWallets(injected: Record<string, InitialAPI> | undefined): InitialAPI[] {
  if (!injected) return []
  return Object.values(injected).filter((w) => typeof w?.connect === 'function')
}

describe('wallet client initialization', () => {
  it('reports no wallet when window.midnight is missing', () => {
    expect(listWallets(undefined)).toEqual([])
  })

  it('selects injected Midnight wallets by connect()', () => {
    const lace: InitialAPI = {
      rdns: 'io.lace.midnight',
      name: 'Lace',
      icon: 'data:image/svg+xml;base64,AA==',
      apiVersion: '4.0.1',
      connect: async () => ({}),
    }
    const wallets = listWallets({ lace })
    expect(wallets).toHaveLength(1)
    expect(wallets[0]?.rdns).toBe('io.lace.midnight')
  })
})
