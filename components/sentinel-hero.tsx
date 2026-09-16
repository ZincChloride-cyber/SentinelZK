'use client'

import Link from 'next/link'

export type SentinelHeroProps = {
  title?: string
  subtitle?: string
  ctaLabel?: string
  ctaHref?: string
  secondaryCtaLabel?: string
  secondaryCtaHref?: string
  height?: string | number
  className?: string
}

export default function SentinelHero({
  subtitle = 'Check a contract before you interact. SentinelZK scores risk off-chain, then posts a zero-knowledge safety attestation on Midnight, without exposing the model that produced it.',
  ctaLabel = 'Inspect Contract',
  ctaHref = '/inspector',
  secondaryCtaLabel = 'How ZK Works',
  secondaryCtaHref = '/how-it-works',
  height = '85vh',
  className = '',
}: SentinelHeroProps) {
  return (
    <section
      className={`relative z-10 overflow-hidden ${className}`}
      style={{ minHeight: height }}
      aria-label="SentinelZK hero"
    >
      <div className="relative z-10 flex min-h-full items-center justify-center px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="mb-5 text-sm font-medium tracking-wide text-cyan-300/90">
            SentinelZK on Midnight
          </p>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
            Know What&apos;s <span className="text-cyan-400">Safe to Sign</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition"
            >
              {ctaLabel}
            </Link>
            {secondaryCtaLabel && secondaryCtaHref && (
              <Link
                href={secondaryCtaHref}
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-slate-900/40 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md hover:bg-slate-800/60 transition"
              >
                {secondaryCtaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export { SentinelHero }
