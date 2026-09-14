'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'What does SentinelZK actually publish on-chain?',
    answer:
      'Only a boolean safety attestation (isSafe), a model integrity hash, the target contract address, and a Midnight ledger timestamp. The raw risk score and model weights stay private.',
  },
  {
    question: 'Why keep the risk score private?',
    answer:
      'Publishing exact scores or thresholds lets attackers reverse-engineer what triggers a flag. Zero-knowledge proofs let others verify the verdict without seeing the scoring logic.',
  },
  {
    question: 'Which network is this running on?',
    answer:
      'Attestations target Midnight Preprod for the WaveHack demo. The same Compact oracle interface is intended to move to Midnight mainnet when the deployment path is ready.',
  },
  {
    question: 'How do wallets or DEXs use this?',
    answer:
      'Call the oracle with a pool or contract address before the user confirms a deposit. If isSafe is false, block or warn on the transaction and surface the proof reference.',
  },
  {
    question: 'What signals feed the risk model?',
    answer:
      'Live pool telemetry such as liquidity removal velocity, holder concentration, privileged admin transfers, and related on-chain behavior. Exact feature weights remain confidential.',
  },
  {
    question: 'Is an attestation a substitute for an audit?',
    answer:
      'No. It is a continuous oracle signal for interaction risk, not a legal or code audit. Use it as a pre-transaction check alongside your own diligence.',
  },
]

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faqs" className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          FAQs
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Common questions about privacy, attestations, and integration.
        </p>

        <div className="mt-8 divide-y divide-white/10 border-y border-white/10">
          {faqs.map((faq, index) => {
            const open = openIndex === index
            return (
              <div key={faq.question}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-slate-400 transition ${
                      open ? 'rotate-180 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {open ? (
                  <p className="pb-4 text-sm text-slate-300 leading-relaxed">{faq.answer}</p>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
