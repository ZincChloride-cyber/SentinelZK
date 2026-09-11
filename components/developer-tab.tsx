'use client'

import React, { useState } from 'react'
import { Code2, Copy, Check, Terminal, ExternalLink } from 'lucide-react'

export function DeveloperTab() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'sdk' | 'compact'>('sdk')

  const sdkCode = `import { MidnightProvider } from '@midnight-ntwrk/midnight-js-contracts'
import { SentinelOracleClient } from '@sentinelzk/sdk'

// 1. Initialize client connected to Midnight Preprod Oracle
const oracleClient = new SentinelOracleClient({
  network: 'preprod',
  oracleAddress: 'mn1_safety_oracle_preprod_88294a28f84920194829'
})

// 2. Pre-transaction safety check before approving deposit
export async function verifyBeforeDeposit(targetPoolAddress: string) {
  const attestation = await oracleClient.getSafetyAttestation(targetPoolAddress)

  if (!attestation.isSafe) {
    throw new Error(
      \`Deposit blocked by SentinelZK Oracle: High Exploit/Rug Risk. Proof: \${attestation.proofRef}\`
    )
  }

  console.log(\`✅ Pool verified safe on Midnight block #\${attestation.blockHeight}\`)
  return true
}`

  const compactCode = `// SafetyOracle.compact - Midnight Smart Contract Interface
pragma language_version 0.23;

export struct Attestation {
  isSafe: Boolean,
  timestamp: Uint<64>,
  modelVersionId: Opaque<"string">,
  proofRef: Bytes<32>
}

export ledger attestations: Map<Address, Attestation>;

export circuit getSafetyAttestation(target: Address): Attestation {
  return attestations.lookup(target);
}`

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab === 'sdk' ? sdkCode : compactCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="developer" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono">
              <Terminal className="h-3.5 w-3.5" />
              <span>DEVELOPER INTEGRATION</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              Integrate SentinelZK into your dApp or Wallet
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Protect your users from rug pulls by checking the oracle prior to transaction broadcast.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center rounded-xl border border-white/10 bg-slate-900 p-1 text-xs">
            <button
              onClick={() => setActiveTab('sdk')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === 'sdk'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TypeScript SDK
            </button>
            <button
              onClick={() => setActiveTab('compact')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === 'compact'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Compact Interface
            </button>
          </div>
        </div>

        {/* Code Snippet Box */}
        <div className="relative rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-rose-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">
                {activeTab === 'sdk' ? 'verifyDeposit.ts' : 'SafetyOracle.compact'}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          <pre className="overflow-x-auto text-xs font-mono leading-relaxed text-slate-300">
            <code>{activeTab === 'sdk' ? sdkCode : compactCode}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
