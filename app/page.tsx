import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { AnimatedSection } from '@/components/landing/AnimatedSection'
import { Nav } from '@/components/landing/Nav'
import { BentoGrid, type BentoItem } from '@/components/ui/bento-grid'
import { PricingCard } from '@/components/ui/pricing-card'
import { GlassEffect } from '@/components/ui/liquid-glass'

// ---- Hero ----
function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#080810] py-28 text-center">
      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      {/* Cyan orb */}
      <div className="pointer-events-none absolute left-[10%] top-[-80px] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18)_0%,transparent_70%)] blur-3xl" />
      {/* Indigo orb */}
      <div className="pointer-events-none absolute right-[10%] top-[-60px] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14)_0%,transparent_70%)] blur-3xl" />

      <div className="hero-fade relative mx-auto max-w-3xl px-6">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] px-3 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-cyan-300">
            AI-POWERED DASHBOARD BUILDER · OPEN SOURCE
          </span>
        </div>

        <h1 className="mb-4 text-5xl font-extrabold leading-tight tracking-tight" style={{ letterSpacing: '-0.03em' }}>
          <span className="text-white">Drag. Describe. Share.</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
            Dashboards in minutes.
          </span>
        </h1>

        <p className="mb-8 text-base text-[#4b5563]">
          Drag, drop, and describe. Mozaiq turns your data into shareable dashboards — no code required.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/builder"
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.3)] transition hover:opacity-90"
          >
            Start Building Free
          </Link>
          <GlassEffect>
            <a
              href="https://github.com/zaiqapp/mozaiq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-[#6b7280] transition hover:text-white"
            >
              View on GitHub →
            </a>
          </GlassEffect>
        </div>

        <div
          className="mx-auto mt-12 max-w-2xl rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] p-8 text-center backdrop-blur-[8px]"
          style={{
            boxShadow:
              'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
          }}
        >
          <p className="text-sm text-[#374151]">[ Builder screenshot / demo GIF ]</p>
        </div>
      </div>
    </section>
  )
}

// ---- Features (Bento Grid) ----
const FEATURES: BentoItem[] = [
  {
    title: 'Drag & Drop Builder',
    description: '11 widget types. Resize, reorder, configure inline.',
    colSpan: 2,
    hasPersistentHover: true,
    featured: true,
    tags: ['resize', 'reorder', 'inline config'],
  },
  {
    title: 'AI Generator',
    description: 'Describe your dashboard, get a full layout in seconds.',
    colSpan: 1,
    status: 'Included',
  },
  {
    title: 'Share Anywhere',
    description: 'One link. Embeddable via iframe. No login required.',
    colSpan: 1,
  },
  {
    title: 'Starter Templates',
    description: 'Analytics, Inventory, Purchasing — ready in one click.',
    colSpan: 1,
  },
  {
    title: 'Open Source',
    description: 'AGPL-3.0. Self-host forever. One-click deploy to Vercel.',
    colSpan: 1,
  },
  {
    title: 'Data Ready',
    description: 'Google Sheets, CSV, REST API connectors coming soon.',
    colSpan: 3,
    status: 'Coming soon',
    tags: ['Google Sheets', 'CSV', 'REST API'],
  },
]

function Features() {
  return (
    <section className="bg-[#080810] py-20">
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
          <BentoGrid items={FEATURES} />
        </AnimatedSection>
      </div>
    </section>
  )
}

// ---- Templates Preview ----
const TEMPLATES = [
  { name: 'Analytics', desc: 'MRR, users, conversion, session time' },
  { name: 'Inventory', desc: 'SKUs, stock levels, turnover, value', highlight: true },
  { name: 'Purchasing', desc: 'POs, vendor spend, lead times, delivery' },
]

