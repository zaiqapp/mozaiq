# Mozaiq Dashboard Builder — Design Spec
**Date:** 2026-03-24
**Status:** Approved

---

## Overview

Mozaiq is a production-ready, open source drag-and-drop dashboard builder. The product is open core (AGPL-3.0) with a planned hosted SaaS layer in later versions.

**Product name:** Mozaiq
**Domain:** zaiq.app
**GitHub:** github.com/zaiq/mozaiq
**Tagline:** "Build beautiful dashboards in minutes"

**Target use cases:**
- Analytics dashboards (revenue, users, conversion)
- Inventory dashboards (stock levels, SKUs, turnover)
- Purchasing dashboards (POs, vendor spend, lead times)

---

## V1 Scope

### In scope
- Drag-and-drop canvas builder with react-grid-layout
- 11 widget types with realistic mock data
- 3 starter templates (Analytics, Inventory, Purchasing)
- AI Dashboard Generator (natural language → full dashboard)
- Save dashboard to database
- Shareable read-only view via `/dashboard/[id]`
- Embeddable via iframe (automatic from share URL)
- Landing page with pricing scaffold (billing not wired)
- One-click Deploy to Vercel button in README
- AGPL-3.0 open source license

### Explicitly out of scope for v1
- User authentication (deferred to v2)
- `/my-dashboards` page (requires auth)
- AI widget title suggestion (deferred — low impact)
- Billing/Stripe integration (deferred to v3)
- Real data source connectors (Google Sheets, CSV, API — v2)
- AI chart insights on share view (v2)
- AI template customization (v2)

---

## Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) | Not v14 as in original prompt |
| Styling | Tailwind CSS + shadcn/ui | shadcn for all /components/ui primitives |
| Canvas | react-grid-layout | Must use `dynamic(() => import(...), { ssr: false })` |
| Charts | recharts | All chart widgets |
| State | zustand | Client-side builder state only |
| Database | Neon Postgres (via Vercel Marketplace) | Replaces Supabase — no separate account needed |
| ORM | Prisma | With `@neondatabase/serverless` adapter |
| AI | AI SDK v6 + Vercel AI Gateway | Replaces direct `@anthropic-ai/sdk` |
| AI Model | `anthropic/claude-sonnet-4.6` | Via AI Gateway string routing |
| Icons | lucide-react | |
| Toasts | sonner | |
| IDs | nanoid | Dashboard share IDs |

### Key dependency changes from original spec
- **No `@anthropic-ai/sdk`** — replaced by `ai` + AI Gateway
- **No `@upstash/ratelimit`** — AI Gateway handles per-user rate limiting natively
- **No provider API keys** — OIDC auth via `vercel env pull` provisions `VERCEL_OIDC_TOKEN` automatically
- **No NextAuth.js** — auth deferred to v2 entirely

---

## Architecture

### Core pattern: Widget Registry

The central architectural improvement over the spec. A single `lib/widget-registry.ts` maps every widget type to its component, default size, label, and icon. All consumer code reads from this registry — no switch statements, no scattered widget-type conditionals.

```ts
// lib/widget-registry.ts
export const widgetRegistry: Record<WidgetType, WidgetRegistryEntry> = {
  'kpi':              { component: KPICard,             defaultSize: { w: 3,  h: 2 }, label: 'KPI Card',        icon: BarChart2   },
  'line-chart':       { component: LineChartWidget,      defaultSize: { w: 6,  h: 4 }, label: 'Line Chart',      icon: TrendingUp  },
  'area-chart':       { component: AreaChartWidget,      defaultSize: { w: 6,  h: 4 }, label: 'Area Chart',      icon: TrendingUp  },
  'bar-chart':        { component: BarChartWidget,       defaultSize: { w: 6,  h: 4 }, label: 'Bar Chart',       icon: BarChart    },
  'donut-chart':      { component: DonutChartWidget,     defaultSize: { w: 6,  h: 4 }, label: 'Donut Chart',     icon: PieChart    },
  'funnel-chart':     { component: FunnelChartWidget,    defaultSize: { w: 6,  h: 4 }, label: 'Funnel Chart',    icon: Filter      },
  'gauge':            { component: GaugeWidget,          defaultSize: { w: 3,  h: 3 }, label: 'Gauge',           icon: Activity    },
  'data-table':       { component: DataTableWidget,      defaultSize: { w: 12, h: 4 }, label: 'Data Table',      icon: Table       },
  'progress-tracker': { component: ProgressTracker,      defaultSize: { w: 4,  h: 4 }, label: 'Progress',        icon: CheckSquare },
  'activity-feed':    { component: ActivityFeed,         defaultSize: { w: 4,  h: 4 }, label: 'Activity Feed',   icon: Zap         },
  'text-note':        { component: TextNoteWidget,       defaultSize: { w: 6,  h: 2 }, label: 'Text / Note',     icon: FileText    },
}
```

