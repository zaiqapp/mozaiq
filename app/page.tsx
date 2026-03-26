import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { AnimatedSection } from '@/components/landing/AnimatedSection'
import { Nav } from '@/components/landing/Nav'
import { Hero } from '@/components/landing/Hero'
import BentoGrid from '@/components/ui/bento-grid'
import PricingCard from '@/components/ui/pricing-card'

const glassBox = {
  className: 'rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] backdrop-blur-[8px] transition-colors hover:border-[rgba(255,255,255,0.18)]',
  style: { boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.06), inset -1px -1px 1px rgba(255,255,255,0.03)' },
}

// ---- Features (Bento Grid) ----
function Features() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedSection delay={0} className="mb-12 text-center">
          <h2
            className="text-3xl font-extrabold text-[#f9fafb]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Everything you need to ship dashboards fast
          </h2>
          <p className="mt-3 text-[#9ca3af]">No backend required. No data connections needed to start.</p>
        </AnimatedSection>
        <AnimatedSection delay={80}>
          <BentoGrid />
        </AnimatedSection>
      </div>
    </section>
  )
}

// ---- Templates Preview ----
const TEMPLATES = [
  { name: 'Analytics', desc: 'MRR, users, conversion, session time' },
  { name: 'Inventory', desc: 'SKUs, stock levels, turnover, value' },
  { name: 'Purchasing', desc: 'POs, vendor spend, lead times, delivery' },
]

function TemplatesPreview() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <AnimatedSection delay={0} className="mb-10 text-center">
          <h2
            className="text-3xl font-extrabold text-[#f9fafb]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Start from a template
          </h2>
          <p className="mt-3 text-[#9ca3af]">Or describe what you need and let AI build it for you</p>
        </AnimatedSection>

        <div className="grid grid-cols-3 gap-4">
          {TEMPLATES.map((t, i) => (
            <AnimatedSection key={t.name} delay={80 + i * 80}>
              <Link href="/builder">
                <div
                  className={`flex flex-col gap-2 p-6 ${glassBox.className}`}
                  style={glassBox.style}
                >
                  <h3 className="font-semibold text-[#f9fafb]">{t.name}</h3>
                  <p className="text-sm text-[#9ca3af]">{t.desc}</p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---- Pricing ----
function Pricing() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <AnimatedSection delay={0} className="mb-12 text-center">
          <h2
            className="text-3xl font-extrabold text-[#f9fafb]"
            style={{ letterSpacing: '-0.03em' }}
          >
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-[#9ca3af]">Open source — self-host for free forever</p>
        </AnimatedSection>

        <AnimatedSection delay={80}>
          <PricingCard />
        </AnimatedSection>
      </div>
    </section>
  )
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-6 py-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
          <span className="text-sm text-[#4b5563]">© 2026 Mozaiq — AGPL-3.0</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/zaiqapp/mozaiq" target="_blank" rel="noopener noreferrer" className="text-sm text-[#4b5563] hover:text-white">GitHub</a>
          <a href="https://github.com/zaiqapp/mozaiq#self-hosting" target="_blank" rel="noopener noreferrer" className="text-sm text-[#4b5563] hover:text-white">Self-host</a>
          <a href="https://github.com/zaiqapp/mozaiq/blob/main/ROADMAP.md" target="_blank" rel="noopener noreferrer" className="text-sm text-[#4b5563] hover:text-white">Roadmap</a>
        </div>
      </div>
    </footer>
  )
}

// ---- Page ----
export default async function LandingPage() {
  const { userId } = await auth()
  return (
    <div className="min-h-screen">
      <Nav userId={userId} />
      <Hero />
      <Features />
      <TemplatesPreview />
      <Pricing />
      <Footer />
    </div>
  )
}
