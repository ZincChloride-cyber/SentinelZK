import Link from 'next/link'
import SentinelHero from '@/components/sentinel-hero'

export default function HomePage() {
  return (
    <>
      <SentinelHero
        subtitle="Check a contract before you interact. SentinelZK scores risk off-chain, then posts a zero-knowledge safety attestation on Midnight, without exposing the model that produced it."
        ctaHref="/inspector"
        secondaryCtaHref="/how-it-works"
      />

      <section className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          What this is
        </h2>
        <p className="mt-4 text-slate-300 leading-relaxed">
          Public audit rules tell attackers what to evade. SentinelZK keeps scoring logic private
          and only publishes what others need to verify: whether a pool or contract is safe to
          touch, that the model version is intact, and when the attestation was recorded.
        </p>
        <ul className="mt-8 space-y-4 text-sm text-slate-300">
          <li className="border-l-2 border-cyan-500/40 pl-4">
            <span className="font-medium text-white">Inspect</span>: query an address for an
            on-chain safety attestation.
          </li>
          <li className="border-l-2 border-cyan-500/40 pl-4">
            <span className="font-medium text-white">Prove</span>: Compact ZK circuits bind model
            integrity to a boolean verdict.
          </li>
          <li className="border-l-2 border-cyan-500/40 pl-4">
            <span className="font-medium text-white">Integrate</span>: wallets and dApps can check
            the oracle before a user confirms a deposit.
          </li>
        </ul>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/inspector"
            className="inline-flex items-center rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
          >
            Open Inspector
          </Link>
          <Link
            href="/faqs"
            className="inline-flex items-center rounded-xl border border-white/15 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5 transition"
          >
            FAQs
          </Link>
        </div>
      </section>
    </>
  )
}
