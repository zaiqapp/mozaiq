# Landing Page & Builder UI Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernise the Mozaiq landing page and builder UI to match a Linear/Framer-style dark aesthetic — full dark background, cyan/indigo accent palette, dot grid hero, bento grid features, scroll animations, and a dark builder canvas with dark tooling surfaces.

**Architecture:** Pure CSS/Tailwind class changes across 7 files — no new state, no logic changes, no new dependencies. A single new client component (`AnimatedSection`) provides scroll-triggered fade-in via IntersectionObserver. The landing page (`app/page.tsx`) is fully rewritten; all builder files (`Toolbar`, `RightPanel`, `BuilderCanvas`, `AIGeneratorBar`) receive targeted class replacements only.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, TypeScript. No animation libraries — pure CSS keyframes + IntersectionObserver.

**Spec:** `docs/superpowers/specs/2026-03-24-landing-page-builder-redesign.md`

---

## File Map

| File | Action | What changes |
|---|---|---|
| `app/globals.css` | Modify | Append `@layer utilities` block + `@keyframes heroFade` at end of file |
| `components/landing/AnimatedSection.tsx` | Create | New client component for scroll-triggered fade-in |
| `app/page.tsx` | Full rewrite | Dark landing page: nav, hero, bento features, templates, pricing, footer |
| `components/builder/BuilderCanvas.tsx` | Modify | Canvas bg, `relative` on wrapper, dot-grid overlay, empty state text |
| `components/builder/RightPanel.tsx` | Modify | Dark aside bg, dark inputs/labels, dark color picker, dark collapse button |
| `components/builder/Toolbar.tsx` | Modify | Dark header, gradient logo, dark text/buttons |
| `components/builder/AIGeneratorBar.tsx` | Modify | Dark container, cyan Sparkles, dark placeholder, gradient Generate button |

---

## Task 1: CSS Animations Foundation

**Files:**
- Modify: `app/globals.css` (append to end of file)

These animation classes are required by the landing page before it can be implemented. Do them first so later tasks can reference them.

- [ ] **Step 1: Open `app/globals.css` and verify it ends around line 130 with the `@layer base` block**

  The file currently has no `@layer utilities` block and no `@keyframes`. Confirm before editing.

- [ ] **Step 2: Append the animation CSS to the end of `app/globals.css`**

  Add exactly this — the `@keyframes` must be top-level (outside any `@layer`):

  ```css
  @layer utilities {
    .hero-fade {
      animation: heroFade 0.6s ease forwards;
    }
    .fade-up {
      opacity: 0;
      transform: translateY(20px);
      transition: opacity 0.5s ease, transform 0.5s ease;
    }
    .fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes heroFade {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  ```

- [ ] **Step 3: Verify TypeScript build compiles with no errors**

  Run: `npx tsc --noEmit`
  Expected: no output (zero errors)

- [ ] **Step 4: Commit**

  ```bash
  git add app/globals.css
  git commit -m "style: add hero-fade and fade-up animation utilities"
  ```

---

## Task 2: AnimatedSection Client Component

**Files:**
- Create: `components/landing/AnimatedSection.tsx`

This component wraps any content and fades it in when it scrolls into view. Used by the landing page for section headings and bento cards.

- [ ] **Step 1: Create the directory if it doesn't exist**

  Check: does `components/landing/` exist? If not, the file creation will create it.

- [ ] **Step 2: Create `components/landing/AnimatedSection.tsx` with this exact content**

  ```tsx
  'use client'
  import { useEffect, useRef } from 'react'

  interface Props {
    children: React.ReactNode
    delay?: number      // ms, default 0
    className?: string
  }

  export function AnimatedSection({ children, delay = 0, className = '' }: Props) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const el = ref.current
      if (!el) return
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); observer.disconnect() } },
        { threshold: 0.1 }
      )
      observer.observe(el)
      return () => observer.disconnect()
    }, [])

    return (
      <div
        ref={ref}
        className={`fade-up ${className}`}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    )
  }
  ```

