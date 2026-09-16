'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShieldCheck, Lock, Activity, type LucideIcon } from 'lucide-react'
import { MidnightWalletButton } from '@/components/wallet/MidnightWalletButton'
import { displayNetworkLabel, expectedMidnightNetwork, useMockOracle } from '@/lib/midnight/config'

type NavLink = {
  href: string
  label: string
  icon?: LucideIcon
  iconClass?: string
}

const navLinks: NavLink[] = [
  { href: '/inspector', label: 'Contract Inspector', icon: Activity, iconClass: 'text-cyan-400' },
  { href: '/how-it-works', label: 'How ZK Works', icon: Lock, iconClass: 'text-blue-400' },
  { href: '/attestations', label: 'Recent Attestations' },
  { href: '/faqs', label: 'FAQs' },
]

export function Header() {
  const pathname = usePathname()
  const networkLabel = useMockOracle() ? 'Preprod Testnet' : displayNetworkLabel(expectedMidnightNetwork()).replace('Midnight ', '')

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/55 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-600/20 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border border-slate-950"></span>
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-lg font-extrabold tracking-tight text-white">
                Sentinel<span className="text-cyan-400">ZK</span>
              </span>
              <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300 border border-cyan-500/20">
                Midnight Network
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Privacy-Preserving Exploit Oracle</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition hover:text-cyan-400 flex items-center gap-1.5 ${
                  active ? 'text-cyan-400' : ''
                }`}
              >
                {Icon ? <Icon className={`h-3.5 w-3.5 ${link.iconClass ?? ''}`} /> : null}
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-xs text-slate-300">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">{networkLabel}</span>
          </div>

          <MidnightWalletButton />
        </div>
      </div>
    </header>
  )
}
