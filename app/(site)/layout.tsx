import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'
import { SiteBackground } from '@/components/site-background'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-transparent text-white selection:bg-cyan-500/30 font-sans">
      <SiteBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  )
}
