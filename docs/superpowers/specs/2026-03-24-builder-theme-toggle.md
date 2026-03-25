# Builder Dark/Light Mode Toggle

## Goal

Add a persistent dark/light mode toggle to the builder UI. The toggle affects the two sidebars, main canvas, and widget cards only — the landing page is unaffected.

## Scope

**In scope:** `BuilderThemeProvider`, `Toolbar`, `AIGeneratorBar`, `BuilderCanvas`, `LeftSidebar`, `ComponentTile`, `TemplateCard`, `RightPanel`, `WidgetWrapper`, all 11 widget files.

**Out of scope:** Landing page, dashboard preview page, Zustand dashboard store, recharts tooltip/legend/axis SVG props (recharts internal styling not controlled via Tailwind).

---

## BuilderThemeProvider

**File:** `components/builder/BuilderThemeProvider.tsx` (new)

```tsx
'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

interface BuilderThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const BuilderThemeContext = createContext<BuilderThemeContextValue | null>(null)

export function BuilderThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('builder-theme') as Theme | null
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('builder-theme', next)
      return next
    })
  }

  return (
    <BuilderThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </BuilderThemeContext.Provider>
  )
}

export function useBuilderTheme(): BuilderThemeContextValue {
  const ctx = useContext(BuilderThemeContext)
  if (!ctx) throw new Error('useBuilderTheme must be used within BuilderThemeProvider')
  return ctx
}
```

Notes:
- Initializes to `'dark'` (SSR-safe default — no localStorage flash on first render)
- `useEffect` reads localStorage after mount to hydrate the saved preference
- Throws if used outside the provider to catch wiring mistakes early

---

## Builder Page Wrapper

**File:** `app/builder/page.tsx`

Wrap the existing builder div with `<BuilderThemeProvider>`. Do NOT add `'use client'` to this file — it is a Server Component and wrapping with a client provider is valid Next.js pattern. The provider itself is the client boundary.

```tsx
import { BuilderThemeProvider } from '@/components/builder/BuilderThemeProvider'
// ...

export default function BuilderPage() {
  return (
    <BuilderThemeProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* existing content unchanged */}
      </div>
    </BuilderThemeProvider>
  )
}
```

---

## Toolbar

**File:** `components/builder/Toolbar.tsx`

Add `useBuilderTheme()`, a `Sun`/`Moon` toggle button, and conditional classes for all existing elements.

Import additions:
```tsx
import { Sun, Moon, ... } from 'lucide-react'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Inside the component:
```tsx
const { theme, toggleTheme } = useBuilderTheme()
const isDark = theme === 'dark'
```

| Element | Dark | Light |
|---|---|---|
| `<header>` | `border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]` | `border-b border-gray-200 bg-white` |
| Mozaiq `<span>` | `text-[#f9fafb]` | `text-gray-900` |
| Separator `<span>` | `text-[rgba(255,255,255,0.15)]` | `text-gray-300` |
| Dashboard name `<span>` | `text-[#9ca3af] hover:text-[#f9fafb]` | `text-gray-500 hover:text-gray-900` |
| Dirty dot `<span>` | `text-[#4b5563]` | `text-gray-400` |
| Name edit `<input>` | `border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#f9fafb] focus:border-cyan-500/50` | `border border-gray-300 bg-white text-gray-900 focus:border-indigo-400` |
| Clear button | `text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]` | `text-gray-500 hover:bg-gray-100` |
| Save/Share buttons | `border border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]` | `border border-gray-200 text-gray-500 hover:bg-gray-50` |
| Toggle button | `text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]` | `text-gray-500 hover:bg-gray-100` |
| Preview link | `bg-gradient-to-r from-cyan-400 to-indigo-600 text-white` | unchanged |

Toggle button JSX (insert as the first button in the right-side `<div className="flex items-center gap-2">`, before the Clear button):
```tsx
<button
  onClick={toggleTheme}
  className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs ${
    isDark ? 'text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]' : 'text-gray-500 hover:bg-gray-100'
  }`}
  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
