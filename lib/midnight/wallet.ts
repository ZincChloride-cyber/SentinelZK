'use client'

import '@midnight-ntwrk/dapp-connector-api'
import type { ConnectedAPI, InitialAPI } from '@midnight-ntwrk/dapp-connector-api'
import { expectedMidnightNetwork, truncateAddress } from './config'
import { MidnightClientError, toMidnightClientError } from './errors'

export type MidnightWalletSnapshot = {
  connected: boolean
  connecting: boolean
  address: string | null
  displayAddress: string | null
  networkId: string | null
  walletName: string | null
  error: string | null
  wrongNetwork: boolean
}

const emptySnapshot: MidnightWalletSnapshot = {
  connected: false,
  connecting: false,
  address: null,
  displayAddress: null,
  networkId: null,
  walletName: null,
  error: null,
  wrongNetwork: false,
}

export function listInjectedWallets(): InitialAPI[] {
  if (typeof window === 'undefined' || !window.midnight) return []
  return Object.values(window.midnight).filter((wallet) => typeof wallet?.connect === 'function')
}

export function selectWallet(): InitialAPI {
  const wallets = listInjectedWallets()
  if (wallets.length === 0) {
    throw new MidnightClientError(
      'WALLET_NOT_FOUND',
      'No Midnight wallet was found. Install the Lace wallet extension and set it to the Midnight Preprod network.',
    )
  }
  const lace = wallets.find((w) => /lace/i.test(w.name) || /lace/i.test(w.rdns))
  return lace ?? wallets[0]
}

export async function connectMidnightWallet(): Promise<ConnectedAPI> {
  const wallet = selectWallet()
  const network = expectedMidnightNetwork()
  try {
    const api = await wallet.connect(network)
    const status = await api.getConnectionStatus()
    if (status.status !== 'connected') {
      throw new MidnightClientError(
        'WALLET_NOT_CONNECTED',
        'The wallet did not complete the connection.',
      )
    }
    if (status.networkId && status.networkId !== network) {
      throw new MidnightClientError(
        'WRONG_NETWORK',
        `The wallet is on ${status.networkId}, but SentinelZK expects ${network}. Switch networks in Lace and try again.`,
      )
    }
    try {
      await api.hintUsage(['getUnshieldedAddress', 'getConnectionStatus', 'getConfiguration'])
    } catch {
      // Optional permission hint; connection can still succeed.
    }
    return api
  } catch (err) {
    throw toMidnightClientError(err)
  }
}

export async function readWalletSnapshot(api: ConnectedAPI): Promise<MidnightWalletSnapshot> {
  const status = await api.getConnectionStatus()
  const expected = expectedMidnightNetwork()
  if (status.status !== 'connected') {
    return { ...emptySnapshot, error: 'The Midnight wallet is disconnected.' }
  }

  const { unshieldedAddress } = await api.getUnshieldedAddress()
  const wrongNetwork = Boolean(status.networkId && status.networkId !== expected)
  return {
    connected: true,
    connecting: false,
    address: unshieldedAddress,
    displayAddress: truncateAddress(unshieldedAddress),
    networkId: status.networkId,
    walletName: 'Lace',
    error: wrongNetwork
      ? `Wrong network. Switch Lace to ${expected} to continue.`
      : null,
    wrongNetwork,
  }
}

export const disconnectedWalletSnapshot = emptySnapshot
