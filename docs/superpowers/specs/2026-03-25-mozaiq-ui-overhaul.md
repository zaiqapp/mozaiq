# Mozaiq UI Overhaul — Design Spec
_2026-03-25_

## Overview

Full-app visual overhaul. A grain shader background runs behind every page as a fixed texture layer. All major UI surfaces become glass panels (backdrop-blur + low-opacity fill) floating over that texture. Five components from 21st.dev are integrated. The landing page nav gains a scroll-shrink behaviour. Existing brand identity (cyan/indigo, dark `#080810`, typography) is preserved.

---

## Design System

### Background
- `#080810` base color, unchanged.
- `@paper-design/shaders-react` `GrainGradient` renders as a `fixed` full-screen layer behind all page content (`z-index: -1`). Shader colors remapped to cool tones matching the brand: `hsl(190, 100%, 45%)` (cyan), `hsl(245, 80%, 60%)` (indigo), `hsl(220, 30%, 15%)` (dark slate). Intensity ~20%, softness 0.7.
- Added once in `app/layout.tsx` — applies globally across landing, builder, dashboards.

### Glass Depth Scale
Four levels. Higher level = more opacity + stronger border.

| Level | Usage | Background | Border |
|-------|-------|------------|--------|
| L1 | Page-level tints | `rgba(255,255,255,0.02)` | `rgba(255,255,255,0.06)` |
| L2 | Cards (dashboard cards, widget tiles) | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.09)` |
| L3 | Panels (nav, sidebars, right panel, AI bar) | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.13)` |
| L4 | Modals / popovers | `rgba(255,255,255,0.11)` | `rgba(255,255,255,0.18)` |

All glass surfaces use `backdrop-filter: blur(Npx)`: nav 20px, panels 12px, cards 8px.
Inset highlight: `box-shadow: inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)`.

### Color Tokens — unchanged
- Primary: `#06b6d4` (cyan) — CTAs, active states, badges, highlights
- Secondary: `#6366f1` (indigo) — gradient endpoints, secondary accents
- Gradient: `from-cyan-400 to-indigo-600` — primary CTA buttons, "Popular" badge
- Body text: `#9ca3af`, muted: `#6b7280`, headings: `#f9fafb`

### Typography — unchanged
Existing scale, weights, and letter-spacing. No font changes needed.

---

## New Component Files

All sourced from 21st.dev and adapted to the cyan/indigo palette.

| File | Source | Purpose |
|------|--------|---------|
| `components/ui/paper-shader.tsx` | reuno-ui/background-paper-shaders | Fixed grain shader background |
| `components/ui/bento-grid.tsx` | avanishverma4/bento-grid-01 | Features section grid |
| `components/ui/pricing-card.tsx` | 0xUrvish/pricing-card | Pricing section compound component |
| `components/ui/liquid-glass.tsx` | suraj-xd/liquid-glass | `GlassEffect` wrapper for surfaces |
| `components/ui/animated-generate-button.tsx` | shadway/animated-generate-button-shadcn-tailwind | AI generator bar button |

New npm dependency: `@paper-design/shaders-react`.

---

## Landing Page (`app/page.tsx`)

### Shader Background
- `<PaperShader />` added as a `fixed` layer in `app/layout.tsx`, not in `page.tsx`.

### Nav (scroll-shrink)
The landing page `Nav` function becomes a `'use client'` component. Auth check moves to the parent `LandingPage` server component and passes `userId` as a prop.

**Behaviour:**
- `isScrolled` state: `true` when `window.scrollY > 50`.
- **At top**: fully transparent background, no border. Shows: logo, Docs, GitHub, My Dashboards (if authed), Sign In + "Start free →" CTAs.
- **On scroll**: glass L3 background + `border-b border-white/[0.08]` fade in via `transition-all duration-300`. "My Dashboards" link hides. Sign In hides. Only the primary "Start Building →" gradient CTA stays visible.
- Nav remains `sticky top-0 z-50`.

### Hero
- Dot-grid + cyan/indigo orbs kept as-is (shader replaces the need for them, but they add layering depth).
- "View on GitHub →" secondary CTA button wrapped in `<GlassEffect>` from `liquid-glass.tsx` instead of raw border styling.
- Demo placeholder card (`[ Builder screenshot ]`) gets glass L2 styling.

