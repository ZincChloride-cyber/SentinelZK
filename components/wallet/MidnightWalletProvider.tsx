'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api'
import {
  connectMidnightWallet,
  disconnectedWalletSnapshot,
  readWalletSnapshot,
  type MidnightWalletSnapshot,
} from '@/lib/midnight/wallet'
import { MidnightClientError, toMidnightClientError } from '@/lib/midnight/errors'

type WalletContextValue = MidnightWalletSnapshot & {
  connect: () => Promise<void>
  disconnect: () => void
  api: ConnectedAPI | null
}

const WalletContext = createContext<WalletContextValue | null>(null)

export function MidnightWalletProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<MidnightWalletSnapshot>(disconnectedWalletSnapshot)
  const [api, setApi] = useState<ConnectedAPI | null>(null)

  const connect = useCallback(async () => {
    setSnapshot((prev) => ({ ...prev, connecting: true, error: null }))
    try {
      const connected = await connectMidnightWallet()
      const next = await readWalletSnapshot(connected)
      setApi(connected)
      setSnapshot({ ...next, connecting: false })
    } catch (err) {
      const mapped = toMidnightClientError(err)
      setApi(null)
      setSnapshot({
        ...disconnectedWalletSnapshot,
        connecting: false,
        error: mapped.userMessage,
      })
    }
  }, [])

  const disconnect = useCallback(() => {
    setApi(null)
    setSnapshot(disconnectedWalletSnapshot)
  }, [])

  const value = useMemo<WalletContextValue>(
    () => ({ ...snapshot, connect, disconnect, api }),
    [snapshot, connect, disconnect, api],
  )

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useMidnightWallet(): WalletContextValue {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new MidnightClientError(
      'WALLET_NOT_CONNECTED',
      'Midnight wallet provider is missing from the application tree.',
    )
  }
  return ctx
}
