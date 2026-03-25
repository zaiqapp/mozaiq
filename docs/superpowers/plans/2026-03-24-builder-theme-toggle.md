# Builder Dark/Light Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent dark/light mode toggle to the Mozaiq builder UI, affecting both sidebars, the canvas, and all widget cards, persisted to `localStorage`.

**Architecture:** A new `BuilderThemeProvider` React context component wraps `app/builder/page.tsx` and exposes `theme` + `toggleTheme` via `useBuilderTheme()`. Every builder and widget component reads `theme` from this hook and applies conditional Tailwind classes. Default is `'dark'`; localStorage key `builder-theme` hydrates the preference on mount via `useEffect`.

**Tech Stack:** Next.js 16 App Router, React context, `localStorage`, Tailwind CSS arbitrary values, lucide-react (Sun/Moon icons), Jest + jsdom for the provider unit test.

**Spec:** `docs/superpowers/specs/2026-03-24-builder-theme-toggle.md`

---

## File Map

| File | Action |
|---|---|
| `components/builder/BuilderThemeProvider.tsx` | **Create** — context + hook + localStorage |
| `app/builder/page.tsx` | **Modify** — wrap with provider |
| `components/builder/Toolbar.tsx` | **Modify** — toggle button + all conditional classes |
| `components/builder/AIGeneratorBar.tsx` | **Modify** — conditional outer div + input text/placeholder |
| `components/builder/BuilderCanvas.tsx` | **Modify** — conditional bg, dot grid, empty state |
| `components/builder/LeftSidebar.tsx` | **Modify** — conditional aside, header, TabsList |
| `components/builder/ComponentTile.tsx` | **Modify** — conditional button, icon, label |
| `components/builder/TemplateCard.tsx` | **Modify** — conditional button, name text, description |
| `components/builder/RightPanel.tsx` | **Modify** — conditional aside, inputs, labels, buttons |
| `components/widgets/WidgetWrapper.tsx` | **Modify** — conditional bg, ring |
| `components/widgets/KPICard.tsx` | **Modify** — conditional text |
| `components/widgets/LineChartWidget.tsx` | **Modify** — conditional text |
| `components/widgets/AreaChartWidget.tsx` | **Modify** — conditional text |
| `components/widgets/BarChartWidget.tsx` | **Modify** — conditional text |
| `components/widgets/DonutChartWidget.tsx` | **Modify** — conditional text |
| `components/widgets/FunnelChartWidget.tsx` | **Modify** — conditional text |
| `components/widgets/GaugeWidget.tsx` | **Modify** — conditional text + RadialBar bg fill |
| `components/widgets/ProgressTracker.tsx` | **Modify** — conditional text + track bg |
| `components/widgets/ActivityFeed.tsx` | **Modify** — conditional text |
| `components/widgets/TextNoteWidget.tsx` | **Modify** — conditional text |
| `components/widgets/DataTableWidget.tsx` | **Modify** — conditional text + row bg + header border |

---

## Task 1: Create BuilderThemeProvider

