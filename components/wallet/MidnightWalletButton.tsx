'use client'

import { Lock } from 'lucide-react'
import { useMidnightWallet } from './MidnightWalletProvider'

export function MidnightWalletButton() {
  const wallet = useMidnightWallet()

  const label = wallet.connecting
    ? 'Connecting…'
    : wallet.connected
      ? `Midnight Wallet: ${wallet.displayAddress}`
      : 'Connect Wallet'

  return (
    <button
      type="button"
      onClick={() => {
        if (wallet.connecting) return
        if (wallet.connected) wallet.disconnect()
        else void wallet.connect()
      }}
      title={wallet.error ?? wallet.address ?? 'Connect Midnight Lace wallet'}
      className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition shadow-lg ${
        wallet.connected && !wallet.wrongNetwork
          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/10'
          : wallet.wrongNetwork
            ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
            : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-cyan-500/20 hover:shadow-cyan-500/40'
      }`}
    >
      <Lock className="h-3.5 w-3.5" />
      {label}
    </button>
  )
}