function TemplatesPreview() {
  return (
    <section className="bg-[#080810] py-20">
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
              <Link
                href="/builder"
                className={`flex flex-col gap-2 rounded-xl border p-6 transition hover:border-cyan-500/40 ${
                  t.highlight
                    ? 'border-cyan-500/20 bg-[rgba(6,182,212,0.04)]'
                    : 'border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                <h3 className="font-semibold text-[#f9fafb]">{t.name}</h3>
                <p className="text-sm text-[#9ca3af]">{t.desc}</p>
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
    <section className="bg-[#080810] py-20">
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

        <div className="grid grid-cols-3 gap-6">
          {/* Free */}
          <AnimatedSection delay={80}>
            <PricingCard.Card>
              <PricingCard.Header>
                <PricingCard.Plan>
                  <PricingCard.PlanName>Free</PricingCard.PlanName>
                </PricingCard.Plan>
                <PricingCard.Price>
                  <PricingCard.MainPrice>$0</PricingCard.MainPrice>
                </PricingCard.Price>
              </PricingCard.Header>
              <PricingCard.Body>
                <PricingCard.List>
                  <PricingCard.ListItem>3 dashboards</PricingCard.ListItem>
                  <PricingCard.ListItem>Watermark on share</PricingCard.ListItem>
                  <PricingCard.ListItem>Community support</PricingCard.ListItem>
                </PricingCard.List>
                <Link
                  href="/builder"
                  className="mt-6 block w-full rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Start for free
                </Link>
              </PricingCard.Body>
            </PricingCard.Card>
          </AnimatedSection>

          {/* Pro */}
          <AnimatedSection delay={160}>
            <PricingCard.Card className="border-cyan-500/25">
              <PricingCard.Badge>Popular</PricingCard.Badge>
              <PricingCard.Header>
                <PricingCard.Plan>
                  <PricingCard.PlanName>Pro</PricingCard.PlanName>
                </PricingCard.Plan>
                <PricingCard.Price>
                  <PricingCard.MainPrice>$15</PricingCard.MainPrice>
                  <PricingCard.Period>/mo</PricingCard.Period>
                </PricingCard.Price>
              </PricingCard.Header>
              <PricingCard.Body>
                <PricingCard.List>
                  <PricingCard.ListItem>Unlimited dashboards</PricingCard.ListItem>
                  <PricingCard.ListItem>No watermark</PricingCard.ListItem>
                  <PricingCard.ListItem>✨ AI generator</PricingCard.ListItem>
                  <PricingCard.ListItem>Google Sheets + CSV</PricingCard.ListItem>
                  <PricingCard.ListItem>Priority support</PricingCard.ListItem>
                </PricingCard.List>
                <button
                  disabled
                  className="mt-6 w-full rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 py-2 text-sm font-semibold text-white opacity-60 cursor-not-allowed"
                >
                  Coming soon
                </button>
              </PricingCard.Body>
            </PricingCard.Card>
          </AnimatedSection>

          {/* White-label */}
          <AnimatedSection delay={240}>
            <PricingCard.Card>
              <PricingCard.Header>
                <PricingCard.Plan>
                  <PricingCard.PlanName>White-label</PricingCard.PlanName>
                </PricingCard.Plan>
                <PricingCard.Price>
                  <PricingCard.MainPrice>$199</PricingCard.MainPrice>
                  <PricingCard.Period>/mo</PricingCard.Period>
                </PricingCard.Price>
              </PricingCard.Header>
              <PricingCard.Body>
                <PricingCard.List>
                  <PricingCard.ListItem>Everything in Pro</PricingCard.ListItem>
                  <PricingCard.ListItem>Remove branding</PricingCard.ListItem>
                  <PricingCard.ListItem>Custom domain</PricingCard.ListItem>
                  <PricingCard.ListItem>Team access</PricingCard.ListItem>
                </PricingCard.List>
                <button
                  disabled
                  className="mt-6 w-full rounded-lg border border-[rgba(255,255,255,0.1)] py-2 text-sm text-[#6b7280] cursor-not-allowed"
                >
                  Coming soon
                </button>
              </PricingCard.Body>
            </PricingCard.Card>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-6 py-8 backdrop-blur-[8px]">
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
    <div className="min-h-screen bg-[#080810]">
      <Nav userId={userId} />
      <Hero />
      <Features />
      <TemplatesPreview />
      <Pricing />
      <Footer />
    </div>
  )
}
