# Landing Page & Builder UI Redesign

## Goal

Modernise the Mozaiq landing page and builder UI to match a Linear/Framer-style dark aesthetic — full dark background throughout, cyan/indigo accent palette, dot grid hero, bento grid features, scroll animations, and a dark builder canvas with elevated widget cards.

## Colour Palette

| Token | Value | Usage |
|---|---|---|
| `bg-base` | `#080810` | Landing page background, nav, footer |
| `bg-surface` | `#0a0a0f` | Toolbar, sidebars, right panel |
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

## Typography

- **Font**: Geist Sans (already installed via `next/font/google`) — no new dependencies
- **Heading style**: `font-weight: 800`, `letter-spacing: -0.03em` to `-0.04em`
- **Body**: `font-weight: 400–500`, normal tracking
- **Labels/badges**: `font-size: 9–10px`, `text-transform: uppercase`, `letter-spacing: 0.05em`

## Landing Page — Section by Section

### Nav

- Full-width, `background: rgba(8,8,16,0.8)`, `backdrop-filter: blur(12px)`
- `border-bottom: 1px solid rgba(255,255,255,0.05)`
- Left: gradient logo square + "Mozaiq" in bold
- Right: Docs, GitHub links (muted) + "Start free →" gradient button
- Sticky on scroll

### Hero

- Background: `#080810` with dot grid overlay (`radial-gradient` 1px dots, 22px spacing, 4.5% opacity)
- Two radial glow orbs: cyan (left, `rgba(6,182,212,0.18)`) and indigo (right, `rgba(99,102,241,0.14)`)
- Badge pill: cyan border + bg, pulsing dot, "AI-POWERED DASHBOARD BUILDER · OPEN SOURCE"
- H1 line 1: "Drag. Describe. Share." — white, 56px, weight 800, letter-spacing -1.5px
- H1 line 2: "Dashboards in minutes." — cyan→indigo gradient text, same size
- Subtext: 16px, muted
- CTAs: gradient primary "Start Building Free" (with glow shadow) + ghost secondary "View on GitHub →"
- Demo placeholder card: subtle dark card, `border: 1px solid rgba(255,255,255,0.08)`
- Scroll-fade animation: hero content fades in on load (`opacity: 0 → 1`, `translateY: 16px → 0`, 600ms)

### Features (Bento Grid)

Replaces the uniform 3-column emoji grid with an asymmetric bento layout:

```
[ Drag & Drop Builder — 2/3 width ] [ AI Generator — 1/3 ]
[ Share Anywhere ] [ Templates ] [ Open Source ]
```

- All cards: dark bg, `border-radius: 10px`, cyan-tinted border on featured card
- Icon replaced with uppercase cyan label (e.g. "✦ DRAG & DROP BUILDER")
- Scroll-triggered fade-in: each card animates in with 80ms stagger using `IntersectionObserver`
- No external animation library — pure CSS transitions triggered by JS class toggle

### Templates Preview

- Dark background (`#080810`), same card style as features
- Three template cards side by side, centre one highlighted with cyan border
- Same scroll-fade animation

### Pricing

- Dark background, three-column cards
- "Most popular" Pro card: cyan border, gradient badge pill at top, gradient CTA button
- Free and White-label: subtle borders, ghost CTAs

### Footer

- `#080810`, single row
- Left: gradient logo + "© 2026 Mozaiq — AGPL-3.0"
- Right: GitHub, Self-host, Roadmap links

## Builder UI

### What changes

| Area | Before | After |
|---|---|---|
| Canvas background | `#f4f5f7` (light grey) | `#0f1117` (dark) |
| Canvas dot grid | None | Same dot grid as landing hero (25% opacity) |
| Right panel background | `#ffffff` | `#0a0a0f` |
| Right panel inputs | White border, light bg | Dark bg `rgba(255,255,255,0.04)`, subtle border |
| Right panel labels | `text-gray-400` | `text-muted (#4b5563)` |
| Toolbar gradient CTA | `bg-indigo-600` | Cyan→indigo gradient |
| Left sidebar AI bar | `border-indigo-300` | Cyan border + bg tint |
| Widget card bg | Unchanged (white/light) | Unchanged — elevated naturally on dark canvas |

### What does NOT change

- Widget component internals (charts, KPI values, etc.) — they render fine as elevated light cards on dark canvas
- Layout and structure of toolbar, sidebars, canvas
- react-grid-layout behaviour
- All Zustand store logic

### Empty state

- Canvas empty state icon and text: switch to muted colours matching dark bg

## Animations

All animations implemented with `IntersectionObserver` + CSS class toggle — no library:

```css
.fade-up {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-up.visible {
  opacity: 1;
  transform: translateY(0);
}
```

Apply to: features bento cards (80ms stagger), template cards (80ms stagger), pricing cards (80ms stagger), section headings.

Hero content: CSS animation on load (no scroll trigger needed).

## File Changes

| File | Change |
|---|---|
| `app/page.tsx` | Full rewrite of all section components |
| `app/globals.css` | Add `.fade-up` / `.visible` animation classes |
| `components/builder/BuilderCanvas.tsx` | Canvas bg → `#0f1117`, add dot grid, update empty state colours |
| `components/builder/RightPanel.tsx` | Dark bg, dark inputs, dark labels |
| `components/builder/Toolbar.tsx` | Gradient CTA button |
| `components/builder/LeftSidebar.tsx` | Cyan AI bar tint |

## Out of Scope

- Widget component dark mode (deferred to a future dark mode pass)
- Dark mode toggle / system preference detection
- Framer Motion or any animation library
- Font changes (Geist already in use)
- Any new sections or content changes beyond what's specified
