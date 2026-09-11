'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Cpu,
  FileCode2,
  Layers,
  Fingerprint,
} from 'lucide-react'
import { ContractSafetyAttestation } from '@/lib/types'

interface AttestationVerdictTileProps {
  attestation: ContractSafetyAttestation
  isAnalyzing?: boolean
}

export function AttestationVerdictTile({
  attestation,
  isAnalyzing = false,
}: AttestationVerdictTileProps) {
  const [copiedTx, setCopiedTx] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)

  const isSafe = attestation.verdict === 'SAFE'
  const isSuspicious = attestation.verdict === 'SUSPICIOUS'

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setter(true)
    setTimeout(() => setter(false), 2000)
  }

  const formatAddress = (addr: string) => {
    if (addr.length < 16) return addr
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70 p-6 backdrop-blur-xl shadow-2xl transition-all">
      {/* Dynamic ambient glow based on verdict */}
      <div
        className={`pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full blur-[100px] opacity-25 ${
          isSafe
            ? 'bg-emerald-500'
            : isSuspicious
            ? 'bg-amber-500'
            : 'bg-rose-600'
        }`}
      />

      {/* Top Bar: Target Protocol & Address */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800/80 border border-white/10 text-cyan-400">
            <Fingerprint className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-white">
                {attestation.targetName || 'Observed Contract'}
              </h3>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-400 font-mono">
                {attestation.protocol || 'DeFi Pool'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>{attestation.targetAddress}</span>
              <button
                onClick={() => copyToClipboard(attestation.targetAddress, setCopiedHash)}
                className="text-slate-500 hover:text-slate-300 transition"
                title="Copy Address"
              >
                {copiedHash ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Midnight Status Pill */}
        <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">
          <Lock className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-mono">Midnight Preprod Verified</span>
        </div>
      </div>

      {/* Verdict Banner */}
      <div className="mt-6 rounded-xl border p-5 transition-all">
        {isSafe ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-emerald-500/20 bg-emerald-500/5 text-emerald-300">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold tracking-tight text-white">
                    VERIFIED SAFE
                  </span>
                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
                    Risk &lt; Threshold
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  {attestation.summary}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end text-xs font-mono text-slate-400 shrink-0">
              <span className="text-emerald-400 font-bold">DISCLOSED ON-CHAIN</span>
              <span>Boolean: isSafe = true</span>
            </div>
          </div>
        ) : isSuspicious ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-amber-500/20 bg-amber-500/5 text-amber-300">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.35)]">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold tracking-tight text-white">
                    SUSPICIOUS / ELEVATED RISK
                  </span>
                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
                    Caution Advised
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  {attestation.summary}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end text-xs font-mono text-slate-400 shrink-0">
              <span className="text-amber-400 font-bold">DISCLOSED ON-CHAIN</span>
              <span>Boolean: isSafe = false</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-rose-500/20 bg-rose-500/5 text-rose-300">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.35)]">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-bold tracking-tight text-white">
                    EXPLOIT / RUG DETECTED
                  </span>
                  <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/30">
                    Risk &gt;= Threshold
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-300">
                  {attestation.summary}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end text-xs font-mono text-slate-400 shrink-0">
              <span className="text-rose-400 font-bold">DISCLOSED ON-CHAIN</span>
              <span>Boolean: isSafe = false</span>
            </div>
          </div>
        )}
      </div>

      {/* ZK Cryptographic Integrity Card */}
      <div className="mt-6 rounded-xl border border-white/10 bg-slate-950/60 p-5">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Lock className="h-4 w-4 text-cyan-400" />
            <span>Zero-Knowledge Proof &amp; Model Integrity Binding</span>
          </div>
          <span className="font-mono text-xs text-cyan-400/90">
            Circuit: {attestation.proof.circuitName}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Item 1: Model Hash */}
          <div className="rounded-lg bg-slate-900/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-blue-400" />
              <span>Registered Model Hash</span>
            </div>
            <div className="mt-1.5 font-mono text-slate-200 truncate" title={attestation.proof.modelHash}>
              {formatAddress(attestation.proof.modelHash)}
            </div>
            <span className="mt-1 inline-block text-[10px] text-slate-500">
              Version: {attestation.proof.modelVersionId} (SHA-256 bound)
            </span>
          </div>

          {/* Item 2: Proof Statement */}
          <div className="rounded-lg bg-slate-900/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Layers className="h-3.5 w-3.5 text-cyan-400" />
              <span>Circuit Constraint</span>
            </div>
            <div className="mt-1.5 font-mono text-slate-200">
              risk_score &lt; {attestation.proof.threshold}
            </div>
            <span className="mt-1 inline-block text-[10px] text-cyan-400/80">
              Score kept private in ZK
            </span>
          </div>

          {/* Item 3: Midnight Block */}
          <div className="rounded-lg bg-slate-900/60 p-3 border border-white/5">
            <div className="flex items-center gap-1.5 text-slate-400">
              <FileCode2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>Midnight Block Height</span>
            </div>
            <div className="mt-1.5 font-mono text-slate-200">
              #{attestation.proof.blockHeight.toLocaleString()}
            </div>
            <span className="mt-1 inline-block text-[10px] text-slate-500">
              {new Date(attestation.proof.verifiedAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Item 4: Proof Reference */}
          <div className="rounded-lg bg-slate-900/60 p-3 border border-white/5">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Proof Tx Reference</span>
              </div>
              <button
                onClick={() => copyToClipboard(attestation.proof.proofRef, setCopiedTx)}
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedTx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <div className="mt-1.5 font-mono text-slate-200 truncate" title={attestation.proof.proofRef}>
              {formatAddress(attestation.proof.proofRef)}
            </div>
            <span className="mt-1 inline-block text-[10px] text-emerald-400">
              ZK-SNARK Verified
            </span>
          </div>
        </div>

        {/* Callout on why privacy matters */}
        <div className="mt-3 flex items-start gap-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 p-3 text-[11px] text-blue-200">
          <Lock className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
          <div>
            <span className="font-semibold text-cyan-300">Privacy Guarantee: </span>
            The exact risk score (0–100) and proprietary ML feature weights are strictly confidential private inputs to the Compact circuit. Attackers cannot observe or reverse-engineer evasion vectors. Only the boolean safety attestation is stored on-chain.
          </div>
        </div>
      </div>

      {/* Feature Telemetry Grid */}
      <div className="mt-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
          <span>Ingested On-Chain Telemetry Signals</span>
          <span className="text-[10px] font-normal text-slate-500">
            6 core risk indicators evaluated
          </span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* LP Removal Velocity */}
          <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">LP Removal Velocity</span>
              {attestation.telemetry.lpRemovalVelocity.isAnomalous ? (
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                  Drain Spike
                </span>
              ) : (
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  Normal
                </span>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold text-white font-mono">
              {attestation.telemetry.lpRemovalVelocity.label}
            </div>
          </div>

          {/* Admin Key Churn */}
          <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Admin Key Churn</span>
              {attestation.telemetry.ownershipChangeCount.isAnomalous ? (
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                  Suspicious
                </span>
              ) : (
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  Stable
                </span>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold text-white font-mono">
              {attestation.telemetry.ownershipChangeCount.label}
            </div>
          </div>

          {/* Top Holder Concentration */}
          <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Top Holder Concentration</span>
              {attestation.telemetry.topHolderConcentration.isAnomalous ? (
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                  Concentrated
                </span>
              ) : (
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  Distributed
                </span>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold text-white font-mono">
              {attestation.telemetry.topHolderConcentration.label}
            </div>
          </div>

          {/* Contract Age */}
          <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Operational Age</span>
              {attestation.telemetry.contractAgeDays.isAnomalous ? (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/30">
                  Freshly Deployed
                </span>
              ) : (
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  Established
                </span>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold text-white font-mono">
              {attestation.telemetry.contractAgeDays.label}
            </div>
          </div>

          {/* Source Verification */}
          <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Bytecode Verification</span>
              {attestation.telemetry.isVerifiedSource.isAnomalous ? (
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                  Unverified
                </span>
              ) : (
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  Verified
                </span>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold text-white font-mono">
              {attestation.telemetry.isVerifiedSource.label}
            </div>
          </div>

          {/* Holder Growth Rate */}
          <div className="rounded-lg border border-white/5 bg-slate-950/40 p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Unique Holder Growth</span>
              {attestation.telemetry.holderGrowthRate.isAnomalous ? (
                <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 border border-rose-500/30">
                  Rapid Outflow
                </span>
              ) : (
                <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/30">
                  Healthy Inflow
                </span>
              )}
            </div>
            <div className="mt-2 text-sm font-semibold text-white font-mono">
              {attestation.telemetry.holderGrowthRate.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