- [ ] **Step 3: Run TypeScript check**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 4: Commit**

  ```bash
  git add components/landing/AnimatedSection.tsx
  git commit -m "feat: add AnimatedSection scroll-fade client component"
  ```

---

## Task 3: Landing Page Full Rewrite

**Files:**
- Modify: `app/page.tsx` (full replacement)

This is the biggest task. Replace the entire file. Study the current structure first (Nav, Hero, Features, TemplatesPreview, Pricing, Footer, LandingPage), then replace with the dark version below.

Key rules:
- Root `<div>` gets `bg-[#080810]`
- All section backgrounds: `bg-[#080810]`
- Bento grid: `grid-cols-3`, "Drag & Drop Builder" is `col-span-2`, all others `col-span-1`
- All 6 items from the `FEATURES` array must be preserved (titles + descriptions unchanged)
- Hero animation class: `hero-fade` on the content wrapper div (Server Component safe — pure CSS)
- Section headings wrapped in `<AnimatedSection delay={0}>`
- Feature/template/pricing cards wrapped in `<AnimatedSection delay={80 + i * 80}>` (stagger)
- `AnimatedSection` is `'use client'` — importing it into a Server Component is fine (Next.js RSC boundary)
- `TEMPLATES` and `PLANS` arrays keep the same data

- [ ] **Step 1: Read `app/page.tsx` to confirm current content before overwriting**

  Verify the FEATURES array has exactly 6 items and note the exact title/desc strings — they must be preserved.

- [ ] **Step 2: Replace `app/page.tsx` with the full dark version**

  ```tsx
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
  ```

- [ ] **Step 3: Run TypeScript check**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 4: Commit**

  ```bash
  git add app/page.tsx
  git commit -m "feat: redesign landing page — dark Linear/Framer aesthetic"
  ```

---

## Task 4: Builder Canvas Dark Treatment

**Files:**
- Modify: `components/builder/BuilderCanvas.tsx`

Three changes: canvas background, dot-grid overlay on wrapper, empty state text colour. The `containerRef` is already on the outermost `<div>` — add `relative` to that div so the absolute overlay is contained within it.

- [ ] **Step 1: Make these targeted edits to `components/builder/BuilderCanvas.tsx`**

  **Change 1** — Outer div: add `relative` and change bg:

  Old:
  ```tsx
  <div
    ref={containerRef}
    className="flex flex-col bg-[#f4f5f7] p-3"
    onClick={() => selectWidget(null)}
  >
  ```

  New:
  ```tsx
  <div
    ref={containerRef}
    className="relative flex flex-col bg-[#0f1117] p-3"
    onClick={() => selectWidget(null)}
  >
    {/* Dot grid overlay */}
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
        backgroundSize: '25px 25px',
      }}
    />
  ```

  **Change 2** — Empty state text colour:

  Old:
  ```tsx
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-gray-400">
  ```

  New:
  ```tsx
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-[#4b5563]">
  ```

- [ ] **Step 2: Run TypeScript check**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 3: Commit**

  ```bash
  git add components/builder/BuilderCanvas.tsx
  git commit -m "style: dark canvas bg with dot-grid overlay"
  ```

---

## Task 5: Right Panel Dark Treatment

**Files:**
- Modify: `components/builder/RightPanel.tsx`

Replace all light-themed classes. There are two render paths: the collapsed state (narrow aside) and the full panel. Both `<aside>` elements and the collapse `<button>` need dark treatment.

