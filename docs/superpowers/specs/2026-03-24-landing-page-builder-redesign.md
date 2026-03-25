# Landing Page & Builder UI Redesign

## Goal

Modernise the Mozaiq landing page and builder UI to match a Linear/Framer-style dark aesthetic — full dark background throughout, cyan/indigo accent palette, dot grid hero, bento grid features, scroll animations, and a dark builder canvas with elevated widget cards.

## Colour Palette

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#080810` | Landing page background, nav, footer, section backgrounds |
| `bg-surface` | `#0a0a0f` | Toolbar, sidebars, right panel — slightly darker for surface elevation via border only |
| `bg-canvas` | `#0f1117` | Builder canvas background |
| `bg-widget` | `#161b27` | Widget card backgrounds |
| `border-subtle` | `rgba(255,255,255,0.06)` | Dividers, card borders |
| `border-accent` | `rgba(6,182,212,0.2)` | Highlighted card borders |
| `cyan` | `#06b6d4` | Primary accent, glow, pill badges |
| `indigo` | `#6366f1` | Secondary accent, gradient pair |
| `text-primary` | `#f9fafb` | Headings |
| `text-secondary` | `#9ca3af` | Body text |
| `text-muted` | `#4b5563` | Subtitles, labels |
| `text-dim` | `#374151` | Placeholder, disabled |

All gradients: `linear-gradient(135deg, #06b6d4, #6366f1)`

Note: `#080810` and `#0a0a0f` are intentionally near-identical. The visual separation between landing sections and builder surfaces comes from borders, not background contrast.

## Typography

- **Font**: Geist Sans — registered in `app/layout.tsx` as CSS variable `--font-geist` (not `--font-geist-sans`). The body applies `${geist.variable}` which emits `--font-geist`. Do not rename or modify the variable. Use `font-sans` Tailwind class (which maps to Geist through the existing `@theme` block in `globals.css`) or `font-[family-name:var(--font-geist)]` for explicit reference.
- **Heading style**: `font-weight: 800`, `letter-spacing: -0.03em` to `-0.04em`
- **Body**: `font-weight: 400–500`, normal tracking
- **Labels/badges**: uppercase, `letter-spacing: 0.05em`, 10–11px

## Landing Page — Section by Section

### Root wrapper

Change the `LandingPage` root `<div>` from `className="min-h-screen bg-white"` to `className="min-h-screen bg-[#080810]"`.

### Nav

- Full-width, `bg-[rgba(8,8,16,0.8)]`, `backdrop-blur-md`
- `border-b border-[rgba(255,255,255,0.05)]`
- `sticky top-0 z-50`
- Left: 16×16 gradient logo square (`bg-gradient-to-br from-cyan-400 to-indigo-600 rounded`) + "Mozaiq" bold
- Right: Docs, GitHub links (muted) + "Start free →" gradient button

### Hero

- `bg-[#080810]`, `relative overflow-hidden`
- Dot grid: absolute inset pseudo-element using `background-image: radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)`, `background-size: 22px 22px`
- Two `absolute` radial glow divs: cyan orb top-left (`rgba(6,182,212,0.18)`), indigo orb top-right (`rgba(99,102,241,0.14)`), both `rounded-full blur-3xl pointer-events-none`
- Badge pill: `border border-cyan-500/25 bg-cyan-500/[0.06] rounded-full px-3 py-1` (6% opacity tint — intentionally very faint), pulsing dot `w-1.5 h-1.5 bg-cyan-400 rounded-full`, text "AI-POWERED DASHBOARD BUILDER · OPEN SOURCE"
- H1 line 1: "Drag. Describe. Share." — `text-5xl font-extrabold tracking-tighter text-white`
- H1 line 2: "Dashboards in minutes." — same size, `bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent`
- Subtext: `text-base text-[#4b5563]`
- CTAs: gradient primary with `shadow-[0_0_24px_rgba(6,182,212,0.3)]` + ghost secondary
- Demo placeholder: `border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] rounded-xl`
- Hero animation: apply `hero-fade` CSS class (defined in `globals.css`) to the hero content wrapper — pure CSS, no JS, works in Server Component

