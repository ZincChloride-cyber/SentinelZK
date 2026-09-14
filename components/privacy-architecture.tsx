import { Lock, EyeOff, Eye, CheckCircle2 } from 'lucide-react'

export function PrivacyArchitecture() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
          <Lock className="h-3.5 w-3.5" />
          <span>Cryptographic Architecture</span>
        </div>
        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Why Privacy-Preserving Security Matters
        </h2>
        <p className="mt-3 text-base text-slate-300">
          Public security audits teach attackers exactly what features trigger flags, allowing them
          to reverse-engineer evasion strategies. SentinelZK leverages Midnight to keep model
          intelligence private while publishing provable safety guarantees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
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
              <span>Exact continuous risk score (0-100)</span>
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
              <span>
                Boolean Safety Attestation (
                <code className="text-emerald-300">isSafe: true/false</code>)
              </span>
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
    </section>
  )
}
