import { Header } from '@/components/navigation/header'
import { Footer } from '@/components/navigation/footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-cyan-500/30 font-sans">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