### Features (Bento Grid)

6 features in a `grid grid-cols-3 gap-4` layout. "Drag & Drop Builder" is `col-span-2`. All others are `col-span-1`. Natural grid flow produces:

```
Row 1: [Drag & Drop — col-span-2] [AI Generator — col-span-1]
Row 2: [Share Anywhere] [Templates] [Open Source]
Row 3: [Data Ready v2]
```

"Data Ready" in row 3 stays `col-span-1` (left-aligned). All 6 features from the existing `FEATURES` array are included; do not drop any.

Card styles:
- Default: `bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.07)] rounded-xl p-5`
- "Drag & Drop" featured card: `bg-[rgba(6,182,212,0.04)] border border-[rgba(6,182,212,0.14)]`
- Icon emoji replaced with `<span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">✦ TITLE</span>`
- Scroll animation: each card wrapped in `<AnimatedSection delay={80 + index * 80}>` (first card at 80ms, after the section heading at 0ms — see AnimatedSection section)

### Templates Preview

- `bg-[#080810]`, same card treatment as features
- Three template cards in `grid grid-cols-3 gap-4`
- Centre card (Inventory): `border-cyan-500/20 bg-[rgba(6,182,212,0.04)]` highlight
- Each card wrapped in `<AnimatedSection delay={80 + index * 80}>`

### Pricing

- `bg-[#080810]`, three-column cards
- Pro card: `border border-cyan-500/30 bg-[rgba(6,182,212,0.05)]`, gradient "Most popular" badge pill, gradient CTA button
- Free and White-label: `border border-[rgba(255,255,255,0.08)]`, ghost CTAs (`border border-[rgba(255,255,255,0.1)] text-[#6b7280]`)
- Each card wrapped in `<AnimatedSection delay={80 + index * 80}>`

### Section headings

Each section heading (`<h2>` + subtitle `<p>`) is wrapped in a single `<AnimatedSection delay={0}>`. Feature/template/pricing cards start their stagger at `delay={80}` so the heading always animates first.

### Footer

- `bg-[#080810] border-t border-[rgba(255,255,255,0.05)]`
- Single row, left: gradient logo + "© 2026 Mozaiq — AGPL-3.0", right: GitHub, Self-host, Roadmap

## AnimatedSection Component

**File:** `components/landing/AnimatedSection.tsx`

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

Usage in `app/page.tsx`:
```tsx
// Section heading (delay 0)
<AnimatedSection delay={0}>
  <h2>...</h2>
  <p>...</p>
</AnimatedSection>

// Cards (staggered from 80ms)
{FEATURES.map((f, i) => (
  <AnimatedSection key={f.title} delay={80 + i * 80}>
    <div className="...card...">...</div>
  </AnimatedSection>
))}
```

## Builder UI

### What changes

