'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ExternalLink,
  Activity,
  Layers,
  Database,
  CheckCircle,
} from 'lucide-react'
import { SentinelService } from '@/lib/sentinel-service'
import { ContractSafetyAttestation, OracleStats } from '@/lib/types'

export function OracleFeed() {
  const [attestations, setAttestations] = useState<ContractSafetyAttestation[]>([])
  const [stats, setStats] = useState<OracleStats | null>(null)

  useEffect(() => {
    SentinelService.getRecentAttestations().then(setAttestations)
    SentinelService.getOracleStats().then(setStats)
  }, [])

  const formatShort = (str: string) => {
    if (!str) return ''
    return `${str.slice(0, 6)}...${str.slice(-4)}`
  }

  return (
    <section id="oracle-feed" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
      {/* Network & Oracle Stats Counters */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-sm">
            <span className="text-xs text-slate-400">Total Attestations</span>
            <div className="mt-1 text-2xl font-extrabold font-mono text-white">
              {stats.totalAttestations.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
              <CheckCircle className="h-3 w-3" /> Midnight Preprod Synchronized
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-sm">
            <span className="text-xs text-slate-400">Verified Safe Pools</span>
            <div className="mt-1 text-2xl font-extrabold font-mono text-emerald-400">
              {stats.verifiedSafePools.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Risk score &lt; threshold
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-sm">
            <span className="text-xs text-slate-400">Exploits / Rugs Prevented</span>
            <div className="mt-1 text-2xl font-extrabold font-mono text-rose-400">
              {stats.exploitsPrevented}
            </div>
            <span className="text-[10px] text-rose-400/80 font-mono mt-1">
              Flagged before deposit
            </span>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-sm">
            <span className="text-xs text-slate-400">Avg Compact Proof Latency</span>
            <div className="mt-1 text-2xl font-extrabold font-mono text-cyan-400">
              {stats.avgProofTimeMs}ms
            </div>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              Midnight proving engine
            </span>
          </div>
        </div>
      )}

      {/* Feed Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>MIDNIGHT LEDGER ORACLE FEED</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
            Recent On-Chain Attestations
          </h2>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Oracle Contract: <span className="text-cyan-400">mn1_safety_oracle...8829</span>
        </div>
      </div>

      {/* Attestations Table / List */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 backdrop-blur-md shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-slate-950/80 text-slate-400 font-mono">
              <tr>
                <th className="px-6 py-3.5">Status &amp; Verdict</th>
                <th className="px-6 py-3.5">Contract / Target</th>
                <th className="px-6 py-3.5">Midnight Block</th>
                <th className="px-6 py-3.5">Model Version</th>
                <th className="px-6 py-3.5">Proof Reference</th>
                <th className="px-6 py-3.5 text-right">Age</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {attestations.map((item) => {
                const isSafe = item.verdict === 'SAFE'
                const isSuspicious = item.verdict === 'SUSPICIOUS'

                return (
                  <tr
                    key={item.targetAddress}
                    className="hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => {
                      const inspector = document.getElementById('inspector')
                      if (inspector) {
                        inspector.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                  >
                    <td className="px-6 py-4">
                      {isSafe ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          <span>SAFE</span>
                        </div>
                      ) : isSuspicious ? (
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2.5 py-1 text-amber-400 border border-amber-500/20 font-mono font-semibold">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          <span>SUSPICIOUS</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-rose-500/10 px-2.5 py-1 text-rose-400 border border-rose-500/20 font-mono font-semibold">
                          <ShieldAlert className="h-3.5 w-3.5" />
                          <span>EXPLOIT / RUG</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">
                        {item.targetName || 'Unlabeled Pool'}
                      </div>
                      <div className="font-mono text-slate-400 text-[11px]">
                        {formatShort(item.targetAddress)}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      #{item.proof.blockHeight.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-mono text-cyan-300">
                      {item.proof.modelVersionId}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400 text-[11px]">
                      {formatShort(item.proof.proofRef)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-400 font-mono">
                      {Math.round((Date.now() - item.proof.verifiedAt) / 60000)}m ago
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
