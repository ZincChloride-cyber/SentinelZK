import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "SentinelZK: Know what's safe to sign",
  description: 'Cryptographically verified smart contract attestations before you interact onchain.',
  generator: 'SentinelZK',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#05070d',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