**Benefits:**
- Adding a new widget type = one registry entry + one component file
- Left sidebar auto-populates from registry
- `addWidget()` reads default sizes from registry
- `WidgetRenderer` resolves components from registry
- Open source contributors can add widgets without hunting for switch statements

### Rendering chain

```
react-grid-layout (SSR-disabled dynamic import)
  └── WidgetWrapper        — selection ring, drag handle, delete ×, ErrorBoundary
        └── WidgetRenderer  — registry lookup → correct component
              └── KPICard / LineChartWidget / etc.
```

### Component boundaries

- `BuilderCanvas` — `'use client'`, owns the react-grid-layout instance
- `LeftSidebar` — `'use client'`, reads zustand store + widget registry
- `RightPanel` — `'use client'`, reads/writes selected widget config via zustand
- `Toolbar` — `'use client'`, save/share actions
- `AIGeneratorBar` — `'use client'`, prompt input + generate button
- Landing page (`app/page.tsx`) — Server Component, fully static
- Share view (`app/dashboard/[id]/page.tsx`) — Server Component, fetches from DB

---

## Widget Types (11)

### Sidebar grouping
- **Metrics:** KPI Card, Gauge
- **Charts:** Line Chart, Area Chart, Bar Chart, Donut Chart, Funnel Chart
- **Data:** Data Table, Progress Tracker
- **Misc:** Activity Feed, Text / Note

### Widget component contract
```ts
interface WidgetProps {
  config: WidgetConfig
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  isReadOnly?: boolean
}
```

### Mock data strategy
Each widget defines its own static mock data locally. When `config.data` is present (e.g., from AI generation), it uses that. Otherwise falls back to built-in mock. Widgets always render meaningfully on drop.

### Error handling
Every `WidgetWrapper` wraps its content in an `ErrorBoundary`. A broken widget renders a friendly fallback card and never crashes the canvas.

---

## AI Integration

### Route: `POST /api/ai/generate`

**Stack:** AI SDK v6 `generateText` + AI Gateway string routing

```ts
import { generateText } from 'ai'

const { text } = await generateText({
  model: 'anthropic/claude-sonnet-4.6',
  system: SYSTEM_PROMPT,
  messages: [{ role: 'user', content: prompt }],
  maxTokens: 2000,
  providerOptions: {
    gateway: {
      tags: ['feature:ai-generate'],
      user: clientIp,
    }
  }
})
```

**Rate limiting:** AI Gateway's built-in per-user rate limiting (configured in Vercel dashboard). No Upstash Redis needed for v1.

**Response validation:** `validateDashboardShape()` in `lib/ai.ts` — checks all required fields, strips unknown properties, verifies unique widget IDs. Returns 500 if validation fails rather than loading a broken state into Zustand.

**System prompt:** Covers all 11 widget types and their config shapes. Rules: 12-column grid, 4 KPI cards at top of every dashboard, 4-8 total widgets, realistic mock data for the described business context. Returns raw JSON only.

**Scaffolded routes (return 501 in v1):**
- `POST /api/ai/suggest-title` — v2
- `POST /api/ai/insights` — v2

### Authentication
```
# .env.example
VERCEL_OIDC_TOKEN=     # auto-provisioned via `vercel env pull` — no manual key needed
DATABASE_URL=          # auto-provisioned via Neon Marketplace install
NEXT_PUBLIC_APP_URL=   # e.g. https://zaiq.app
```

