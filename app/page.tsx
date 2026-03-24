import Link from 'next/link'

// ---- Nav ----
function Nav() {
  return (
    <nav className="flex items-center justify-between border-b border-[#1f2937] bg-[#0f1117] px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-indigo-600" />
        <span className="text-lg font-bold text-white">Mozaiq</span>
      </div>
      <div className="flex items-center gap-6">
        <a href="#" className="text-sm text-gray-400 hover:text-white transition">Docs</a>
        <a href="https://github.com/mozaiq/mozaiq" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition">GitHub</a>
        <Link href="/builder" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
          Start Building Free →
        </Link>
      </div>
    </nav>
  )
}

// ---- Hero ----
function Hero() {
  return (
    <section className="bg-gradient-to-br from-[#0f1117] to-[#1a1f2e] py-24 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-5 inline-block rounded-full border border-[#374151] bg-[#1f2937] px-4 py-1.5 text-xs text-indigo-300">
          ✨ AI-powered dashboard builder · Open source
        </div>
        <h1 className="mb-4 text-5xl font-extrabold leading-tight text-white">
          Build beautiful dashboards<br />
          <span className="text-indigo-400">in minutes</span>
        </h1>
        <p className="mb-8 text-lg text-gray-400">
          Drag, drop, and describe. Mozaiq turns your data into shareable dashboards — no code required.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/builder"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
          >
            Start Building Free
          </Link>
          <a
            href="https://github.com/mozaiq/mozaiq"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#374151] px-6 py-3 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white transition"
          >
            View on GitHub →
          </a>
        </div>
        <div className="mt-12 mx-auto max-w-2xl rounded-xl border border-[#374151] bg-[#1f2937] p-8 text-center">
          <p className="text-sm text-gray-500">[ Builder screenshot / demo GIF ]</p>
        </div>
      </div>
    </section>
  )
}

// ---- Features ----
const FEATURES = [
  { icon: '🧩', title: 'Drag & Drop Builder', desc: '11 widget types. Resize, reorder, configure inline.' },
  { icon: '✨', title: 'AI Generator', desc: 'Describe your dashboard, get a full layout in seconds.' },
  { icon: '🔗', title: 'Share Anywhere', desc: 'One link. Embeddable via iframe. No login required.' },
  { icon: '📋', title: 'Starter Templates', desc: 'Analytics, Inventory, Purchasing — ready in one click.' },
  { icon: '🔓', title: 'Open Source', desc: 'AGPL-3.0. Self-host forever. One-click deploy to Vercel.' },
  { icon: '📡', title: 'Data Ready', desc: 'Google Sheets, CSV, REST API connectors coming soon.', badge: 'v2' },
]

function Features() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Everything you need to ship dashboards fast</h2>
          <p className="mt-3 text-gray-500">No backend required. No data connections needed to start.</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-gray-100 bg-gray-50 p-6">
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="mb-1 font-semibold text-gray-900">
                {f.title}
                {f.badge && (
                  <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600">
                    {f.badge}
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---- Templates Preview ----
const TEMPLATES = [
  { icon: '📊', name: 'Analytics', desc: 'MRR, users, conversion, session time' },
  { icon: '📦', name: 'Inventory', desc: 'SKUs, stock levels, turnover, value' },
  { icon: '🛒', name: 'Purchasing', desc: 'POs, vendor spend, lead times, delivery' },
]

function TemplatesPreview() {
  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Start from a template</h2>
          <p className="mt-3 text-gray-500">Or describe what you need and let AI build it for you</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {TEMPLATES.map((t) => (
            <Link
              key={t.name}
              href="/builder"
              className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-6 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <div className="text-3xl">{t.icon}</div>
              <h3 className="font-semibold text-gray-900">{t.name}</h3>
              <p className="text-sm text-gray-500">{t.desc}</p>
            </Link>
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
    ctaHref: '/builder',
    ctaDisabled: false,
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$15',
    per: '/mo',
    features: ['Unlimited dashboards', 'No watermark', '✨ AI generator', 'Google Sheets + CSV', 'Priority support'],
    cta: 'Coming soon',
    ctaHref: null,
    ctaDisabled: true,
    highlight: true,
  },
  {
    name: 'White-label',
    price: '$199',
    per: '/mo',
    features: ['Everything in Pro', 'Remove branding', 'Custom domain', 'Team access'],
    cta: 'Coming soon',
    ctaHref: null,
    ctaDisabled: true,
    highlight: false,
  },
]

function Pricing() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-3 text-gray-500">Open source — self-host for free forever</p>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-6 ${plan.highlight ? 'border-indigo-500 shadow-md' : 'border-gray-200'}`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white whitespace-nowrap">
                  Most popular
                </div>
              )}
              <h3 className={`font-semibold ${plan.highlight ? 'text-indigo-600' : 'text-gray-900'}`}>{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
                {plan.per && <span className="text-sm text-gray-400">{plan.per}</span>}
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="text-sm text-gray-600">{f}</li>
                ))}
              </ul>
              {plan.ctaDisabled ? (
                <button
                  disabled
                  className="mt-6 w-full rounded-lg border border-gray-200 py-2 text-sm text-gray-400 cursor-not-allowed"
                >
                  {plan.cta}
                </button>
              ) : (
                <Link
                  href={plan.ctaHref!}
                  className="mt-6 block w-full rounded-lg bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  {plan.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---- Footer ----
function Footer() {
  return (
    <footer className="bg-[#0f1117] px-6 py-8">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-indigo-600" />
          <span className="text-sm text-gray-400">© 2026 Mozaiq — AGPL-3.0</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="https://github.com/mozaiq/mozaiq" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">GitHub</a>
          <a href="https://github.com/mozaiq/mozaiq#self-hosting" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">Self-host</a>
          <a href="https://github.com/mozaiq/mozaiq/blob/main/ROADMAP.md" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white">Roadmap</a>
        </div>
      </div>
    </footer>
  )
}

// ---- Page ----
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav />
      <Hero />
      <Features />
      <TemplatesPreview />
      <Pricing />
      <Footer />
    </div>
  )
}
