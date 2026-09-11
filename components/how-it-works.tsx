'use client'

import React from 'react'
import {
  Database,
  Cpu,
  Lock,
  Boxes,
  ShieldCheck,
  EyeOff,
  Eye,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

export function HowItWorks() {
  const steps = [
    {
      step: '01',
      title: 'Off-Chain Telemetry Ingestion',
      icon: Database,
      iconColor: 'text-cyan-400',
      tag: 'Public Data',
      tagColor: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
      description:
        'Continuously tracks on-chain pool liquidity reserves, LP removal velocity, privileged admin transfers, and holder concentration metrics without needing trust in off-chain promises.',
    },
    {
      step: '02',
      title: 'ML Risk Classification',
      icon: Cpu,
      iconColor: 'text-blue-400',
      tag: 'Off-Chain Inference',
      tagColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
      description:
        'A gradient-boosted decision tree scores the contract across 6 key attack vectors to output a composite risk score (0–100). The model file is hashed (SHA-256) for on-chain integrity binding.',
    },
    {
      step: '03',
      title: 'Midnight Compact ZK Proof',
      icon: Lock,
      iconColor: 'text-indigo-400',
      tag: 'Zero-Knowledge Layer',
      tagColor: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
      description:
        'The Compact circuit proves: (1) Model hash matches registered version, and (2) Risk score satisfies threshold (< 50). Crucially, the score and weights remain 100% private to prevent evasion.',
    },
    {
      step: '04',
      title: 'On-Chain Oracle Attestation',
      icon: Boxes,
      iconColor: 'text-emerald-400',
      tag: 'Midnight Preprod Ledger',
      tagColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      description:
        'The verified attestation is recorded on Midnight. Any dApp, DEX aggregator, or wallet can query the oracle before a user confirms a deposit transaction, stopping rug pulls before they happen.',
    },
  ]

  return (
    <section id="how-it-works" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
          <Lock className="h-3.5 w-3.5" />
          <span>Cryptographic Architecture</span>
        </div>
        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Why Privacy-Preserving Security Matters
        </h2>
        <p className="mt-3 text-base text-slate-300">
          Public security audits teach attackers exactly what features trigger flags, allowing them to reverse-engineer evasion strategies. SentinelZK leverages Midnight to keep model intelligence private while publishing provable safety guarantees.
        </p>
      </div>

      {/* Comparison: Private vs Disclosed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
        {/* What Stays Private */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-950/20 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <EyeOff className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Private &amp; Confidential in ZK</h3>
              <p className="text-xs text-indigo-300">Never revealed on-chain or to attackers</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>Exact continuous risk score (0–100)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>Model architecture &amp; proprietary decision weights</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span>Proprietary anomaly thresholds per feature vector</span>
            </li>
          </ul>
        </div>

        {/* What Is Disclosed Publicly */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Publicly Disclosed &amp; Verifiable</h3>
              <p className="text-xs text-emerald-300">Trustless cryptographic assurance on Midnight</p>
            </div>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Boolean Safety Attestation (<code className="text-emerald-300">isSafe: true/false</code>)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Model Integrity Hash (proves model was unmodified)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>Target contract address + Midnight ledger block timestamp</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 4 Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.step}
              className="relative flex flex-col justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-md hover:border-white/20 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 border border-white/10 group-hover:scale-110 transition">
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    STEP {item.step}
                  </span>
                </div>

                <span className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold border ${item.tagColor} mb-2`}>
                  {item.tag}
                </span>

                <h3 className="font-bold text-white text-base mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