No provider API keys required — AI Gateway handles all provider auth via OIDC.

---

## Data Layer

### Prisma Schema

```prisma
model User {
  id         String      @id @default(cuid())
  email      String?     @unique
  name       String?
  image      String?
  plan       Plan        @default(FREE)
  dashboards Dashboard[]
  createdAt  DateTime    @default(now())
}

model Dashboard {
  id          String   @id @default(nanoid(10))
  name        String   @default("Untitled Dashboard")
  description String?
  layout      Json
  widgets     Json
  isPublic    Boolean  @default(true)
  views       Int      @default(0)      // incremented on share view load
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

enum Plan {
  FREE
  PRO
  WHITELABEL
}

model GenerationLog {
  id          String   @id @default(cuid())
  prompt      String
  success     Boolean
  widgetCount Int?
  createdAt   DateTime @default(now())
}
```

**Notes:**
- `User` and `Plan` schema are dormant in v1 (no auth) but ready for v2 migration-free
- `views` counter on Dashboard is new vs spec — useful for product metrics post-launch
- Neon provisioned via `vercel integration add neon` — auto-injects `DATABASE_URL`

---

## TypeScript Types

### WidgetType (extended from spec)
```ts
export type WidgetType =
  | 'kpi'
  | 'line-chart'
  | 'area-chart'        // new
  | 'bar-chart'
  | 'donut-chart'
  | 'funnel-chart'      // new
  | 'gauge'             // new
  | 'data-table'
  | 'progress-tracker'
  | 'activity-feed'
  | 'text-note'         // new
```

All other types (`Widget`, `DashboardState`, `WidgetConfig` subtypes, `DataSource`) remain as spec'd.

### Zustand Store
Unchanged from spec. `generateDashboard` action uses `fetch('/api/ai/generate')` — no direct AI SDK imports on the client.

---

## Routes

### Page routes
```
/                    → Landing page (Server Component, static)
/builder             → New dashboard (client boundary at BuilderCanvas)
/builder/[id]        → Edit existing dashboard
/dashboard/[id]      → Read-only share view (Server Component, increments views)
```

### API routes
```
POST   /api/dashboards          → create, returns { id, shareUrl }
GET    /api/dashboards          → list all (v1: unscoped)
GET    /api/dashboards/[id]     → fetch one
PATCH  /api/dashboards/[id]     → update name/layout/widgets
DELETE /api/dashboards/[id]     → delete, returns 204
POST   /api/ai/generate         → prompt → DashboardState JSON
POST   /api/ai/suggest-title    → 501 scaffold
POST   /api/ai/insights         → 501 scaffold
GET|POST /api/auth/[...nextauth] → 501 scaffold (v2)
```

### Next.js 16 async params
All dynamic routes use `await params`:
```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### `proxy.ts`
Minimal — sets security headers only. Replaces `middleware.ts` (Next.js 16 rename). Located at project root alongside `app/`.

---

## Builder UI Layout (Option A)

**Full viewport height, no page scroll. Four regions:**

### Top Toolbar (48px)
- Background: white, border-bottom
- Left: Mozaiq logo + name
- Center: editable dashboard name (inline edit on click)
- Right: Clear | Save (spinner + toast) | Share (copies URL + toast) | Preview (new tab)

### Left Sidebar (260px)
- Background: `#0f1117`, white text
- Tab 1 — Components: widget tiles from registry, grouped by category
- Tab 2 — Templates: 3 template cards (Analytics, Inventory, Purchasing)

### Main Canvas (flex-1)
- Background: `#f4f5f7`
- AI Generator Bar pinned above the grid (full-width prompt input + Generate button)
- react-grid-layout: 12 columns, rowHeight: 80, margin: [12, 12]
- Empty state: centered icon + "Drag a component or describe your dashboard above"
- Selected widget: 2px solid indigo ring
- Widget hover: drag handle top, delete × top-right
- All widgets resizable via react-grid-layout handle

### Right Panel (280px, collapsible)
- Background: white, border-left
- Visible only when a widget is selected
- Sections: General (title, description), Appearance (color picker), Data (mock preview, read-only v1)

