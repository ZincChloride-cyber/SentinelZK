'use client'

import React, { useState } from 'react'
import { Copy, Check, Terminal } from 'lucide-react'

export function DeveloperTab() {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'sdk' | 'compact'>('sdk')

  const sdkCode = `import { SentinelOracleClient } from '@sentinelzk/sdk'

const oracle = new SentinelOracleClient({ network: 'preprod' })

const { isSafe, proofRef } = await oracle.getSafetyAttestation(poolAddress)
if (!isSafe) throw new Error(\`Blocked: \${proofRef}\`)`

  const compactCode = `export struct Attestation {
  isSafe: Boolean,
  timestamp: Uint<64>,
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
    <section id="developer" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono">
              <Terminal className="h-3.5 w-3.5" />
              <span>SDK</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-1">
              Quick integration
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Check the oracle before broadcasting a deposit.
            </p>
          </div>

          <div className="flex items-center rounded-xl border border-white/10 bg-slate-900 p-1 text-xs">
            <button
              onClick={() => setActiveTab('sdk')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === 'sdk'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              TypeScript
            </button>
            <button
              onClick={() => setActiveTab('compact')}
              className={`rounded-lg px-3 py-1.5 font-medium transition ${
                activeTab === 'compact'
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Compact
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl border border-white/10 bg-slate-950 p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
            <span className="font-mono text-xs text-slate-400">
              {activeTab === 'sdk' ? 'verifyDeposit.ts' : 'SafetyOracle.compact'}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs text-slate-300 hover:bg-slate-800 transition"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
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
