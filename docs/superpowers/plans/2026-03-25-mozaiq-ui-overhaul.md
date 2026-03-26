# Mozaiq UI Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a unified glass-morphism + grain shader design language across the landing page, builder, and my-dashboards — integrating 5 components from 21st.dev (PaperShader, BentoGrid, PricingCard, GlassEffect, AnimatedGenerateButton) and a scroll-shrink nav.

**Architecture:** Fixed grain shader background renders behind all pages via `app/layout.tsx`. Glass surfaces float over it at four depth levels (L1–L4) using `backdrop-filter: blur + rgba fills`. The landing Nav becomes a client component for scroll-shrink; all other changes are purely className swaps.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS v4, `@paper-design/shaders-react`, `@testing-library/react`, Jest

---

## File Map

**Create:**
- `components/ui/paper-shader.tsx` — Fixed GrainGradient background wrapper
- `components/ui/liquid-glass.tsx` — `GlassEffect` wrapper (SVG distortion + backdrop-blur)
- `components/ui/bento-grid.tsx` — `BentoGrid` + `BentoItem` interface
- `components/ui/pricing-card.tsx` — `PricingCard.*` compound components
- `components/ui/animated-generate-button.tsx` — `AnimatedGenerateButton`
- `components/landing/Nav.tsx` — Client scroll-shrink Nav (extracted from page.tsx)
- `__tests__/ui/liquid-glass.test.tsx`
- `__tests__/ui/bento-grid.test.tsx`
- `__tests__/ui/pricing-card.test.tsx`
- `__tests__/ui/animated-generate-button.test.tsx`
- `__tests__/landing/Nav.test.tsx`

**Modify:**
- `app/layout.tsx` — Add `<PaperShader />`
- `app/page.tsx` — Nav auth split + BentoGrid features + PricingCard pricing + glass touches
- `components/nav/TopNav.tsx` — Glass L3
- `components/builder/Toolbar.tsx` — Glass L3 (dark branch only)
- `components/builder/LeftSidebar.tsx` — Glass L3 (dark branch only)
- `components/builder/RightPanel.tsx` — Glass L3 (dark branch only)
- `components/builder/AIGeneratorBar.tsx` — Glass L3 + AnimatedGenerateButton (dark branch)
- `components/my-dashboards/DashboardCard.tsx` — Glass L2
- `components/my-dashboards/EmptyState.tsx` — Glass L1

---

## Glass Token Reference

Use these values throughout all tasks. **Do not invent new values.**

| Level | Usage | Background | Border | Blur |
|-------|-------|-----------|--------|------|
| L1 | Page tints, footer | `rgba(255,255,255,0.02)` | `rgba(255,255,255,0.06)` | — |
| L2 | Cards, dashboard cards | `rgba(255,255,255,0.04)` | `rgba(255,255,255,0.09)` | 8px |
| L3 | Nav, panels, sidebars, AI bar | `rgba(255,255,255,0.07)` | `rgba(255,255,255,0.13)` | 12px (20px for nav) |
| L4 | Modals / popovers | `rgba(255,255,255,0.11)` | `rgba(255,255,255,0.18)` | 12px |

Inset highlight: `box-shadow: inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)`

---

### Task 1: Install @paper-design/shaders-react

**Files:**
- Modify: `package.json` (via npm)

- [ ] **Step 1: Install the package**

```bash
npm install @paper-design/shaders-react
```

Expected: package added to `node_modules/`, `package.json` updated.

- [ ] **Step 2: Verify GrainGradient prop types**

```bash
cat node_modules/@paper-design/shaders-react/dist/index.d.ts | head -80
```

Note the exact prop names for colors and grain intensity — you will need them in Task 2. The props are typically some variant of `colorBack`, `color1`/`color2`/`color3`, `grain`, `softness`, and `speed`. Record what you see.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @paper-design/shaders-react"
```

---

### Task 2: Create `components/ui/paper-shader.tsx`

**Files:**
- Create: `components/ui/paper-shader.tsx`

> `@paper-design/shaders-react` requires `'use client'` — it uses browser APIs. The component wraps `GrainGradient` in a fixed full-screen layer behind all page content.

- [ ] **Step 1: Write the component**

Using the prop names you verified in Task 1 Step 2, create `components/ui/paper-shader.tsx`:

```tsx
'use client'
import { GrainGradient } from '@paper-design/shaders-react'

export function PaperShader() {
  return (
    <GrainGradient
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      // Map these to the exact prop names you found in Step 2 of Task 1.
      // The colors below are the target values from the design spec.
      // colorBack="#080810"           ← dark slate base
      // color1="hsl(190,100%,45%)"    ← cyan grain
      // color2="hsl(245,80%,60%)"     ← indigo grain
      // color3="hsl(220,30%,15%)"     ← dark slate grain
      // grain={0.2}                   ← ~20% intensity
      // softness={0.7}
      // speed={0}                     ← static texture, no animation
    />
  )
}
```

Uncomment and fill in the props using the actual names from Task 1 Step 2. If the component accepts a `style` prop directly, use it as shown. If the component renders its own `<canvas>` or `<div>` that cannot be styled via `style`, wrap it:

```tsx
'use client'
import { GrainGradient } from '@paper-design/shaders-react'