>
  {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
</button>
```

---

## AIGeneratorBar

**File:** `components/builder/AIGeneratorBar.tsx`

```tsx
const { theme } = useBuilderTheme()
const isDark = theme === 'dark'
```

| Element | Dark | Light |
|---|---|---|
| Outer `<div>` full className | `flex items-center gap-2 rounded-lg border border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.04)] px-3 py-2` | `flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2` |
| `<input>` text | `text-[#9ca3af]` | `text-gray-600` |
| `<input>` placeholder | `placeholder:text-[#374151]` | `placeholder:text-gray-400` |
| Sparkles icon | `text-cyan-400` | unchanged |
| Generate button | gradient unchanged | gradient unchanged |

---

## BuilderCanvas

**File:** `components/builder/BuilderCanvas.tsx`

```tsx
const { theme } = useBuilderTheme()
const isDark = theme === 'dark'
```

Outer div:
- Dark: `relative flex min-h-full flex-col bg-[#0f1117] p-3`
- Light: `relative flex min-h-full flex-col bg-[#f4f5f7] p-3`

Dot grid overlay div: render only when `isDark`. Wrap in `{isDark && <div ... />}`.

Empty state div text:
- Dark: `text-[#4b5563]`
- Light: `text-gray-400`

---

## LeftSidebar

**File:** `components/builder/LeftSidebar.tsx`

```tsx
const { theme } = useBuilderTheme()
const isDark = theme === 'dark'
```

| Element | Dark | Light |
|---|---|---|
| `<aside>` | `bg-[#0f1117]` | `bg-white border-r border-gray-200` |
| Header div | `border-b border-[#1f2937]` | `border-b border-gray-200` |
| Logo square | `bg-indigo-600` | `bg-indigo-600` (unchanged) |
| "Mozaiq" text | `text-white` | `text-gray-900` |
| `TabsList` | `bg-[#1f2937]` | `bg-gray-100` |
| Category label `<p>` | `text-gray-500` | `text-gray-500` |

Note: `TabsTrigger` text colour is delegated to the shadcn Tabs component's own styles — no additional overrides needed.

---

## ComponentTile

**File:** `components/builder/ComponentTile.tsx`

```tsx
const { theme } = useBuilderTheme()
const isDark = theme === 'dark'
```

Button className:
- Dark: `border border-[#2d3748] bg-[#1a2035] hover:border-indigo-500 hover:bg-[#1f2a42] ... text-center transition rounded-lg p-3 flex flex-col items-center gap-1.5`
- Light: `border border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-gray-100 ... text-center transition rounded-lg p-3 flex flex-col items-center gap-1.5`

Icon:
- Dark: `text-indigo-400`
- Light: `text-indigo-500`

Label span:
- Dark: `text-gray-300`
- Light: `text-gray-600`

---

## TemplateCard

**File:** `components/builder/TemplateCard.tsx`

```tsx
const { theme } = useBuilderTheme()
const isDark = theme === 'dark'
```

Button className:
- Dark: `border border-[#2d3748] bg-[#1a2035] hover:border-indigo-500 ... rounded-lg p-3 text-left transition w-full`
- Light: `border border-gray-200 bg-white hover:border-indigo-300 ... rounded-lg p-3 text-left transition w-full`

Name text:
- Dark: `text-white`
- Light: `text-gray-900`

Description text:
- Dark: `text-gray-400`
- Light: `text-gray-500`

---

## RightPanel

**File:** `components/builder/RightPanel.tsx`

```tsx
const { theme } = useBuilderTheme()
const isDark = theme === 'dark'
```

| Element | Dark | Light |
|---|---|---|
| Collapsed `<aside>` | `border-l border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]` | `border-l border-gray-200 bg-white` |
| Full `<aside>` | `border-l border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]` | `border-l border-gray-200 bg-white` |
| Both collapse buttons | `border border-[rgba(255,255,255,0.1)] bg-[#0a0a0f] text-[#4b5563]` | `border border-gray-200 bg-white text-gray-500` |
| Empty state `<p>` | `text-[#4b5563]` | `text-gray-400` |
| Section labels `<p>` (General/Appearance/Data) | `text-[#374151]` | `text-gray-400` |
| Field `<label>` elements | `text-[#4b5563]` | `text-gray-600` |
| `<input>` / `<textarea>` | `border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50` | `border border-gray-200 bg-white text-gray-900 focus:border-indigo-400` |
| Color `<input type="color">` | `border border-[rgba(255,255,255,0.1)]` | `border border-gray-200` |

---

## WidgetWrapper

**File:** `components/widgets/WidgetWrapper.tsx`

```tsx
const { theme } = useBuilderTheme()
const isDark = theme === 'dark'
```

Outer div:
- Dark: `group relative h-full w-full rounded-lg bg-[#161b27] shadow-sm` + selected: `ring-2 ring-cyan-500`
- Light: `group relative h-full w-full rounded-lg bg-white shadow-sm` + selected: `ring-2 ring-indigo-500`

Grip icon:
- Dark: `text-[#4b5563]`
- Light: `text-gray-400`

Delete button: `hover:bg-red-50 hover:text-red-500` — leave unchanged in both themes (acceptable on dark, correct on light).

---

## Widget Internals (11 files)

**Files:** `KPICard.tsx`, `LineChartWidget.tsx`, `AreaChartWidget.tsx`, `BarChartWidget.tsx`, `DonutChartWidget.tsx`, `FunnelChartWidget.tsx`, `GaugeWidget.tsx`, `ProgressTracker.tsx`, `ActivityFeed.tsx`, `TextNoteWidget.tsx`, `DataTableWidget.tsx`

Each file imports and calls `useBuilderTheme()`. The mapping for conditional text classes:

| Dark class | Light class |
|---|---|
| `text-[#f9fafb]` | `text-gray-900` |
| `text-[#e5e7eb]` | `text-gray-700` |
| `text-[#9ca3af]` | `text-gray-500` |
| `text-[#6b7280]` | `text-gray-400` |

**ProgressTracker.tsx additional:**
- Progress track div: Dark `bg-[rgba(255,255,255,0.1)]` → Light `bg-gray-100`
  (The current file has `bg-gray-100` which is too light for dark mode; this change fixes dark mode and keeps light mode correct.)

**DataTableWidget.tsx additional:**
- `<th>` header cell text: `text-[#9ca3af]` → `text-gray-500` (apply general mapping)
- `<td>` body cell text: `text-[#e5e7eb]` → `text-gray-700` (apply general mapping)
- Row even: Dark `bg-transparent` → Light `bg-white`
- Row odd: Dark `bg-[rgba(255,255,255,0.04)]` → Light `bg-gray-50`
- Header row border: Dark `border-b border-[rgba(255,255,255,0.08)]` → Light `border-b border-gray-200`

**GaugeWidget.tsx additional:**
- RadialBar background: Dark `fill: 'rgba(255,255,255,0.1)'` → Light `fill: '#f3f4f6'`
- Centre value `<span>`: `text-[#f9fafb]` → `text-gray-900` (this is a regular JSX span, not a Recharts prop — apply the mapping)

**ActivityFeed.tsx note:**
- The bullet dot `<div>` uses `bg-indigo-400` — leave this unchanged in both themes.

**Recharts internals (out of scope):**
- `CartesianGrid` stroke, `Tooltip`, and `Legend` SVG props in all chart widgets are not controlled via Tailwind and are explicitly out of scope for this iteration.

---

## File Changes Summary

| File | Action |
|---|---|
| `components/builder/BuilderThemeProvider.tsx` | Create — context, hook, localStorage |
| `app/builder/page.tsx` | Wrap with `<BuilderThemeProvider>` (no `'use client'` added) |
| `components/builder/Toolbar.tsx` | Add Sun/Moon toggle + conditional classes for all elements |
| `components/builder/AIGeneratorBar.tsx` | Conditional border, bg, input text/placeholder |
| `components/builder/BuilderCanvas.tsx` | Conditional bg, dot grid, empty state text |
| `components/builder/LeftSidebar.tsx` | Conditional bg, borders, text |
| `components/builder/ComponentTile.tsx` | Conditional bg, borders, text |
| `components/builder/TemplateCard.tsx` | Conditional bg, borders, text |
| `components/builder/RightPanel.tsx` | Conditional bg, inputs, labels, buttons |
| `components/widgets/WidgetWrapper.tsx` | Conditional bg, ring |
| `components/widgets/KPICard.tsx` | Conditional text |
| `components/widgets/LineChartWidget.tsx` | Conditional text |
| `components/widgets/AreaChartWidget.tsx` | Conditional text |
| `components/widgets/BarChartWidget.tsx` | Conditional text |
| `components/widgets/DonutChartWidget.tsx` | Conditional text |
| `components/widgets/FunnelChartWidget.tsx` | Conditional text |
| `components/widgets/GaugeWidget.tsx` | Conditional text + gauge bg fill |
| `components/widgets/ProgressTracker.tsx` | Conditional text + track bg |
| `components/widgets/ActivityFeed.tsx` | Conditional text (bullet dot unchanged) |
| `components/widgets/TextNoteWidget.tsx` | Conditional text |
| `components/widgets/DataTableWidget.tsx` | Conditional text + row bg + border |

## Out of Scope

- Landing page theming
- Dashboard preview page theming
- System `prefers-color-scheme` detection
- Per-dashboard theme persistence (theme is a user preference, not a dashboard property)
- Recharts tooltip, legend, axis, and grid SVG props
- `components/widgets/WidgetRenderer.tsx` — passthrough component, no theme classes to update
- `components/widgets/ErrorBoundary.tsx` — error fallback UI, not modified in this iteration