**Files:**
- Create: `components/builder/BuilderThemeProvider.tsx`
- Create: `__tests__/BuilderThemeProvider.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `__tests__/BuilderThemeProvider.test.tsx`:

```tsx
import { render, screen, act } from '@testing-library/react'
import { BuilderThemeProvider, useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

function TestConsumer() {
  const { theme, toggleTheme } = useBuilderTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe('BuilderThemeProvider', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to dark', () => {
    render(<BuilderThemeProvider><TestConsumer /></BuilderThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('toggles theme and persists to localStorage', () => {
    render(<BuilderThemeProvider><TestConsumer /></BuilderThemeProvider>)
    act(() => screen.getByRole('button').click())
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(localStorage.getItem('builder-theme')).toBe('light')
  })

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem('builder-theme', 'light')
    render(<BuilderThemeProvider><TestConsumer /></BuilderThemeProvider>)
    // useEffect runs after render, so re-check after act
    act(() => {}) // flush effects
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('throws when used outside provider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<TestConsumer />)).toThrow('useBuilderTheme must be used within BuilderThemeProvider')
    spy.mockRestore()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/BuilderThemeProvider.test.tsx --no-coverage
```

Expected: FAIL — `Cannot find module '@/components/builder/BuilderThemeProvider'`

- [ ] **Step 3: Create BuilderThemeProvider**

Create `components/builder/BuilderThemeProvider.tsx`:

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

- [ ] **Step 4: Run test to verify it passes**

```bash
npx jest __tests__/BuilderThemeProvider.test.tsx --no-coverage
```

Expected: PASS — 4 tests pass

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 6: Commit**

```bash
git add components/builder/BuilderThemeProvider.tsx __tests__/BuilderThemeProvider.test.tsx
git commit -m "feat: add BuilderThemeProvider context with localStorage persistence"
```

---

## Task 2: Wire Provider into Builder Page

**Files:**
- Modify: `app/builder/page.tsx`

Current file (lines 1–19) has no imports from the provider. `BuilderPage` is a Server Component — do NOT add `'use client'`.

- [ ] **Step 1: Update app/builder/page.tsx**

Add the provider import (after the existing four component imports):
```tsx
import { BuilderThemeProvider } from '@/components/builder/BuilderThemeProvider'
```

Wrap the root `<div className="flex h-screen ...">` with `<BuilderThemeProvider>`:
```tsx
export default function BuilderPage() {
  return (
    <BuilderThemeProvider>
      <div className="flex h-screen flex-col overflow-hidden">
        <Toolbar />
        <div className="flex flex-1 overflow-hidden">
          <LeftSidebar />
          <main className="flex-1 overflow-y-auto">
            <BuilderCanvas />
          </main>
          <RightPanel />
        </div>
      </div>
    </BuilderThemeProvider>
  )
}
```

Do NOT add `'use client'` to this file — it is a Server Component and wrapping with a client provider is valid Next.js pattern.

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add app/builder/page.tsx
git commit -m "feat: wrap builder page with BuilderThemeProvider"
```

---

## Task 3: Toolbar — Toggle Button + Conditional Classes

**Files:**
- Modify: `components/builder/Toolbar.tsx`

Current file is `'use client'` with imports from lucide-react (Save, Share2, Eye, Trash2, Loader2). Add Sun, Moon imports. Add `useBuilderTheme` import. Apply conditional classes to every dark-specific element.

Before editing, confirm `components/builder/Toolbar.tsx` contains `import { Save, Share2, Eye, Trash2, Loader2 } from 'lucide-react'` — if the file has been modified, reconcile carefully rather than overwriting.

- [ ] **Step 1: Update imports**

Replace the lucide-react import line (the one that imports `Save, Share2, Eye, Trash2, Loader2`) with:
```tsx
import { Save, Share2, Eye, Trash2, Loader2, Sun, Moon } from 'lucide-react'
```

Add after `import Link from 'next/link'`:
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

- [ ] **Step 2: Add hook call inside component**

Add after `const [editingName, setEditingName] = useState(false)`:
```tsx
  const { theme, toggleTheme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 3: Apply conditional classes and add toggle button**

Replace the entire `return (...)` block with:

```tsx
  return (
    <header className={`flex h-12 items-center justify-between px-4 ${
      isDark
        ? 'border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]'
        : 'border-b border-gray-200 bg-white'
    }`}>
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
          <span className={`text-sm font-bold ${isDark ? 'text-[#f9fafb]' : 'text-gray-900'}`}>Mozaiq</span>
        </Link>
        <span className={isDark ? 'text-[rgba(255,255,255,0.15)]' : 'text-gray-300'}>|</span>
        {editingName ? (
          <input
            autoFocus
            className={`rounded border px-2 py-0.5 text-sm outline-none ${
              isDark
                ? 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#f9fafb] focus:border-cyan-500/50'
                : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-400'
            }`}
            value={name}
            onChange={(e) => setDashboardName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
          />
        ) : (
          <span
            className={`cursor-pointer text-sm ${
              isDark ? 'text-[#9ca3af] hover:text-[#f9fafb]' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setEditingName(true)}
          >
            {name}
          </span>
        )}
        {isDirty && <span className={`text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>•</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs ${
            isDark ? 'text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => clearCanvas()}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs ${
            isDark ? 'text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs disabled:opacity-50 ${
            isDark
              ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs ${
            isDark
              ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
        {id && (
          <Link
            href={`/dashboard/${id}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs text-white hover:opacity-90"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </Link>
        )}
      </div>
    </header>
  )
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add components/builder/Toolbar.tsx
git commit -m "feat: add theme toggle button and conditional Toolbar classes"
```

---

## Task 4: AIGeneratorBar — Conditional Outer Div + Input

**Files:**
- Modify: `components/builder/AIGeneratorBar.tsx`

- [ ] **Step 1: Add import and hook**

Add after line 1 (`'use client'`):
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Add inside the component body (before the `return`):
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional classes**

Replace the `return (...)` block:

```tsx
  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
      isDark
        ? 'border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.04)]'
        : 'border-indigo-200 bg-indigo-50'
    }`}>
      <Sparkles className="h-4 w-4 flex-shrink-0 text-cyan-400" />
      <input
        className={`flex-1 bg-transparent text-sm outline-none ${
          isDark
            ? 'text-[#9ca3af] placeholder:text-[#374151]'
            : 'text-gray-600 placeholder:text-gray-400'
        }`}
        placeholder='e.g. "An analytics dashboard for a SaaS startup tracking MRR, churn, and active users"'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        disabled={isGenerating}
      />
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:opacity-90"
      >
        {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {isGenerating ? 'Generating...' : 'Generate →'}
      </button>
    </div>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/builder/AIGeneratorBar.tsx
git commit -m "feat: apply theme-conditional classes to AIGeneratorBar"
```

---

## Task 5: BuilderCanvas — Conditional bg, Dot Grid, Empty State

**Files:**
- Modify: `components/builder/BuilderCanvas.tsx`

- [ ] **Step 1: Add import and hook**

Add after line 10 (`import { AIGeneratorBar } from './AIGeneratorBar'`):
```tsx
import { useBuilderTheme } from './BuilderThemeProvider'
```

Add inside `BuilderCanvas()` body, before the `return`:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional classes**

Replace the `return (...)` block:

```tsx
  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-full flex-col p-3 ${isDark ? 'bg-[#0f1117]' : 'bg-[#f4f5f7]'}`}
      onClick={() => selectWidget(null)}
    >
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '25px 25px',
          }}
        />
      )}
      <div className="mb-3">
        <AIGeneratorBar />
      </div>

      {widgets.length === 0 ? (
        <div className={`flex min-h-[60vh] flex-col items-center justify-center gap-3 ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
          <LayoutGrid className="h-12 w-12 opacity-30" />
          <p className="text-sm">Drag a component or describe your dashboard above</p>
        </div>
      ) : (
        <div className={`relative ${isGenerating ? 'pointer-events-none opacity-50' : ''}`}>
          <GridLayout
            layout={layout}
            width={gridWidth}
            gridConfig={{ cols: 12, rowHeight: 80, margin: [12, 12] as [number, number] }}
            dragConfig={{ enabled: true, bounded: false, handle: '.drag-handle', threshold: 3 }}
            resizeConfig={{ enabled: true, handles: ['se'] as const }}
            onLayoutChange={handleLayoutChange}
          >
            {widgets.map((widget) => (
              <div key={widget.id} onClick={(e) => e.stopPropagation()}>
                <WidgetWrapper
                  widgetId={widget.id}
                  title={widget.config.title}
                >
                  <WidgetRenderer
                    widget={widget}
                    isSelected={selectedWidgetId === widget.id}
                    onSelect={() => selectWidget(widget.id)}
                    onDelete={() => removeWidget(widget.id)}
                  />
                </WidgetWrapper>
              </div>
            ))}
          </GridLayout>
        </div>
      )}
    </div>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/builder/BuilderCanvas.tsx
git commit -m "feat: apply theme-conditional classes to BuilderCanvas"
```

---

## Task 6: LeftSidebar — Conditional Classes

**Files:**
- Modify: `components/builder/LeftSidebar.tsx`

- [ ] **Step 1: Add import and hook**

Add to imports (after `import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'`):
```tsx
import { useBuilderTheme } from './BuilderThemeProvider'
```

Add inside `LeftSidebar()` body, before the `return`:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional classes**

Replace the `return (...)` block:

```tsx
  return (
    <aside className={`flex h-full w-[260px] flex-shrink-0 flex-col ${
      isDark ? 'bg-[#0f1117]' : 'bg-white border-r border-gray-200'
    }`}>
      <div className={`flex items-center gap-2 p-4 ${
        isDark ? 'border-b border-[#1f2937]' : 'border-b border-gray-200'
      }`}>
        <div className="h-6 w-6 rounded bg-indigo-600" />
        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mozaiq</span>
      </div>

      <Tabs defaultValue="components" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className={`mx-3 mt-2 grid grid-cols-2 ${isDark ? 'bg-[#1f2937]' : 'bg-gray-100'}`}>
          <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 overflow-y-auto p-3">
          {CATEGORIES.map((cat) => {
            const catWidgets = WIDGET_TYPES.filter(
              (t) => widgetRegistry[t].category === cat
            )
            if (!catWidgets.length) return null
            return (
              <div key={cat} className="mb-4">
                <p className={`mb-2 text-[10px] uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  {cat}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {catWidgets.map((type) => {
                    const entry = widgetRegistry[type]
                    return (
                      <ComponentTile
                        key={type}
                        type={type}
                        label={entry.label}
                        icon={entry.icon}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="templates" className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-2">
            <TemplateCard templateKey="analytics" name="Analytics" description="MRR, users, conversion" icon="📊" />
            <TemplateCard templateKey="inventory" name="Inventory" description="SKUs, stock levels, value" icon="📦" />
            <TemplateCard templateKey="purchasing" name="Purchasing" description="POs, vendor spend, delivery" icon="🛒" />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/builder/LeftSidebar.tsx
git commit -m "feat: apply theme-conditional classes to LeftSidebar"
```

---

## Task 7: ComponentTile + TemplateCard — Conditional Classes

**Files:**
- Modify: `components/builder/ComponentTile.tsx`
- Modify: `components/builder/TemplateCard.tsx`

- [ ] **Step 1: Update ComponentTile**

Replace entire file content:

```tsx
'use client'
import type { LucideIcon } from 'lucide-react'
import type { WidgetType } from '@/types/dashboard'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'

interface Props { type: WidgetType; label: string; icon: LucideIcon }

export function ComponentTile({ type, label, icon: Icon }: Props) {
  const addWidget = useDashboardStore((s) => s.addWidget)
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => addWidget(type)}
      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition ${
        isDark
          ? 'border-[#2d3748] bg-[#1a2035] hover:border-indigo-500 hover:bg-[#1f2a42]'
          : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-gray-100'
      }`}
    >
      <Icon className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
      <span className={`text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
    </button>
  )
}
```

- [ ] **Step 2: Update TemplateCard**

Replace entire file content:

```tsx
'use client'
import type { TemplateKey } from '@/types/dashboard'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'

interface Props { templateKey: TemplateKey; name: string; description: string; icon: string }

export function TemplateCard({ templateKey, name, description, icon }: Props) {
  const loadTemplate = useDashboardStore((s) => s.loadTemplate)
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => loadTemplate(templateKey)}
      className={`w-full rounded-lg border p-3 text-left transition ${
        isDark
          ? 'border-[#2d3748] bg-[#1a2035] hover:border-indigo-500'
          : 'border-gray-200 bg-white hover:border-indigo-300'
      }`}
    >
      <div className="mb-1 text-xl">{icon}</div>
      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
      <p className={`mt-0.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
    </button>
  )
}
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/builder/ComponentTile.tsx components/builder/TemplateCard.tsx
git commit -m "feat: apply theme-conditional classes to ComponentTile and TemplateCard"
```

---

## Task 8: RightPanel — Conditional Classes

**Files:**
- Modify: `components/builder/RightPanel.tsx`

- [ ] **Step 1: Add import and hook**

Add after the existing imports:
```tsx
import { useBuilderTheme } from './BuilderThemeProvider'
```

Add inside `RightPanel()` body, before `const [collapsed, setCollapsed] = useState(false)`:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional classes**

Replace the entire `return (...)` block (both the collapsed `if` branch and the main `return`):

```tsx
  const asideClass = `border-l ${isDark ? 'border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]' : 'border-gray-200 bg-white'}`
  const collapseButtonClass = `absolute -left-3 top-4 rounded-full border p-0.5 ${
    isDark ? 'border-[rgba(255,255,255,0.1)] bg-[#0a0a0f] text-[#4b5563]' : 'border-gray-200 bg-white text-gray-500'
  }`
  const inputClass = `w-full rounded border px-2 py-1.5 text-sm outline-none ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`

  if (collapsed) {
    return (
      <aside className={`relative flex w-6 flex-shrink-0 ${asideClass}`}>
        <button onClick={() => setCollapsed(false)} className={collapseButtonClass}>
          <ChevronLeft className="h-3 w-3" />
        </button>
      </aside>
    )
  }

  return (
    <aside className={`relative flex h-full w-[280px] flex-shrink-0 flex-col ${asideClass}`}>
      <button onClick={() => setCollapsed(true)} className={collapseButtonClass}>
        <ChevronRight className="h-3 w-3" />
      </button>

      {!widget ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className={`text-center text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>Select a widget to edit its properties</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div>
            <p className={`mb-1 text-[10px] uppercase tracking-wider ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>General</p>
            <label htmlFor="widget-title" className={`mb-1 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`}>Title</label>
            <input
              id="widget-title"
              className={inputClass}
              value={widget.config.title}
              onChange={(e) => updateWidgetConfig(widget.id, { title: e.target.value })}
            />
            <label htmlFor="widget-desc" className={`mb-1 mt-2 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`}>Description</label>
            <textarea
              id="widget-desc"
              className={inputClass}
              rows={2}
              value={widget.config.description ?? ''}
              onChange={(e) => updateWidgetConfig(widget.id, { description: e.target.value })}
            />
          </div>

          {COLOR_WIDGET_TYPES.has(widget.type) && (
            <div>
              <p className={`mb-1 text-[10px] uppercase tracking-wider ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>Appearance</p>
              <label className={`mb-1 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`}>Accent Color</label>
              <input
                type="color"
                className={`h-8 w-full cursor-pointer rounded border ${isDark ? 'border-[rgba(255,255,255,0.1)]' : 'border-gray-200'}`}
                value={(widget.config as KPIConfig | ChartConfig | GaugeConfig).color ?? '#6366f1'}
                onChange={(e) => updateWidgetConfig(widget.id, { color: e.target.value })}
              />
            </div>
          )}

          <div>
            <p className={`mb-1 text-[10px] uppercase tracking-wider ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>Data</p>
            <p className={`text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>Live data connections available in v2</p>
          </div>
        </div>
      )}
    </aside>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/builder/RightPanel.tsx
git commit -m "feat: apply theme-conditional classes to RightPanel"
```

---

## Task 9: WidgetWrapper — Conditional bg and Ring

**Files:**
- Modify: `components/widgets/WidgetWrapper.tsx`

- [ ] **Step 1: Add import and hook**

Add after line 4 (`import { cn } from '@/lib/utils'`):
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Add inside `WidgetWrapper()` body, after the existing destructures:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional classes**

Replace the `cn(...)` call on the outer div:

```tsx
      className={cn(
        'group relative h-full w-full rounded-lg shadow-sm',
        isDark ? 'bg-[#161b27]' : 'bg-white',
        isSelected && !isReadOnly && (isDark ? 'ring-2 ring-cyan-500' : 'ring-2 ring-indigo-500'),
      )}
```

Replace the grip icon class:
```tsx
            <GripVertical className={`h-4 w-4 ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`} />
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/widgets/WidgetWrapper.tsx
git commit -m "feat: apply theme-conditional classes to WidgetWrapper"
```

---

## Task 10: KPICard — Conditional Text

**Files:**
- Modify: `components/widgets/KPICard.tsx`

- [ ] **Step 1: Add import and hook**

Add after `import { cn } from '@/lib/utils'`:
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Add inside `KPICard()` body:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional text classes**

Replace the `return (...)` block:

```tsx
  return (
    <div className="flex h-full flex-col justify-between p-4">
      <p className={`text-sm font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-500'}`}>{c.title}</p>
      <div>
        <p className={`text-2xl font-bold ${isDark ? 'text-[#f9fafb]' : 'text-gray-900'}`}>
          {c.prefix}{c.value}{c.suffix}
        </p>
        <div className={cn(
          'mt-1 flex items-center gap-1 text-xs font-medium',
          isPositive ? 'text-emerald-600' : 'text-red-500'
        )}>
          {isPositive
            ? <TrendingUp className="h-3.5 w-3.5" />
            : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{isPositive ? '+' : ''}{c.change}% {c.changeLabel}</span>
        </div>
      </div>
    </div>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/widgets/KPICard.tsx
git commit -m "feat: apply theme-conditional text to KPICard"
```

---

## Task 11: Chart Widgets — Conditional Title Text (5 files)

**Files:**
- Modify: `components/widgets/LineChartWidget.tsx`
- Modify: `components/widgets/AreaChartWidget.tsx`
- Modify: `components/widgets/BarChartWidget.tsx`
- Modify: `components/widgets/DonutChartWidget.tsx`
- Modify: `components/widgets/FunnelChartWidget.tsx`

All 5 files only need the title `<p>` text class changed. Each file currently has `text-[#e5e7eb]` on the title. The change is identical in each.

All five files follow the exact same pattern. For each file, the change is:

1. Add import after the existing imports:
   ```tsx
   import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
   ```
2. Add hook inside the component body (before the `return`):
   ```tsx
     const { theme } = useBuilderTheme()
     const isDark = theme === 'dark'
   ```
3. Change the title `<p>` from `text-[#e5e7eb]` to a conditional:
   ```tsx
   // Before:
   <p className="mb-2 text-sm font-medium text-[#e5e7eb]">{c.title}</p>
   // After:
   <p className={`mb-2 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
   ```

- [ ] **Step 1: Confirm all 5 files have `text-[#e5e7eb]` on the title `<p>`**

Run:
```bash
grep -n 'text-\[#e5e7eb\]' components/widgets/LineChartWidget.tsx components/widgets/AreaChartWidget.tsx components/widgets/BarChartWidget.tsx components/widgets/DonutChartWidget.tsx components/widgets/FunnelChartWidget.tsx
```
Expected: each file shows one match on the title `<p>` line. If any file is missing or has a different class, adjust that file's change accordingly rather than using the pattern above.

- [ ] **Step 2: Update LineChartWidget.tsx**

Apply the three changes described above.

- [ ] **Step 3: Update AreaChartWidget.tsx**

Apply the three changes described above.

- [ ] **Step 4: Update BarChartWidget.tsx**

Apply the three changes described above.

- [ ] **Step 5: Update DonutChartWidget.tsx**

Apply the three changes described above.

- [ ] **Step 6: Update FunnelChartWidget.tsx**

Apply the three changes described above. Note: FunnelChartWidget also has a `<LabelList fill="#9ca3af" />` prop — this is a Recharts SVG prop and is explicitly **out of scope** per the spec. Do not change it.

- [ ] **Step 7: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add components/widgets/LineChartWidget.tsx components/widgets/AreaChartWidget.tsx components/widgets/BarChartWidget.tsx components/widgets/DonutChartWidget.tsx components/widgets/FunnelChartWidget.tsx
git commit -m "feat: apply theme-conditional title text to chart widgets"
```

---

## Task 12: GaugeWidget — Conditional Text + RadialBar Fill

**Files:**
- Modify: `components/widgets/GaugeWidget.tsx`

Two changes: (1) title text + centre value span text class; (2) `RadialBar` `background.fill` prop.

- [ ] **Step 1: Add import and hook**

Add after `import type { WidgetProps, GaugeConfig } from '@/types/dashboard'`:
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Add inside `GaugeWidget()` body:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional classes and prop**

Replace `return (...)`:

```tsx
  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <p className={`mb-1 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <div className="relative h-32 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
            startAngle={180} endAngle={0} data={data}
          >
            <RadialBar
              dataKey="value"
              cornerRadius={4}
              background={{ fill: isDark ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pt-6">
          <span className={`text-xl font-bold ${isDark ? 'text-[#f9fafb]' : 'text-gray-900'}`}>{c.value}{c.unit}</span>
        </div>
      </div>
    </div>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/widgets/GaugeWidget.tsx
git commit -m "feat: apply theme-conditional classes and RadialBar fill to GaugeWidget"
```

---

## Task 13: ProgressTracker — Conditional Text + Track Background

**Files:**
- Modify: `components/widgets/ProgressTracker.tsx`

Three changes: title text, row label/value text, and the track `<div>` background.

- [ ] **Step 1: Add import and hook**

Add after `import type { WidgetProps, ProgressConfig } from '@/types/dashboard'`:
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Add inside `ProgressTracker()` body:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional classes**

Replace `return (...)`:

```tsx
  return (
    <div className="flex h-full flex-col p-4">
      <p className={`mb-3 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <div className="flex flex-col gap-3 overflow-auto">
        {items.map((item, i) => {
          const pct = Math.round((item.value / item.max) * 100)
          return (
            <div key={i}>
              <div className={`mb-1 flex justify-between text-xs ${isDark ? 'text-[#9ca3af]' : 'text-gray-500'}`}>
                <span>{item.label}</span>
                <span className={isDark ? 'text-[#6b7280]' : 'text-gray-400'}>{item.value}/{item.max} ({pct}%)</span>
              </div>
              <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-gray-100'}`}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: item.color ?? '#6366f1' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/widgets/ProgressTracker.tsx
git commit -m "feat: apply theme-conditional classes and track bg to ProgressTracker"
```

---

## Task 14: ActivityFeed + TextNoteWidget — Conditional Text

**Files:**
- Modify: `components/widgets/ActivityFeed.tsx`
- Modify: `components/widgets/TextNoteWidget.tsx`

- [ ] **Step 1: Update ActivityFeed.tsx**

Add import:
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Add hook inside component:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

Replace `return (...)`:

```tsx
  return (
    <div className="flex h-full flex-col p-4">
      <p className={`mb-3 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <div className="flex flex-col gap-2 overflow-auto">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-2">
            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
            <div className="min-w-0">
              <p className={`truncate text-xs ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{event.label}</p>
              <p className={`text-[10px] ${isDark ? 'text-[#6b7280]' : 'text-gray-400'}`}>{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
```

- [ ] **Step 2: Update TextNoteWidget.tsx**

Add import:
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Add hook inside component:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

Replace `return (...)`:

```tsx
  return (
    <div className="flex h-full flex-col p-4">
      <p className={`mb-2 text-sm font-semibold ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <p className={`whitespace-pre-wrap text-sm ${isDark ? 'text-[#9ca3af]' : 'text-gray-500'}`}>{c.content || 'Click to add a note...'}</p>
    </div>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add components/widgets/ActivityFeed.tsx components/widgets/TextNoteWidget.tsx
git commit -m "feat: apply theme-conditional text to ActivityFeed and TextNoteWidget"
```

---

## Task 15: DataTableWidget — Conditional Text + Row bg + Header Border

**Files:**
- Modify: `components/widgets/DataTableWidget.tsx`

Four targeted changes: title text, `<th>` text, `<td>` text, row odd/even bg classes, header border.

- [ ] **Step 1: Add import and hook**

Add after `import { ChevronUp, ChevronDown } from 'lucide-react'`:
```tsx
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
```

Add inside `DataTableWidget()` body, before `const columns = ...`:
```tsx
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
```

- [ ] **Step 2: Apply conditional classes**

Replace `return (...)`:

```tsx
  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <p className={`mb-2 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className={`border-b ${isDark ? 'border-[rgba(255,255,255,0.08)]' : 'border-gray-200'}`}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`pb-1 text-left font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-500'} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => {
                    if (!col.sortable) return
                    if (sortKey === col.key) setSortAsc(!sortAsc)
                    else { setSortKey(col.key); setSortAsc(true) }
                  }}
                >
                  <span className="flex items-center gap-0.5">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className={
                i % 2 === 0
                  ? (isDark ? 'bg-transparent' : 'bg-white')
                  : (isDark ? 'bg-[rgba(255,255,255,0.04)]' : 'bg-gray-50')
              }>
                {columns.map((col) => (
                  <td key={col.key} className={`py-1 pr-2 ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>
                    {String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Run full test suite**

```bash
npx jest --no-coverage
```

Expected: all tests pass (including the BuilderThemeProvider tests from Task 1)

- [ ] **Step 5: Commit**

```bash
git add components/widgets/DataTableWidget.tsx
git commit -m "feat: apply theme-conditional classes to DataTableWidget"
```

---

## Final Verification

- [ ] Start the dev server: `npm run dev`
- [ ] Open `http://localhost:3000/builder`
- [ ] Verify the builder loads in dark mode
- [ ] Click the Sun/Moon toggle in the toolbar — the builder should switch to light mode (white sidebars, light canvas, white widget cards)
- [ ] Refresh the page — light mode should persist (localStorage)
- [ ] Toggle back to dark — all components return to original dark styles
- [ ] Add a widget (e.g. KPI Card) — widget card background and text adapt to the current theme
- [ ] Check the RightPanel inputs in both themes — they should have appropriate border/text colours