export function PaperShader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100vw',
        height: '100vh',
      }}
    >
      <GrainGradient
        style={{ width: '100%', height: '100%' }}
        colorBack="#080810"
        /* fill in remaining props from Task 1 Step 2 */
      />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ui/paper-shader.tsx
git commit -m "feat: add PaperShader fixed background component"
```

---

### Task 3: Create `components/ui/liquid-glass.tsx`

**Files:**
- Create: `components/ui/liquid-glass.tsx`
- Create: `__tests__/ui/liquid-glass.test.tsx`

> `GlassEffect` is a decorative wrapper used for the Hero's "View on GitHub →" CTA. It applies an SVG distortion filter + backdrop-blur to give surfaces a liquid-glass appearance. Uses React `useId` so multiple instances don't clash.

- [ ] **Step 1: Write the failing test**

Create `__tests__/ui/liquid-glass.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { GlassEffect } from '@/components/ui/liquid-glass'

describe('GlassEffect', () => {
  it('renders children', () => {
    render(<GlassEffect><span>hello</span></GlassEffect>)
    expect(screen.getByText('hello')).toBeTruthy()
  })

  it('applies a custom className to the outer wrapper', () => {
    const { container } = render(
      <GlassEffect className="test-class"><span>x</span></GlassEffect>
    )
    expect(container.firstChild).toHaveClass('test-class')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest __tests__/ui/liquid-glass.test.tsx --no-coverage
```

Expected: `Cannot find module '@/components/ui/liquid-glass'`

- [ ] **Step 3: Write the component**

Create `components/ui/liquid-glass.tsx`:

```tsx
'use client'
import { useId } from 'react'

interface GlassEffectProps {
  children: React.ReactNode
  className?: string
}

export function GlassEffect({ children, className = '' }: GlassEffectProps) {
  const uid = useId().replace(/:/g, '')
  const filterId = `glass-${uid}`

  return (
    <div className={`relative inline-block ${className}`}>
      {/* SVG filter definition — zero-size, invisible */}
      <svg
        aria-hidden
        className="absolute"
        style={{ width: 0, height: 0, position: 'absolute' }}
      >
        <defs>
          <filter
            id={filterId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.65"
              numOctaves="1"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Glass surface */}
      <div
        style={{ filter: `url(#${filterId})` }}
        className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-3 backdrop-blur-[8px]"
        style={{
          filter: `url(#${filterId})`,
          boxShadow:
            'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
```

Note: the inner `<div>` has two `style` props above — merge them into one:

```tsx
      <div
        className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-3 backdrop-blur-[8px]"
        style={{
          filter: `url(#${filterId})`,
          boxShadow:
            'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
        }}
      >
        {children}
      </div>
```

Final corrected `components/ui/liquid-glass.tsx`:

```tsx
'use client'
import { useId } from 'react'

interface GlassEffectProps {
  children: React.ReactNode
  className?: string
}

export function GlassEffect({ children, className = '' }: GlassEffectProps) {
  const uid = useId().replace(/:/g, '')
  const filterId = `glass-${uid}`

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        aria-hidden
        className="absolute"
        style={{ width: 0, height: 0, position: 'absolute' }}
      >
        <defs>
          <filter
            id={filterId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.65"
              numOctaves="1"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-3 backdrop-blur-[8px]"
        style={{
          filter: `url(#${filterId})`,
          boxShadow:
            'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/ui/liquid-glass.test.tsx --no-coverage
```

Expected: 2 passing

- [ ] **Step 5: Commit**

```bash
git add components/ui/liquid-glass.tsx __tests__/ui/liquid-glass.test.tsx
git commit -m "feat: add GlassEffect liquid-glass wrapper component"
```

---

### Task 4: Create `components/ui/bento-grid.tsx`

**Files:**
- Create: `components/ui/bento-grid.tsx`
- Create: `__tests__/ui/bento-grid.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/ui/bento-grid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { BentoGrid, type BentoItem } from '@/components/ui/bento-grid'

const items: BentoItem[] = [
  { title: 'Alpha', description: 'First', colSpan: 2, hasPersistentHover: true },
  { title: 'Beta', description: 'Second', colSpan: 1 },
  { title: 'Gamma', description: 'Third', colSpan: 3 },
]

describe('BentoGrid', () => {
  it('renders all item titles', () => {
    render(<BentoGrid items={items} />)
    expect(screen.getByText('Alpha')).toBeTruthy()
    expect(screen.getByText('Beta')).toBeTruthy()
    expect(screen.getByText('Gamma')).toBeTruthy()
  })

  it('applies col-span-2 class for colSpan=2 item', () => {
    const { container } = render(<BentoGrid items={items} />)
    const alphaTile = container.querySelector('[data-testid="bento-item-0"]')
    expect(alphaTile?.className).toContain('col-span-2')
  })

  it('applies col-span-3 class for colSpan=3 item', () => {
    const { container } = render(<BentoGrid items={items} />)
    const gammaTile = container.querySelector('[data-testid="bento-item-2"]')
    expect(gammaTile?.className).toContain('col-span-3')
  })

  it('applies persistent-hover class when hasPersistentHover=true', () => {
    const { container } = render(<BentoGrid items={items} />)
    const alphaTile = container.querySelector('[data-testid="bento-item-0"]')
    expect(alphaTile?.className).toContain('bento-hover')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest __tests__/ui/bento-grid.test.tsx --no-coverage
```

Expected: `Cannot find module '@/components/ui/bento-grid'`

- [ ] **Step 3: Write the component**

Create `components/ui/bento-grid.tsx`:

```tsx
export interface BentoItem {
  title: string
  description?: string
  icon?: React.ReactNode
  status?: string
  tags?: string[]
  colSpan?: 1 | 2 | 3
  hasPersistentHover?: boolean
  featured?: boolean
}

interface BentoGridProps {
  items: BentoItem[]
}

export function BentoGrid({ items }: BentoGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item, i) => {
        const spanClass =
          item.colSpan === 3
            ? 'col-span-3'
            : item.colSpan === 2
            ? 'col-span-2'
            : 'col-span-1'

        const bgClass = item.featured
          ? 'border-[rgba(6,182,212,0.14)] bg-[rgba(6,182,212,0.04)]'
          : 'border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)]'

        const hoverClass = item.hasPersistentHover
          ? 'bento-hover border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.06)]'
          : 'hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.06)]'

        return (
          <div
            key={i}
            data-testid={`bento-item-${i}`}
            className={`h-full rounded-xl border p-5 transition-all duration-200 backdrop-blur-[8px]
              [box-shadow:inset_2px_2px_1px_rgba(255,255,255,0.08),inset_-1px_-1px_1px_rgba(255,255,255,0.04)]
              ${spanClass} ${bgClass} ${hoverClass}`}
          >
            {item.icon && (
              <div className="mb-3 text-cyan-400">{item.icon}</div>
            )}
            {item.status && (
              <span className="mb-2 inline-block rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan-300">
                {item.status}
              </span>
            )}
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-cyan-400">
              ✦ {item.title}
            </span>
            {item.description && (
              <p className="text-sm text-[#9ca3af]">{item.description}</p>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#6b7280]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/ui/bento-grid.test.tsx --no-coverage
```

Expected: 4 passing

- [ ] **Step 5: Commit**

```bash
git add components/ui/bento-grid.tsx __tests__/ui/bento-grid.test.tsx
git commit -m "feat: add BentoGrid component for features section"
```

---

### Task 5: Create `components/ui/pricing-card.tsx`

**Files:**
- Create: `components/ui/pricing-card.tsx`
- Create: `__tests__/ui/pricing-card.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/ui/pricing-card.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { PricingCard } from '@/components/ui/pricing-card'

describe('PricingCard', () => {
  it('renders plan name, price, and list items', () => {
    render(
      <PricingCard.Card>
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
          </PricingCard.List>
        </PricingCard.Body>
      </PricingCard.Card>
    )
    expect(screen.getByText('Pro')).toBeTruthy()
    expect(screen.getByText('$15')).toBeTruthy()
    expect(screen.getByText('/mo')).toBeTruthy()
    expect(screen.getByText('Unlimited dashboards')).toBeTruthy()
  })

  it('renders Badge when provided', () => {
    render(
      <PricingCard.Card>
        <PricingCard.Header>
          <PricingCard.Badge>Popular</PricingCard.Badge>
        </PricingCard.Header>
        <PricingCard.Body><PricingCard.List /></PricingCard.Body>
      </PricingCard.Card>
    )
    expect(screen.getByText('Popular')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest __tests__/ui/pricing-card.test.tsx --no-coverage
```

Expected: `Cannot find module '@/components/ui/pricing-card'`

- [ ] **Step 3: Write the component**

Create `components/ui/pricing-card.tsx`:

```tsx
import { ReactNode } from 'react'

interface WithChildren { children?: ReactNode }
interface WithClassName extends WithChildren { className?: string }

function Card({ children, className = '' }: WithClassName) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-xl border border-[rgba(255,255,255,0.09)]
        bg-[rgba(255,255,255,0.04)] p-6 backdrop-blur-[8px]
        [box-shadow:inset_2px_2px_1px_rgba(255,255,255,0.08),inset_-1px_-1px_1px_rgba(255,255,255,0.04)]
        ${className}`}
    >
      {children}
    </div>
  )
}

function Header({ children }: WithChildren) {
  return <div className="mb-4">{children}</div>
}

function Plan({ children }: WithChildren) {
  return <div className="mb-2 flex items-center justify-between">{children}</div>
}

function PlanName({ children }: WithChildren) {
  return <h3 className="font-semibold text-[#f9fafb]">{children}</h3>
}

function Badge({ children }: WithChildren) {
  return (
    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
      {children}
    </span>
  )
}

function Price({ children }: WithChildren) {
  return <div className="mt-2 flex items-baseline gap-1">{children}</div>
}

function MainPrice({ children }: WithChildren) {
  return <span className="text-3xl font-extrabold text-[#f9fafb]">{children}</span>
}

function Period({ children }: WithChildren) {
  return <span className="text-sm text-[#4b5563]">{children}</span>
}

function Body({ children }: WithChildren) {
  return <div className="flex flex-1 flex-col">{children}</div>
}

function List({ children }: WithChildren) {
  return <ul className="mt-4 flex-1 space-y-2">{children}</ul>
}

function ListItem({ children }: WithChildren) {
  return <li className="text-sm text-[#9ca3af]">{children}</li>
}

export const PricingCard = {
  Card,
  Header,
  Plan,
  PlanName,
  Badge,
  Price,
  MainPrice,
  Period,
  Body,
  List,
  ListItem,
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/ui/pricing-card.test.tsx --no-coverage
```

Expected: 2 passing

- [ ] **Step 5: Commit**

```bash
git add components/ui/pricing-card.tsx __tests__/ui/pricing-card.test.tsx
git commit -m "feat: add PricingCard compound components"
```

---

### Task 6: Create `components/ui/animated-generate-button.tsx`

**Files:**
- Create: `components/ui/animated-generate-button.tsx`
- Create: `__tests__/ui/animated-generate-button.test.tsx`

> The original 21st.dev component uses `<style jsx>` which requires the `styled-jsx` package. Convert the CSS to a plain `<style>` tag (valid in React client components) instead.

- [ ] **Step 1: Write the failing test**

Create `__tests__/ui/animated-generate-button.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { AnimatedGenerateButton } from '@/components/ui/animated-generate-button'

describe('AnimatedGenerateButton', () => {
  it('shows labelIdle when not generating', () => {
    render(
      <AnimatedGenerateButton
        generating={false}
        labelIdle="Generate"
        labelActive="Building"
        highlightHueDeg={195}
        onClick={() => {}}
      />
    )
    expect(screen.getByText('Generate')).toBeTruthy()
  })

  it('shows labelActive when generating', () => {
    render(
      <AnimatedGenerateButton
        generating={true}
        labelIdle="Generate"
        labelActive="Building"
        highlightHueDeg={195}
        onClick={() => {}}
      />
    )
    expect(screen.getByText('Building')).toBeTruthy()
  })

  it('calls onClick when clicked and not generating', () => {
    const onClick = jest.fn()
    render(
      <AnimatedGenerateButton
        generating={false}
        labelIdle="Generate"
        labelActive="Building"
        highlightHueDeg={195}
        onClick={onClick}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when generating=true', () => {
    render(
      <AnimatedGenerateButton
        generating={true}
        labelIdle="Generate"
        labelActive="Building"
        highlightHueDeg={195}
        onClick={() => {}}
      />
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest __tests__/ui/animated-generate-button.test.tsx --no-coverage
```

Expected: `Cannot find module '@/components/ui/animated-generate-button'`

- [ ] **Step 3: Write the component**

Create `components/ui/animated-generate-button.tsx`:

```tsx
'use client'

interface AnimatedGenerateButtonProps {
  generating: boolean
  labelIdle: string
  labelActive: string
  highlightHueDeg: number
  onClick: () => void
  disabled?: boolean
}

export function AnimatedGenerateButton({
  generating,
  labelIdle,
  labelActive,
  highlightHueDeg,
  onClick,
  disabled = false,
}: AnimatedGenerateButtonProps) {
  const isDisabled = disabled || generating

  return (
    <>
      <style>{`
        @keyframes agb-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .agb-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            hsl(${highlightHueDeg}, 100%, 50%) 0%,
            hsl(${highlightHueDeg + 40}, 80%, 55%) 50%,
            hsl(${highlightHueDeg}, 100%, 50%) 100%
          );
          background-size: 200% auto;
        }
        .agb-btn:not(:disabled):hover {
          animation: agb-shimmer 1.5s linear infinite;
        }
        .agb-btn.agb-generating {
          animation: agb-shimmer 1.5s linear infinite;
        }
      `}</style>
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`agb-btn flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-60 ${
          generating ? 'agb-generating' : ''
        }`}
      >
        {generating && (
          <svg
            className="h-3.5 w-3.5 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {generating ? labelActive : labelIdle}
      </button>
    </>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/ui/animated-generate-button.test.tsx --no-coverage
```

Expected: 4 passing

- [ ] **Step 5: Commit**

```bash
git add components/ui/animated-generate-button.tsx __tests__/ui/animated-generate-button.test.tsx
git commit -m "feat: add AnimatedGenerateButton component"
```

---

### Task 7: Wire PaperShader into `app/layout.tsx`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Update layout.tsx**

The current file:
```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import './globals.css'
```

Replace the `<body>` content with:

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'
import { PaperShader } from '@/components/ui/paper-shader'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: 'Mozaiq — Build beautiful dashboards in minutes',
  description: 'Drag-and-drop dashboard builder with AI generation. Open source.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
          <PaperShader />
          {children}
          <Toaster richColors />
        </body>
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 2: Smoke test — start dev server and check no crashes**

```bash
npm run dev
```

Navigate to `http://localhost:3000`. Verify:
- Page loads without errors in browser console
- Dark background visible (shader renders behind content)

Stop the dev server (`Ctrl+C`).

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: add PaperShader fixed background to app layout"
```

---

### Task 8: Extract Nav to client component with scroll-shrink

**Files:**
- Create: `components/landing/Nav.tsx`
- Create: `__tests__/landing/Nav.test.tsx`
- Modify: `app/page.tsx` (auth split)

> The current `Nav` is an async server component inside page.tsx (it calls `auth()` directly). Scroll-shrink needs `'use client'`. Solution: `LandingPage` becomes async, calls `auth()`, and passes `userId` to a new client `Nav`.

- [ ] **Step 1: Write the failing test**

Create `__tests__/landing/Nav.test.tsx`:

```tsx
import { render, screen, act, fireEvent } from '@testing-library/react'
import { Nav } from '@/components/landing/Nav'

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserMenu: () => <div data-testid="user-menu" />,
}))

describe('Nav', () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  it('renders logo text', () => {
    render(<Nav userId={null} />)
    expect(screen.getByText('Mozaiq')).toBeTruthy()
  })

  it('shows Sign In when not authenticated', () => {
    render(<Nav userId={null} />)
    expect(screen.getByText('Sign In')).toBeTruthy()
  })

  it('shows My Dashboards link when authenticated', () => {
    render(<Nav userId="user_123" />)
    expect(screen.getByText('My Dashboards')).toBeTruthy()
  })

  it('hides My Dashboards after scroll', async () => {
    render(<Nav userId="user_123" />)
    expect(screen.getByText('My Dashboards')).toBeTruthy()

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
      fireEvent.scroll(window)
    })

    expect(screen.queryByText('My Dashboards')).toBeNull()
  })

  it('shows gradient CTA after scroll', async () => {
    render(<Nav userId={null} />)

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
      fireEvent.scroll(window)
    })

    expect(screen.getByText('Start Building →')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npx jest __tests__/landing/Nav.test.tsx --no-coverage
```

Expected: `Cannot find module '@/components/landing/Nav'`

- [ ] **Step 3: Create `components/landing/Nav.tsx`**

```tsx
'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SignInButton, UserMenu } from '@clerk/nextjs'

interface NavProps {
  userId: string | null
}

export function Nav({ userId }: NavProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-white/[0.08] bg-[rgba(255,255,255,0.07)] backdrop-blur-[20px]'
          : 'border-b border-transparent bg-transparent'
      }`}
      style={
        isScrolled
          ? {
              boxShadow:
                'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
            }
          : undefined
      }
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
        <span className="text-sm font-bold text-white">Mozaiq</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6">
        {!isScrolled && (
          <>
            <a href="#" className="text-sm text-[#4b5563] transition hover:text-white">
              Docs
            </a>
            <a
              href="https://github.com/zaiqapp/mozaiq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#4b5563] transition hover:text-white"
            >
              GitHub
            </a>
          </>
        )}

        {!isScrolled && userId && (
          <>
            <Link
              href="/my-dashboards"
              className="text-sm text-[#4b5563] transition hover:text-white"
            >
              My Dashboards
            </Link>
            <UserMenu />
          </>
        )}

        {!isScrolled && !userId && (
          <>
            <SignInButton mode="modal">
              <button className="text-sm text-[#4b5563] transition hover:text-white">
                Sign In
              </button>
            </SignInButton>
            <Link
              href="/builder"
              className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Start free →
            </Link>
          </>
        )}

        {isScrolled && (
          <Link
            href="/builder"
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Start Building →
          </Link>
        )}
      </div>
    </nav>
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest __tests__/landing/Nav.test.tsx --no-coverage
```

Expected: 5 passing

- [ ] **Step 5: Update `app/page.tsx` — remove inline Nav, add auth split**

In `app/page.tsx`:

1. Remove the `async function Nav()` block (lines 8–42)
2. Remove the `import { SignInButton } from '@clerk/nextjs'` and `import { UserMenu } from '@/components/nav/UserMenu'` imports (they move to the Nav component)
3. Add the new imports and make `LandingPage` async:

```tsx
import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { AnimatedSection } from '@/components/landing/AnimatedSection'
import { Nav } from '@/components/landing/Nav'
// ... (keep existing BentoGrid/PricingCard imports you'll add in Task 9)
```

Change `LandingPage` from:
```tsx
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080810]">
      <Nav />
```

To:
```tsx
export default async function LandingPage() {
  const { userId } = await auth()
  return (
    <div className="min-h-screen bg-[#080810]">
      <Nav userId={userId} />
```

- [ ] **Step 6: Run all tests — expect PASS**

```bash
npx jest --no-coverage
```

Expected: all tests pass (including the new Nav tests)

- [ ] **Step 7: Commit**

```bash
git add components/landing/Nav.tsx __tests__/landing/Nav.test.tsx app/page.tsx
git commit -m "feat: extract landing Nav to client component with scroll-shrink behavior"
```

---

### Task 9: Update landing page — BentoGrid features + PricingCard pricing + glass touches

**Files:**
- Modify: `app/page.tsx`

> Replace the hand-rolled Features grid with `BentoGrid` and the Pricing section with `PricingCard.*` compound components. Apply glass touches to Hero demo card and Footer.

- [ ] **Step 1: Update `app/page.tsx` imports**

Add at the top (after the existing imports):

```tsx
import { BentoGrid, type BentoItem } from '@/components/ui/bento-grid'
import { PricingCard } from '@/components/ui/pricing-card'
import { GlassEffect } from '@/components/ui/liquid-glass'
```

- [ ] **Step 2: Replace `FEATURES` constant and `Features` function**

Replace the current `FEATURES` array and `Features` function with:

```tsx
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
```

- [ ] **Step 3: Replace `Pricing` function with PricingCard compound components**

Replace the entire `Pricing` function (keeping the `PLANS` constant) with:

```tsx
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
```

- [ ] **Step 4: Apply glass touch to Hero demo card and wrap GitHub CTA in GlassEffect**

In the `Hero` function, find the demo placeholder card:
```tsx
        <div className="mx-auto mt-12 max-w-2xl rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] p-8 text-center">
          <p className="text-sm text-[#374151]">[ Builder screenshot / demo GIF ]</p>
        </div>
```

Update to glass L2 with inset highlight:
```tsx
        <div
          className="mx-auto mt-12 max-w-2xl rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] p-8 text-center backdrop-blur-[8px]"
          style={{
            boxShadow:
              'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
          }}
        >
          <p className="text-sm text-[#374151]">[ Builder screenshot / demo GIF ]</p>
        </div>
```

Find the "View on GitHub →" anchor in `Hero`:
```tsx
          <a
            href="https://github.com/zaiqapp/mozaiq"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[rgba(255,255,255,0.1)] px-6 py-3 text-sm font-semibold text-[#6b7280] transition hover:border-[rgba(255,255,255,0.2)] hover:text-white"
          >
            View on GitHub →
          </a>
```

Replace with `GlassEffect` wrapper:
```tsx
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
```

- [ ] **Step 5: Apply glass L1 to Footer**

In `Footer`, update the `<footer>` className from:
```tsx
    <footer className="border-t border-[rgba(255,255,255,0.05)] bg-[#080810] px-6 py-8">
```
To:
```tsx
    <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-6 py-8 backdrop-blur-[8px]">
```

- [ ] **Step 6: Remove now-unused `PLANS` constant**

Delete the `PLANS` array (lines 202–232 in the original) since the pricing data is now inline in the `Pricing` function.

- [ ] **Step 7: Run all tests — expect PASS**

```bash
npx jest --no-coverage
```

- [ ] **Step 8: Commit**

```bash
git add app/page.tsx
git commit -m "feat: apply BentoGrid features, PricingCard pricing, glass hero/footer to landing page"
```

---

### Task 10: Update `components/nav/TopNav.tsx` to glass L3

**Files:**
- Modify: `components/nav/TopNav.tsx`

- [ ] **Step 1: Update TopNav glass values**

The file currently has:
```tsx
// Current (approximate):
bg-[rgba(8,8,16,0.9)] backdrop-blur-md
```

Find the `<header>` element with the dark background. Replace:
```
bg-[rgba(8,8,16,0.9)] backdrop-blur-md
```
With the glass L3 token values:
```
bg-[rgba(255,255,255,0.07)] border-b border-white/[0.13] backdrop-blur-[20px]
```

And add the inset box-shadow style:
```tsx
style={{
  boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
}}
```

Read the file first with the Read tool to find the exact current className string before making the edit.

- [ ] **Step 2: Commit**

```bash
git add components/nav/TopNav.tsx
git commit -m "feat: update TopNav to glass L3 styling"
```

---

### Task 11: Update `components/builder/Toolbar.tsx` to glass L3 (dark mode)

**Files:**
- Modify: `components/builder/Toolbar.tsx`

> `Toolbar.tsx` uses `useBuilderTheme()` for `isDark`. Only touch the dark-mode branch. The light-mode branch stays unchanged.

- [ ] **Step 1: Update dark-mode background in Toolbar**

The file currently has a dark branch that uses `bg-[#0a0a0f]` and `border-[rgba(255,255,255,0.06)]`. Find the `<div>` or `<header>` that carries the toolbar background in the dark branch.

Replace the dark-branch background className:
```
bg-[#0a0a0f] border-[rgba(255,255,255,0.06)]
```
With:
```
bg-[rgba(255,255,255,0.07)] border-[rgba(255,255,255,0.13)] backdrop-blur-[12px]
```

Add inline style for inset highlight on that element:
```tsx
style={isDark ? {
  boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
} : undefined}
```

Read the file first with the Read tool to locate the exact className strings before editing.

- [ ] **Step 2: Commit**

```bash
git add components/builder/Toolbar.tsx
git commit -m "feat: apply glass L3 to Toolbar dark mode"
```

---

### Task 12: Update `components/builder/LeftSidebar.tsx` to glass L3 (dark mode)

**Files:**
- Modify: `components/builder/LeftSidebar.tsx`

> Only the dark-mode branch. Current dark background: `bg-[#0f1117]`.

- [ ] **Step 1: Update LeftSidebar dark-mode background**

Current dark branch in the `<aside>`:
```tsx
isDark ? 'bg-[#0f1117]' : 'bg-white border-r border-gray-200'
```

Replace the dark string with:
```tsx
isDark
  ? 'bg-[rgba(255,255,255,0.07)] border-r border-white/[0.13] backdrop-blur-[12px]'
  : 'bg-white border-r border-gray-200'
```

Also update the inner header border in the dark branch:
```tsx
// Current:
isDark ? 'border-b border-[#1f2937]' : 'border-b border-gray-200'
// Replace dark value with:
isDark ? 'border-b border-white/[0.08]' : 'border-b border-gray-200'
```

And update the TabsList dark background:
```tsx
// Current:
isDark ? 'bg-[#1f2937]' : 'bg-gray-100'
// Replace dark value with:
isDark ? 'bg-[rgba(255,255,255,0.06)]' : 'bg-gray-100'
```

Add the inset highlight to the `<aside>` in dark mode:
```tsx
style={isDark ? {
  boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
} : undefined}
```

- [ ] **Step 2: Commit**

```bash
git add components/builder/LeftSidebar.tsx
git commit -m "feat: apply glass L3 to LeftSidebar dark mode"
```

---

### Task 13: Update `components/builder/RightPanel.tsx` to glass L3 (dark mode)

**Files:**
- Modify: `components/builder/RightPanel.tsx`

> Current dark background: `bg-[#0a0a0f]`. Only the dark-mode branch.

- [ ] **Step 1: Update RightPanel dark-mode styles**

Current `asideClass`:
```tsx
const asideClass = `border-l ${isDark ? 'border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]' : 'border-gray-200 bg-white'}`
```

Replace with:
```tsx
const asideClass = `border-l ${
  isDark
    ? 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] backdrop-blur-[12px]'
    : 'border-gray-200 bg-white'
}`
```

Update `collapseButtonClass` dark background:
```tsx
// Current:
isDark ? 'border-[rgba(255,255,255,0.1)] bg-[#0a0a0f] text-[#4b5563]'
// Replace with:
isDark ? 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] text-[#4b5563] backdrop-blur-[8px]'
```

Update the tab bar border in dark mode:
```tsx
// Current:
isDark ? 'border-[rgba(255,255,255,0.06)]'
// Replace with:
isDark ? 'border-[rgba(255,255,255,0.08)]'
```

Add inset highlight to the `<aside>` elements:
```tsx
style={isDark ? {
  boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
} : undefined}
```

- [ ] **Step 2: Commit**

```bash
git add components/builder/RightPanel.tsx
git commit -m "feat: apply glass L3 to RightPanel dark mode"
```

---

### Task 14: Update `components/builder/AIGeneratorBar.tsx` — glass L3 + AnimatedGenerateButton

**Files:**
- Modify: `components/builder/AIGeneratorBar.tsx`

> Replace the current gradient button with `AnimatedGenerateButton`. Apply glass L3 to the bar (dark mode). The input gets glass L2 background.

- [ ] **Step 1: Update AIGeneratorBar**

Current file structure:
```tsx
'use client'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard'
import { toast } from 'sonner'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Replace the entire file with:

```tsx
'use client'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard'
import { toast } from 'sonner'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
import { AnimatedGenerateButton } from '@/components/ui/animated-generate-button'

export function AIGeneratorBar() {
  const [prompt, setPrompt] = useState('')
  const { isGenerating, generateDashboard } = useDashboardStore()
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    try {
      await generateDashboard(prompt)
      toast.success('Dashboard generated')
      setPrompt('')
    } catch {
      toast.error('Generation failed — please try again')
    }
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        isDark
          ? 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] backdrop-blur-[16px]'
          : 'border-indigo-200 bg-indigo-50'
      }`}
      style={
        isDark
          ? {
              boxShadow:
                'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
            }
          : undefined
      }
    >
      <Sparkles className="h-4 w-4 flex-shrink-0 text-cyan-400" />
      <input
        className={`flex-1 rounded-md border px-2 py-1 text-sm outline-none ${
          isDark
            ? 'border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] placeholder:text-[#374151]'
            : 'border-indigo-200 bg-white text-gray-600 placeholder:text-gray-400'
        }`}
        placeholder='e.g. "An analytics dashboard for a SaaS startup tracking MRR, churn, and active users"'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        disabled={isGenerating}
      />
      {isDark ? (
        <AnimatedGenerateButton
          generating={isGenerating}
          labelIdle="Generate"
          labelActive="Building"
          highlightHueDeg={195}
          onClick={handleGenerate}
          disabled={!prompt.trim()}
        />
      ) : (
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:opacity-90"
        >
          {isGenerating ? 'Generating...' : 'Generate →'}
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Run all tests — expect PASS**

```bash
npx jest --no-coverage
```

- [ ] **Step 3: Commit**

```bash
git add components/builder/AIGeneratorBar.tsx
git commit -m "feat: apply glass L3 and AnimatedGenerateButton to AIGeneratorBar"
```

---

### Task 15: Update `components/my-dashboards/DashboardCard.tsx` to glass L2

**Files:**
- Modify: `components/my-dashboards/DashboardCard.tsx`

> Current card: `border-[rgba(255,255,255,0.06)] bg-[#0f0f1a]`. Replace with glass L2 values and add hover lift. The dropdown popover gets glass L4.

- [ ] **Step 1: Update DashboardCard glass values**

Find the `<li>` element (line 128):
```tsx
    <li className="flex items-center gap-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0f0f1a] px-4 py-3.5">
```

Replace with:
```tsx
    <li
      className="flex items-center gap-3.5 rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] px-4 py-3.5 backdrop-blur-[8px] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.18)]"
      style={{
        boxShadow:
          'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
      }}
    >
```

Find the dropdown menu div (line 168):
```tsx
            <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a2e] shadow-xl">
```

Replace with glass L4:
```tsx
            <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.11)] shadow-xl backdrop-blur-[12px]">
```

- [ ] **Step 2: Commit**

```bash
git add components/my-dashboards/DashboardCard.tsx
git commit -m "feat: apply glass L2 to DashboardCard with hover lift"
```

---

### Task 16: Update `components/my-dashboards/EmptyState.tsx` to glass L1

**Files:**
- Modify: `components/my-dashboards/EmptyState.tsx`

> Current: `border-dashed border-[rgba(255,255,255,0.1)]`. Apply glass L1 background.

- [ ] **Step 1: Update EmptyState glass values**

Current:
```tsx
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] px-8 py-16 text-center">
```

Replace with:
```tsx
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-8 py-16 text-center">
```

- [ ] **Step 2: Commit**

```bash
git add components/my-dashboards/EmptyState.tsx
git commit -m "feat: apply glass L1 to EmptyState"
```

---

### Task 17: Final smoke test

- [ ] **Step 1: Run the full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass

- [ ] **Step 2: Start dev server and verify all three surfaces**

```bash
npm run dev
```

Check these routes visually:
1. `http://localhost:3000` — landing page
   - Grain shader visible behind content
   - Nav transparent at top, glass L3 after scrolling
   - Features section shows BentoGrid (2-col "Drag & Drop", 3-col "Data Ready")
   - Pricing section shows PricingCard compound components with "Popular" badge on Pro
   - Footer has subtle glass L1 background
   - Hero "View on GitHub →" has glass/distorted appearance
2. `http://localhost:3000/builder` — builder
   - Toolbar, LeftSidebar, RightPanel show glass L3 in dark mode
   - AI bar shows glass L3 with AnimatedGenerateButton
   - Light mode toggle: builder reverts to white panels (no glass)
3. `http://localhost:3000/my-dashboards` — my dashboards
   - Cards show glass L2 with hover lift
   - Empty state shows glass L1 dashed border

Stop the dev server.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Mozaiq UI overhaul — glass + grain shader design system"
```

---

## Self-Review Checklist

**Spec coverage:**
- ✅ PaperShader in layout (Task 2, 7)
- ✅ GlassEffect / liquid-glass (Task 3)
- ✅ BentoGrid features (Task 4, 9)
- ✅ PricingCard compound components (Task 5, 9)
- ✅ AnimatedGenerateButton (Task 6, 14)
- ✅ Nav scroll-shrink (Task 8)
- ✅ Hero demo card glass L2, GitHub CTA GlassEffect (Task 9)
- ✅ Footer glass L1 (Task 9)
- ✅ TopNav glass L3 (Task 10)
- ✅ Toolbar glass L3 dark (Task 11)
- ✅ LeftSidebar glass L3 dark (Task 12)
- ✅ RightPanel glass L3 dark (Task 13)
- ✅ AIGeneratorBar glass L3 + button (Task 14)
- ✅ DashboardCard glass L2 + hover (Task 15)
- ✅ EmptyState glass L1 (Task 16)

**Out of scope (do not touch):**
- Widget rendering, chart configs
- Auth sign-in/sign-up pages
- ShareView component
- Dashboard viewer page
- Color palette (stays cyan/indigo)