- [ ] **Step 1: Apply all class replacements to `components/builder/RightPanel.tsx`**

  **Collapsed aside** (line 16):
  Old: `className="relative flex w-6 flex-shrink-0 border-l bg-white"`
  New: `className="relative flex w-6 flex-shrink-0 border-l border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]"`

  **Collapsed collapse button** (line 17):
  Old: `className="absolute -left-3 top-4 rounded-full border bg-white p-0.5 shadow"`
  New: `className="absolute -left-3 top-4 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#0a0a0f] p-0.5 text-[#4b5563]"`

  **Full aside** (line 25):
  Old: `className="relative flex h-full w-[280px] flex-shrink-0 flex-col border-l bg-white"`
  New: `className="relative flex h-full w-[280px] flex-shrink-0 flex-col border-l border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]"`

  **Full collapse button** (line 26):
  Old: `className="absolute -left-3 top-4 rounded-full border bg-white p-0.5 shadow"`
  New: `className="absolute -left-3 top-4 rounded-full border border-[rgba(255,255,255,0.1)] bg-[#0a0a0f] p-0.5 text-[#4b5563]"`

  **Empty state text** (line 32):
  Old: `className="text-center text-xs text-gray-400"`
  New: `className="text-center text-xs text-[#4b5563]"`

  **"General" section label** (line 37):
  Old: `className="mb-1 text-[10px] uppercase tracking-wider text-gray-400"`
  New: `className="mb-1 text-[10px] uppercase tracking-wider text-[#374151]"`

  **Title label** (line 38):
  Old: `className="mb-1 block text-xs text-gray-600"`
  New: `className="mb-1 block text-xs text-[#4b5563]"`

  **Title input AND Description textarea** (lines 39–50 — both share identical old/new class strings, use `replace_all`):
  Old: `className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-indigo-400"`
  New: `className="w-full rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] px-2 py-1.5 text-sm text-[#9ca3af] outline-none focus:border-cyan-500/50"`
  > Use `replace_all: true` — this string appears on both the `<input>` (line 40) and `<textarea>` (line 46) and the replacement is identical for both.

  **Description label** (line 44):
  Old: `className="mb-1 mt-2 block text-xs text-gray-600"`
  New: `className="mb-1 mt-2 block text-xs text-[#4b5563]"`

  **"Appearance" section label** (line 55):
  Old: `className="mb-1 text-[10px] uppercase tracking-wider text-gray-400"`
  New: `className="mb-1 text-[10px] uppercase tracking-wider text-[#374151]"`

  **"Accent Color" label** (line 56):
  Old: `className="mb-1 block text-xs text-gray-600"`
  New: `className="mb-1 block text-xs text-[#4b5563]"`

  **Color input** (line 57–61):
  Old: `className="h-8 w-full cursor-pointer rounded border"`
  New: `className="h-8 w-full cursor-pointer rounded border border-[rgba(255,255,255,0.1)]"`

  **"Data" section label** (line 67):
  Old: `className="mb-1 text-[10px] uppercase tracking-wider text-gray-400"`
  New: `className="mb-1 text-[10px] uppercase tracking-wider text-[#374151]"`

  **Data placeholder text** (line 68):
  Old: `className="text-xs text-gray-400"`
  New: `className="text-xs text-[#4b5563]"`

- [ ] **Step 2: Run TypeScript check**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 3: Commit**

  ```bash
  git add components/builder/RightPanel.tsx
  git commit -m "style: dark right panel — bg, inputs, labels, collapse button"
  ```

---

## Task 6: Toolbar Dark Treatment

**Files:**
- Modify: `components/builder/Toolbar.tsx`

Replace the white header and all light-themed elements. The logo square becomes a gradient, all text colours go dark-palette, buttons get dark borders.

- [ ] **Step 1: Apply all class replacements to `components/builder/Toolbar.tsx`**

  **`<header>`** (line 30):
  Old: `className="flex h-12 items-center justify-between border-b bg-white px-4"`
  New: `className="flex h-12 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0f] px-4"`

  **Logo square** (line 33):
  Old: `<div className="h-6 w-6 rounded bg-indigo-600" />`
  New: `<div className="h-6 w-6 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />`

  **"Mozaiq" text** (line 34):
  Old: `<span className="text-sm font-bold text-gray-900">Mozaiq</span>`
  New: `<span className="text-sm font-bold text-[#f9fafb]">Mozaiq</span>`

  **Separator** (line 36):
  Old: `<span className="text-gray-300">|</span>`
  New: `<span className="text-[rgba(255,255,255,0.15)]">|</span>`

  **Name edit input** (line 38–44):
  Old: `className="rounded border border-indigo-300 px-2 py-0.5 text-sm outline-none"`
  New: `className="rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-sm text-[#f9fafb] outline-none focus:border-cyan-500/50"`

  **Dashboard name span** (line 47–50):
  Old: `className="cursor-pointer text-sm text-gray-700 hover:text-indigo-600"`
  New: `className="cursor-pointer text-sm text-[#9ca3af] hover:text-[#f9fafb]"`

  **Dirty dot** (line 54):
  Old: `<span className="text-xs text-gray-400">•</span>`
  New: `<span className="text-xs text-[#4b5563]">•</span>`

  **Clear button** (line 58–62):
  Old: `className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"`
  New: `className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]"`

  **Save button** (line 64–70):
  Old: `className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"`
  New: `className="flex items-center gap-1.5 rounded border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50"`

  **Share button** (line 72–76):
  Old: `className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"`
  New: `className="flex items-center gap-1.5 rounded border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]"`

  **Preview Link** (line 79–85):
  Old: `className="flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"`
  New: `className="flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs text-white hover:opacity-90"`

