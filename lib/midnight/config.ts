export type MidnightNetworkId = 'undeployed' | 'preview' | 'preprod'

export function useMockOracle(): boolean {
  const flag = process.env.NEXT_PUBLIC_USE_MOCK_ORACLE
  if (flag === undefined || flag === '') return true
  return flag === 'true' || flag === '1'
}

export function expectedMidnightNetwork(): MidnightNetworkId {
  const value = (process.env.NEXT_PUBLIC_MIDNIGHT_NETWORK ?? 'preprod').trim().toLowerCase()
  if (value === 'undeployed' || value === 'preview' || value === 'preprod') return value
  return 'preprod'
}

export function midnightContractAddress(): string | null {
  const address = process.env.NEXT_PUBLIC_MIDNIGHT_CONTRACT_ADDRESS?.trim()
  return address || null
}

export function displayNetworkLabel(network: MidnightNetworkId = expectedMidnightNetwork()): string {
  if (network === 'undeployed') return 'Midnight Local'
  if (network === 'preview') return 'Midnight Preview'
  return 'Midnight Preprod'
}

export function truncateAddress(address: string, left = 8, right = 6): string {
  if (address.length <= left + right + 3) return address
  return `${address.slice(0, left)}…${address.slice(-right)}`
}
