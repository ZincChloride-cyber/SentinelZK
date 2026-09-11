'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  Sparkles,
  CheckCircle2,
  Cpu,
  Lock,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react'
import { SentinelService, DEMO_PRESETS } from '@/lib/sentinel-service'
import { ContractSafetyAttestation, AnalysisProgress } from '@/lib/types'
import { AttestationVerdictTile } from '@/components/tiles/attestation-verdict-tile'

export function ContractInspector() {
  const [targetAddress, setTargetAddress] = useState(
    '0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640'
  )
  const [attestation, setAttestation] = useState<ContractSafetyAttestation | null>(
    null
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState<AnalysisProgress | null>(null)

  // Initialize with the safe pool preset on mount
  useEffect(() => {
    SentinelService.getAttestation(targetAddress).then((data) => {
      setAttestation(data)
    })
  }, [])

  const handleInspect = async (addressToInspect?: string) => {
    const addr = addressToInspect || targetAddress
    if (!addr.trim()) return

    setIsAnalyzing(true)
    setProgress(null)

    try {
      const result = await SentinelService.analyzeWithProgress(
        addr,
        (currentProgress) => {
          setProgress(currentProgress)
        }
      )
      setAttestation(result)
    } catch (err) {
      console.error('Failed to analyze contract:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const selectPreset = (presetAddr: string) => {
    setTargetAddress(presetAddr)
    handleInspect(presetAddr)
  }

  return (
    <section id="inspector" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-1 text-xs font-semibold text-cyan-300">
          <Activity className="h-3.5 w-3.5" />
          <span>Interactive Oracle Inspector</span>
        </div>
        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Inspect Any Smart Contract or Liquidity Pool
        </h2>
        <p className="mt-3 text-base text-slate-300">
          Query on-chain zero-knowledge safety attestations. Our Compact circuit binds the ML model integrity hash and validates the risk threshold without exposing the underlying detection weights.
        </p>
      </div>

      {/* Search Bar & Demo Presets Container */}
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:p-6 backdrop-blur-xl shadow-2xl">
        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleInspect()
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              placeholder="Paste contract address (0x... or Midnight address)"
              className="w-full rounded-xl border border-white/10 bg-slate-950/80 pl-11 pr-4 py-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono transition"
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3.5 text-sm font-semibold text-slate-950 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0"
          >
            {isAnalyzing ? (
              <>
                <div className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Evaluating ZK Proof...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Verify Attestation</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Preset Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 text-xs">
          <span className="text-slate-400 font-medium mr-1">Demo Scenarios:</span>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.address}
              onClick={() => selectPreset(preset.address)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 transition ${preset.badgeClass} hover:opacity-80`}
            >
              <span className="font-medium">{preset.name}</span>
              <span className="opacity-75">({preset.tag})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Stepper Card (Visible while evaluating or just finished) */}
      {isAnalyzing && progress && (
        <div className="mx-auto max-w-4xl mt-6 rounded-xl border border-cyan-500/30 bg-slate-900/90 p-5 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between text-xs text-cyan-400 font-mono mb-3">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              Stage {progress.stepNumber} of {progress.totalSteps}: {progress.stage.replace('_', ' ').toUpperCase()}
            </span>
            <span>{Math.round((progress.stepNumber / progress.totalSteps) * 100)}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(progress.stepNumber / progress.totalSteps) * 100}%` }}
            />
          </div>

          <p className="mt-3 text-xs text-slate-300 flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            <span>{progress.message}</span>
          </p>
        </div>
      )}

      {/* Attestation Verdict Tile Output */}
      {attestation && (
        <div className="mx-auto max-w-4xl mt-8">
          <AttestationVerdictTile
            attestation={attestation}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}
    </section>
  )
}