- [ ] **Step 2: Run TypeScript check**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 3: Commit**

  ```bash
  git add components/builder/Toolbar.tsx
  git commit -m "style: dark toolbar — header bg, gradient logo, dark buttons"
  ```

---

## Task 7: AI Generator Bar Dark Treatment

**Files:**
- Modify: `components/builder/AIGeneratorBar.tsx`

Four targeted changes: container border/bg, Sparkles icon colour, input placeholder colour, Generate button gradient.

- [ ] **Step 1: Apply all class replacements to `components/builder/AIGeneratorBar.tsx`**

  **Container div** (line 23):
  Old: `className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm"`
  New: `className="flex items-center gap-2 rounded-lg border border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.04)] px-3 py-2"`

  **Sparkles icon** (line 24):
  Old: `className="h-4 w-4 flex-shrink-0 text-indigo-400"`
  New: `className="h-4 w-4 flex-shrink-0 text-cyan-400"`

  **Input** (line 25–30):
  Old: `className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"`
  New: `className="flex-1 bg-transparent text-sm text-[#9ca3af] outline-none placeholder:text-[#374151]"`

  **Generate button** (line 33–37):
  Old: `className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:bg-indigo-700"`
  New: `className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:opacity-90"`

- [ ] **Step 2: Run TypeScript check**

  Run: `npx tsc --noEmit`
  Expected: no errors

- [ ] **Step 3: Commit**

  ```bash
  git add components/builder/AIGeneratorBar.tsx
  git commit -m "style: dark AI generator bar — container, icon, input, button"
  ```

---

## Final Verification

- [ ] **Run full TypeScript check**

  Run: `npx tsc --noEmit`
  Expected: zero errors

- [ ] **Start dev server and visually verify**

  Run: `npm run dev`

  Landing page checks (visit `http://localhost:3000`):
  - [ ] Background is near-black `#080810` throughout (no white sections)
  - [ ] Nav is sticky, frosted glass, correct gradient logo + "Start free →" gradient button
  - [ ] Hero has dot grid texture and two ambient orbs visible
  - [ ] Hero content fades in on load (hero-fade animation)
  - [ ] Badge pill visible with pulsing dot
  - [ ] H1 line 2 "Dashboards in minutes." has cyan→indigo gradient text
  - [ ] CTAs: primary has gradient + glow, secondary has ghost border
  - [ ] Features bento grid: "Drag & Drop Builder" spans 2 cols, 5 others span 1 col
  - [ ] Scroll down — section headings and cards fade in with stagger
  - [ ] Templates middle card ("Inventory") has cyan highlight border
  - [ ] Pricing Pro card has gradient "Most popular" badge
  - [ ] Footer dark with gradient logo

  Builder checks (visit `http://localhost:3000/builder`):
  - [ ] Toolbar is dark with gradient logo square and muted text
  - [ ] Canvas is dark `#0f1117` with subtle dot grid visible
  - [ ] AI bar has cyan border/tint, cyan Sparkles icon, gradient Generate button
  - [ ] Right panel is dark, inputs have dark borders, labels are dimmed
  - [ ] Collapse button has dark border and bg

- [ ] **Push to remote**

  ```bash
  git push origin master
  ```