| Area | Before | After |
|---|---|---|
| Canvas `bg` | `bg-[#f4f5f7]` | `bg-[#0f1117]` |
| Canvas wrapper div | existing classes | add `relative` — required so the absolute dot-grid overlay is contained |
| Canvas dot grid | None | `radial-gradient` dots, 25% opacity, absolute inset |
| Canvas empty state text | `text-gray-400` | `text-[#4b5563]` |
| Right panel `bg` | `bg-white` | `bg-[#0a0a0f]` |
| Right panel `border-l` | `border-l` (light) | `border-l border-[rgba(255,255,255,0.06)]` |
| Right panel inputs | `border px-2 py-1.5` light | `bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[#9ca3af]`, focus: `border-cyan-500/50` |
| Right panel labels | `text-xs text-gray-600` | `text-xs text-[#4b5563]` |
| Right panel section labels | `text-[10px] text-gray-400` | `text-[10px] text-[#374151]` |
| Right panel empty state text | `text-xs text-gray-400` | `text-xs text-[#4b5563]` (covers both "Select a widget" and "Live data connections" messages) |
| Right panel `<input type="color">` | `border` (light) | `border border-[rgba(255,255,255,0.1)]` |
| Right panel collapse button | `border bg-white` | `border border-[rgba(255,255,255,0.1)] bg-[#0a0a0f] text-[#4b5563]` |
| Toolbar `<header>` bg | `bg-white` | `bg-[#0a0a0f]` |
| Toolbar `border-b` | `border-b` (light) | `border-b border-[rgba(255,255,255,0.06)]` |
| Toolbar logo square | `bg-indigo-600 rounded` | `bg-gradient-to-br from-cyan-400 to-indigo-600 rounded` |
| Toolbar "Mozaiq" text | `text-gray-900` | `text-[#f9fafb]` |
| Toolbar separator | `text-gray-300` | `text-[rgba(255,255,255,0.15)]` |
| Toolbar dashboard name span | `text-gray-700 hover:text-indigo-600` | `text-[#9ca3af] hover:text-[#f9fafb]` |
| Toolbar dashboard name input | `border-indigo-300` focus | `border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#f9fafb]` focus: `border-cyan-500/50` |
| Toolbar dirty dot | `text-gray-400` | `text-[#4b5563]` |
| Toolbar Clear button | `text-gray-500 hover:bg-gray-100` | `text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]` |
| Toolbar Save/Share buttons | `border text-gray-700 hover:bg-gray-50` | `border border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]` |
| Toolbar Preview `<Link>` | `bg-indigo-600 hover:bg-indigo-700` | `bg-gradient-to-r from-cyan-400 to-indigo-600 hover:opacity-90` — conditional render unchanged |
| AI bar container | `border-gray-200 bg-white` | `border border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.04)]` |
| AI bar `<Sparkles>` icon | `text-indigo-400` | `text-cyan-400` |
| AI bar `<input>` placeholder | `placeholder:text-gray-400` | `placeholder:text-[#374151]` |
| AI bar Generate button | `bg-indigo-600 hover:bg-indigo-700` | `bg-gradient-to-r from-cyan-400 to-indigo-600 hover:opacity-90` |

### What does NOT change

- Widget component internals — render fine as elevated light cards on dark canvas
- Layout and structure of toolbar, sidebars, canvas
- react-grid-layout behaviour, all Zustand store logic
- Conditional rendering of Preview link (only shown when `id` truthy) — unchanged

## CSS in `app/globals.css`

Add inside `@layer utilities`:

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

Note: `@keyframes` must be defined outside any `@layer` block (top-level). Only the class rules go inside `@layer utilities`.

Do not use `tw-animate-css` utility classes for the landing page animations — use only `.fade-up` / `.visible` and `.hero-fade` as defined above.

## File Changes

| File | Change |
|---|---|
| `app/page.tsx` | Full rewrite: all section components, root div bg, import `AnimatedSection` |
| `app/globals.css` | Add `@layer utilities` block with `.hero-fade`, `.fade-up`, `.visible`; add `@keyframes heroFade` |
| `components/landing/AnimatedSection.tsx` | New file — client component (exact code above) |
| `components/builder/BuilderCanvas.tsx` | Canvas bg, dot grid overlay, empty state text colour |
| `components/builder/RightPanel.tsx` | Dark bg, dark inputs (with focus state), dark labels, dark collapse button |
| `components/builder/Toolbar.tsx` | Full header dark treatment + Preview `<Link>` → gradient |
| `components/builder/AIGeneratorBar.tsx` | Container border/bg, Sparkles icon, input placeholder, Generate button → gradient |

## Out of Scope

- Widget component dark mode (deferred)
- Dark mode toggle / system preference detection
- Any animation library (Framer Motion, etc.)
- Font variable renaming
- New sections or content changes beyond specified
