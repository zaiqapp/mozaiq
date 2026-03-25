import Link from 'next/link'
import { AnimatedSection } from '@/components/landing/AnimatedSection'

// ---- Nav ----
function Nav() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-[rgba(255,255,255,0.05)] bg-[rgba(8,8,16,0.8)] px-6 py-4 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
        <span className="text-sm font-bold text-white">Mozaiq</span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#" className="text-sm text-[#4b5563] transition hover:text-white">Docs</a>
        <a href="https://github.com/zaiqapp/mozaiq" target="_blank" rel="noopener noreferrer" className="text-sm text-[#4b5563] transition hover:text-white">GitHub</a>
        <Link
          href="/builder"
          className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Start free →
        </Link>
      </div>
    </nav>
  )
}

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
          <a
            href="https://github.com/zaiqapp/mozaiq"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-semibold text-[#6b7280] transition hover:border-[rgba(255,255,255,0.2)] hover:text-white"
          >
            View on GitHub →
          </a>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-8 text-center">
          <p className="text-sm text-[#374151]">[ Builder screenshot / demo GIF ]</p>
        </div>
      </div>
    </section>
  )
}

// ---- Features (Bento Grid) ----
const FEATURES = [
  { title: 'Drag & Drop Builder', desc: '11 widget types. Resize, reorder, configure inline.', featured: true },
  { title: 'AI Generator', desc: 'Describe your dashboard, get a full layout in seconds.', featured: false },
  { title: 'Share Anywhere', desc: 'One link. Embeddable via iframe. No login required.', featured: false },
  { title: 'Starter Templates', desc: 'Analytics, Inventory, Purchasing — ready in one click.', featured: false },
  { title: 'Open Source', desc: 'AGPL-3.0. Self-host forever. One-click deploy to Vercel.', featured: false },
  { title: 'Data Ready', desc: 'Google Sheets, CSV, REST API connectors coming soon.', featured: false },
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

        <div className="grid grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <AnimatedSection
              key={f.title}
              delay={80 + i * 80}
              className={f.featured ? 'col-span-2' : 'col-span-1'}
            >
              <div
                className={`h-full rounded-xl border p-5 ${
                  f.featured
                    ? 'border-[rgba(6,182,212,0.14)] bg-[rgba(6,182,212,0.04)]'
                    : 'border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-cyan-400">
                  ✦ {f.title}
                </span>
                <p className="text-sm text-[#9ca3af]">{f.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
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
const PLANS = [
  {
    name: 'Free',
    price: '$0',
    features: ['3 dashboards', 'Watermark on share', 'Community support'],
    cta: 'Start for free',
    ctaHref: '/builder' as string | null,
    ctaDisabled: false,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$15',
    per: '/mo',
    features: ['Unlimited dashboards', 'No watermark', '✨ AI generator', 'Google Sheets + CSV', 'Priority support'],
    cta: 'Coming soon',
    ctaHref: null as string | null,
    ctaDisabled: true,
    highlight: true,
  },
  {
    name: 'White-label',
    price: '$199',
    per: '/mo',
    features: ['Everything in Pro', 'Remove branding', 'Custom domain', 'Team access'],
    cta: 'Coming soon',
    ctaHref: null as string | null,
    ctaDisabled: true,
    highlight: false,
  },
]

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
          {PLANS.map((plan, i) => (
            <AnimatedSection key={plan.name} delay={80 + i * 80}>
              <div
                className={`relative h-full rounded-xl border p-6 ${
                  plan.highlight
                    ? 'border-cyan-500/30 bg-[rgba(6,182,212,0.05)]'
                    : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </div>
                )}
                <h3 className="font-semibold text-[#f9fafb]">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-[#f9fafb]">{plan.price}</span>
                  {plan.per && <span className="text-sm text-[#4b5563]">{plan.per}</span>}
                </div>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="text-sm text-[#9ca3af]">{f}</li>
                  ))}
                </ul>
                {plan.ctaDisabled ? (
                  <button
                    disabled
                    className="mt-6 w-full rounded-lg border border-[rgba(255,255,255,0.1)] py-2 text-sm text-[#6b7280] cursor-not-allowed"
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <Link
                    href={plan.ctaHref!}
                    className="mt-6 block w-full rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {plan.cta}
                  </Link>
                )}
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)] bg-[#080810] px-6 py-8">
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
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810]">
      <Nav />
      <Hero />
      <Features />
      <TemplatesPreview />
      <Pricing />
      <Footer />
    </div>
  )
}