---

## Landing Page Structure

1. **Navbar** — Logo, Docs, GitHub, "Start Building Free" CTA
2. **Hero** — Dark background, headline, subheadline, dual CTAs (builder + GitHub), screenshot placeholder
3. **Features** — 6 cards: Drag & Drop, AI Generator, Share Anywhere, Starter Templates, Open Source, Data Ready (tagged v2)
4. **Templates Preview** — 3 cards: Analytics, Inventory, Purchasing
5. **Pricing** — 3 tiers (Free / Pro / White-label), Pro + White-label show "Coming soon", note: "self-host for free forever"
6. **Footer** — GitHub, Self-host, Roadmap links

---

## File Structure

```
/app
  layout.tsx
  page.tsx                          ← landing page (Server Component)
  proxy.ts                          ← security headers (Next.js 16)
  /builder
    page.tsx
    /[id]
      page.tsx
  /dashboard
    /[id]
      page.tsx                      ← read-only share view
  /api
    /dashboards
      route.ts
      /[id]
        route.ts
    /auth
      /[...nextauth]
        route.ts                    ← 501 scaffold
    /ai
      /generate
        route.ts
      /suggest-title
        route.ts                    ← 501 scaffold
      /insights
        route.ts                    ← 501 scaffold

/components
  /builder
    BuilderCanvas.tsx
    LeftSidebar.tsx
    RightPanel.tsx
    Toolbar.tsx
    ComponentTile.tsx
    TemplateCard.tsx
    AIGeneratorBar.tsx
  /widgets
    WidgetRenderer.tsx
    WidgetWrapper.tsx
    KPICard.tsx
    LineChartWidget.tsx
    AreaChartWidget.tsx
    BarChartWidget.tsx
    DonutChartWidget.tsx
    FunnelChartWidget.tsx
    GaugeWidget.tsx
    DataTableWidget.tsx
    ProgressTracker.tsx
    ActivityFeed.tsx
    TextNoteWidget.tsx
  /ui
    (shadcn/ui primitives: Button, Input, Tabs, Badge, etc.)

/lib
  widget-registry.ts                ← central widget map
  templates.ts                      ← 3 template DashboardState snapshots
  mockData.ts                       ← shared mock data helpers
  utils.ts                          ← cn(), nanoid helpers
  ai.ts                             ← system prompt + validateDashboardShape()

/store
  dashboard.ts                      ← zustand store

/types
  dashboard.ts

/prisma
  schema.prisma

README.md
ROADMAP.md
LICENSE                             ← AGPL-3.0
.env.example
.gitignore                          ← includes .env*.local, .superpowers/
```

---

## Implementation Order

1. Scaffold all files with correct imports and type signatures
2. Widget registry + all 11 widget components with mock data
3. Core builder: add widget → resize/drag → configure in right panel → zustand state
4. 3 templates fully wired
5. **AI Generator bar + `/api/ai/generate`** — first working demo milestone
6. API routes + Prisma + Neon — save/share/read-only flow end-to-end
7. Landing page
8. Polish: empty states, error boundaries, loading states, toasts
9. README + ROADMAP + LICENSE + Deploy to Vercel button

---

## Error Handling

- `react-grid-layout`: dynamic import with `ssr: false` — critical, hydration breaks without it
- Every widget: `ErrorBoundary` with friendly fallback card
- All API routes: typed error responses with correct HTTP status codes
- Empty canvas: clear empty state with instructions
- Save button: disabled while saving, success/error toast
- Share button: clipboard with graceful fallback for older browsers
- `/dashboard/[id]`: 404 page if ID not found
- AI generation: error toast on failure, canvas unchanged

---

## Version Roadmap Summary

| Version | Focus |
|---|---|
| **V1 (current)** | Open source MVP — builder, 11 widgets, 3 templates, AI generator, save/share |
| V2 | Auth (NextAuth.js), user accounts, Google Sheets + CSV connectors, AI insights |
| V3 | Stripe billing, Free/Pro/White-label tiers |
| V4 | Teams, RBAC, REST API connector, JS embed snippet |
| V5 | Custom domains, full white-label, direct DB connectors |