### Features Section
- Hand-rolled bento grid replaced with `<BentoGrid items={FEATURES} />`.
- `FEATURES` array rewritten as `BentoItem[]` with `icon`, `status`, `tags`, `colSpan`, `hasPersistentHover` fields.
- "Drag & Drop Builder" card: `colSpan: 2`, `hasPersistentHover: true`.
- "Data Ready" card: `colSpan: 3` (full width).
- Card backgrounds adapted: featured card uses cyan-tinted glass, others use L2 glass.

### Templates Preview
- Cards get glass L2 styling (same structure, updated className values).

### Pricing Section
- Hand-rolled pricing cards replaced with `PricingCard.Card / Header / Plan / PlanName / Badge / Price / MainPrice / Period / Body / List / ListItem` compound components.
- Free plan: `variant="outline"` button.
- Pro plan: `<PricingCard.Badge>Popular</PricingCard.Badge>`, gradient CTA button.
- White-label: `variant="outline"` button, disabled state.
- Card backgrounds: Pro card gets cyan-tinted glass border (`border-cyan-500/25`), others get standard L2 glass.

### Footer
- Gets L1 glass background + existing border-t.

---

## Builder (`components/builder/`)

### `Toolbar.tsx`
- Apply glass L3 styles (same visual treatment as nav).

### `LeftSidebar.tsx`
- Apply glass L3: `bg-[rgba(255,255,255,0.07)] border-r border-white/[0.13] backdrop-blur-[12px]`.
- Active/selected icon gets cyan-tinted background `bg-cyan-500/[0.12] border-cyan-500/[0.2]`.

### `RightPanel.tsx` + `WidgetConfigPanel.tsx`
- Apply glass L3. These already `absolute`/float over the canvas — the glass will let widget content bleed through behind.
- Input fields inside get glass L2 background.

### `AIGeneratorBar.tsx`
- Bar itself: glass L3 + `backdrop-blur-[16px]`.
- Generate button replaced with `<AnimatedGenerateButton labelIdle="Generate" labelActive="Building" highlightHueDeg={195} />` (195° = cyan hue).
- Text input gets glass L2 background.

### `BuilderCanvas.tsx`
- No changes — canvas content is what the glass panels blur over.

---

## My Dashboards (`components/my-dashboards/`)

### `DashboardCard.tsx`
- Apply glass L2 styles. Hover state: increase border opacity to `rgba(255,255,255,0.18)` and add subtle `translateY(-2px)`.

### `EmptyState.tsx`
- Apply glass L1 background.

---

## App Layout (`app/layout.tsx`)

```tsx
// Add PaperShader as a fixed background layer
import { PaperShader } from '@/components/ui/paper-shader'

// Inside the body:
<PaperShader />   {/* fixed, z-index: -1, pointer-events: none */}
{children}
```

---

## Shared Nav (`components/nav/TopNav.tsx`)

The app-level `TopNav` (used in builder + my-dashboards) is already glass-styled (`bg-[rgba(8,8,16,0.9)] backdrop-blur-md`). Update to use the glass L3 token values to match the new system:
- `bg-[rgba(255,255,255,0.07)]` replacing the dark bg
- `border-b border-white/[0.13]`
- `backdrop-blur-[20px]`

No scroll-shrink needed here — the app nav is always visible in the tool UI.

---

## Out of Scope

- Widget rendering logic, data sources, chart config — no changes.
- Auth flows (sign-in, sign-up pages) — no changes.
- Share view (`components/share/ShareView.tsx`) — no changes.
- Dashboard viewer (`app/dashboard/[id]/page.tsx`) — no changes.
- Color palette changes — stays cyan/indigo throughout.
- Font changes.

---

## Implementation Notes

- `@paper-design/shaders-react` requires `'use client'` — wrap in a client component, render as `fixed` with `pointer-events-none`.
- `animated-generate-button` uses `<style jsx>` — requires `styled-jsx` or convert CSS to a `<style>` tag / CSS module.
- The landing page `Nav` auth split: `LandingPage` (server) calls `auth()` and passes `userId` to a client `Nav` component as a prop.
- All glass values should be extracted to CSS variables or a shared `glassStyles` utility object to keep them consistent and easy to tune.
