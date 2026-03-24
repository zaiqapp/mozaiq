# Mozaiq Dashboard Builder — Design Spec
**Date:** 2026-03-24
**Status:** Approved (rev 2)

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
- AI widget title suggestion (deferred)
- Billing/Stripe integration (deferred to v3)
- Real data source connectors (v2)
- AI chart insights on share view (v2)
- AI template customization (v2)

---

## Tech Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, TypeScript strict) | |
| Styling | Tailwind CSS + shadcn/ui | shadcn for all /components/ui primitives |
| Canvas | react-grid-layout | Must use dynamic import with ssr: false |
| Charts | recharts | All chart widgets |
| State | zustand | Client-side builder state only |
| Database | Neon Postgres (via Vercel Marketplace) | |
| ORM | Prisma | With @neondatabase/serverless adapter |
| AI | AI SDK v6 + Vercel AI Gateway | |
| AI Model | `anthropic/claude-sonnet-4.6` | Verify slug via `gateway.getAvailableModels()` at impl time |
| Icons | lucide-react | |
| Toasts | sonner | |
| IDs | nanoid | Generated at application layer, not Prisma default |

### Key dependency changes from original spec
- **No `@anthropic-ai/sdk`** — replaced by `ai` + AI Gateway
- **No `@upstash/ratelimit`** — AI Gateway handles per-user rate limiting natively
- **No provider API keys** — OIDC auth via `vercel env pull` provisions `VERCEL_OIDC_TOKEN` automatically
- **No NextAuth.js** — auth deferred to v2 entirely

---

## TypeScript Types

### `/types/dashboard.ts` — full definitions

```ts
import type { Layout } from 'react-grid-layout'

export type WidgetType =
  | 'kpi'
  | 'line-chart'
  | 'area-chart'
  | 'bar-chart'
  | 'donut-chart'
  | 'funnel-chart'
  | 'gauge'
  | 'data-table'
  | 'progress-tracker'
  | 'activity-feed'
  | 'text-note'

export type TemplateKey = 'analytics' | 'inventory' | 'purchasing'

// Shared base
export interface BaseWidgetConfig {
  title: string
  description?: string
}

// Per-type configs
export interface KPIConfig extends BaseWidgetConfig {
  value: string | number
  change: number           // percentage, positive = up
  changeLabel: string      // e.g. "vs last month"
  prefix?: string          // e.g. "$"
  suffix?: string          // e.g. "%"
  color?: string           // hex, defaults to indigo
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: unknown   // additional series keys
}

export interface ChartConfig extends BaseWidgetConfig {
  dataKey: string          // which key in ChartDataPoint to plot
  color?: string           // hex, single series color
  data?: ChartDataPoint[]  // populated by AI; falls back to widget mock data
}

export interface FunnelConfig extends BaseWidgetConfig {
  data?: { name: string; value: number; fill?: string }[]
}

export interface GaugeConfig extends BaseWidgetConfig {
  value: number            // current value
  min?: number             // default 0
  max?: number             // default 100
  unit?: string            // e.g. "%", "ms"
  color?: string
}

export interface TableConfig extends BaseWidgetConfig {
  columns: { key: string; label: string; sortable?: boolean }[]
  rows: Record<string, unknown>[]
}

export interface ProgressConfig extends BaseWidgetConfig {
  items: { label: string; value: number; max: number; color?: string }[]
}

export interface ActivityConfig extends BaseWidgetConfig {
  events: { id: string; label: string; time: string; icon?: string }[]
}

export interface TextNoteConfig extends BaseWidgetConfig {
  content: string          // plain text or basic markdown
}

export type WidgetConfig =
  | KPIConfig
  | ChartConfig
  | FunnelConfig
  | GaugeConfig
  | TableConfig
  | ProgressConfig
  | ActivityConfig
  | TextNoteConfig

export interface DataSource {
  type: 'mock' | 'google-sheets' | 'csv' | 'api'
  url?: string
  refreshInterval?: number
}

export interface Widget {
  id: string
  type: WidgetType
  config: WidgetConfig
  dataSource?: DataSource  // scaffold only — wired in v2
  aiInsight?: string       // scaffold only — wired in v2
}

export interface DashboardState {
  id?: string
  name: string
  description?: string
  widgets: Widget[]
  layout: Layout[]
  isDirty: boolean
  isSaving: boolean
  isGenerating: boolean
  selectedWidgetId: string | null
}
```

### Zustand Store — `/store/dashboard.ts`

```ts
interface DashboardStore extends DashboardState {
  addWidget: (type: WidgetType) => void          // reads registry for default size + config
  removeWidget: (id: string) => void
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void
  setLayout: (layout: Layout[]) => void
  selectWidget: (id: string | null) => void
  setDashboardName: (name: string) => void
  loadTemplate: (template: TemplateKey) => void
  loadDashboard: (dashboard: { name: string; widgets: Widget[]; layout: Layout[] }) => void
  clearCanvas: () => void
  saveDashboard: () => Promise<string>           // returns dashboard ID
  generateDashboard: (prompt: string) => Promise<void>
}
```

**`generateDashboard` behavior:**
- Sets `isGenerating: true` and dims canvas with overlay
- On success: calls `loadDashboard()` which **replaces** the entire canvas (widgets + layout)
- On failure: shows error toast, canvas state unchanged
- Sets `isGenerating: false` in finally block

**Color picker target:** The `color` field in `KPIConfig`, `ChartConfig`, and `GaugeConfig` controls the widget's primary accent color (KPI badge/trend, chart line/bar/fill, gauge arc). This is the only user-configurable color in v1. The RightPanel shows a color picker only when the selected widget type has a `color` field in its config.

---

## Architecture

### Core pattern: Widget Registry — `/lib/widget-registry.ts`

```ts
export interface WidgetRegistryEntry {
  component: React.ComponentType<WidgetProps>
  defaultSize: { w: number; h: number }
  defaultConfig: WidgetConfig
  label: string
  icon: LucideIcon
  category: 'metrics' | 'charts' | 'data' | 'misc'
}

export const widgetRegistry: Record<WidgetType, WidgetRegistryEntry> = {
  'kpi':              { component: KPICard,             defaultSize: { w: 3,  h: 2 }, label: 'KPI Card',        icon: BarChart2,   category: 'metrics', defaultConfig: { title: 'KPI', value: 0, change: 0, changeLabel: 'vs last period' } },
  'line-chart':       { component: LineChartWidget,      defaultSize: { w: 6,  h: 4 }, label: 'Line Chart',      icon: TrendingUp,  category: 'charts',  defaultConfig: { title: 'Line Chart', dataKey: 'value' } },
  'area-chart':       { component: AreaChartWidget,      defaultSize: { w: 6,  h: 4 }, label: 'Area Chart',      icon: TrendingUp,  category: 'charts',  defaultConfig: { title: 'Area Chart', dataKey: 'value' } },
  'bar-chart':        { component: BarChartWidget,       defaultSize: { w: 6,  h: 4 }, label: 'Bar Chart',       icon: BarChart,    category: 'charts',  defaultConfig: { title: 'Bar Chart', dataKey: 'value' } },
  'donut-chart':      { component: DonutChartWidget,     defaultSize: { w: 6,  h: 4 }, label: 'Donut Chart',     icon: PieChart,    category: 'charts',  defaultConfig: { title: 'Donut Chart', dataKey: 'value' } },
  'funnel-chart':     { component: FunnelChartWidget,    defaultSize: { w: 6,  h: 4 }, label: 'Funnel Chart',    icon: Filter,      category: 'charts',  defaultConfig: { title: 'Funnel Chart' } },
  'gauge':            { component: GaugeWidget,          defaultSize: { w: 3,  h: 3 }, label: 'Gauge',           icon: Activity,    category: 'metrics', defaultConfig: { title: 'Gauge', value: 75, max: 100, unit: '%' } },
  'data-table':       { component: DataTableWidget,      defaultSize: { w: 12, h: 4 }, label: 'Data Table',      icon: Table,       category: 'data',    defaultConfig: { title: 'Data Table', columns: [], rows: [] } },
  'progress-tracker': { component: ProgressTracker,      defaultSize: { w: 4,  h: 4 }, label: 'Progress',        icon: CheckSquare, category: 'data',    defaultConfig: { title: 'Progress', items: [] } },
  'activity-feed':    { component: ActivityFeed,         defaultSize: { w: 4,  h: 4 }, label: 'Activity Feed',   icon: Zap,         category: 'misc',    defaultConfig: { title: 'Activity', events: [] } },
  'text-note':        { component: TextNoteWidget,       defaultSize: { w: 6,  h: 2 }, label: 'Text / Note',     icon: FileText,    category: 'misc',    defaultConfig: { title: 'Note', content: '' } },
}
```

### Rendering chain

```
react-grid-layout (SSR-disabled via dynamic import)
  └── WidgetWrapper        — selection ring, drag handle, delete ×, ErrorBoundary
        └── WidgetRenderer  — registry lookup → correct component
              └── KPICard / LineChartWidget / etc.
```

### WidgetWrapper wiring

`WidgetWrapper` owns the selection ring, drag handle overlay, and delete button. It receives `widgetId` and calls zustand actions directly (`selectWidget`, `removeWidget`). The leaf widget component receives `isSelected`, `onSelect`, `onDelete`, and `isReadOnly` as props — `onSelect` and `onDelete` are thin wrappers passed down from WidgetWrapper so widgets remain self-contained and testable. `BuilderCanvas` renders a `WidgetWrapper` per layout item; it does not wire individual widget actions.

### Component boundaries

- `BuilderCanvas` — `'use client'`, owns react-grid-layout instance, renders WidgetWrapper per item
- `LeftSidebar` — `'use client'`, reads registry for widget tiles, reads zustand for template loading
- `RightPanel` — `'use client'`, reads/writes selected widget config via zustand
- `Toolbar` — `'use client'`, save/share/clear/preview actions
- `AIGeneratorBar` — `'use client'`, prompt input + generate button, calls `generateDashboard`
- `app/page.tsx` (landing) — Server Component, fully static
- `app/dashboard/[id]/page.tsx` (share view) — Server Component, fetches from DB, increments views

---

## Widget Types (11)

### Widget fidelity for v1 (minimum acceptable)

| Widget | Required | Not required |
|---|---|---|
| KPI Card | Value, label, change badge (green/red), trend arrow | Animation |
| Line/Area Chart | Responsive chart, tooltip, axes | Custom legend, zoom |
| Bar Chart | Grouped bars, tooltip | Animation |
| Donut Chart | Donut with center total, legend | Animation |
| Funnel Chart | Recharts FunnelChart, labels | Animation, % labels |
| Gauge | Radial arc via recharts RadialBarChart, value label | Needle animation |
| Data Table | Sortable columns (click header), zebra rows | Pagination for ≤10 rows |
| Progress Tracker | Labeled bars, value/max, % text | Animation |
| Activity Feed | Scrollable list, dot + label + time | Real-time updates |
| Text/Note | Rendered text content | Markdown parsing (plain text is fine) |

### Widget component contract

```ts
interface WidgetProps {
  config: WidgetConfig
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  isReadOnly?: boolean  // hides drag handle and delete button
}
```

### Mock data strategy
Each widget component defines its own static mock data as a module-level constant. When the appropriate `data`/`items`/`rows`/`events` field is present and non-empty in `config`, it uses that. Otherwise falls back to the module-level mock. This means widgets always render meaningfully on first drop.

### Error handling
Every `WidgetWrapper` wraps its child in a class `ErrorBoundary`. On error the fallback renders a card with the widget title and a neutral error message. A broken widget never crashes the canvas.

---

## AI Integration

### Route: `POST /api/ai/generate`

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

**Rate limiting:** AI Gateway's built-in per-user rate limiting keyed on `clientIp`. Configure max requests in Vercel dashboard → AI Gateway → Rate Limits (suggested: 10 RPM in v1).

### AI response schema

Claude must return a JSON object with this exact shape (enforced by `validateDashboardShape`):

```ts
interface AIGeneratedDashboard {
  name: string
  widgets: {
    id: string                    // unique slug e.g. "kpi-revenue"
    type: WidgetType
    config: WidgetConfig          // must match the type's config shape
  }[]
  layout: {
    i: string                     // must match a widget id
    x: number                     // 0–11
    y: number                     // 0+
    w: number                     // 1–12
    h: number                     // 1–6
  }[]
}
```

### `validateDashboardShape()` in `lib/ai.ts`

Validates the parsed JSON against the schema above:
1. `name` is a non-empty string
2. `widgets` is a non-empty array; each entry has `id` (string), `type` (valid WidgetType), `config` (object with at minimum a `title` string)
3. `layout` is a non-empty array; each entry has `i`, `x`, `y`, `w`, `h` as numbers; `i` values match widget IDs
4. No duplicate widget IDs
5. Strips any unknown top-level keys

Returns the validated `AIGeneratedDashboard` or throws, causing the route to return 500.

### System prompt (defined in `lib/ai.ts`)

Rules for Claude:
- Return ONLY raw JSON — no markdown fences, no preamble
- 12-column grid: KPI w:3 h:2, charts w:6 h:4, table w:12 h:4, gauge w:3 h:3, text-note w:6 h:2
- Always include exactly 4 KPI cards at the top (y:0)
- 4–8 total widgets per dashboard
- All widget IDs must be unique short slugs (e.g. `kpi-revenue`, `chart-users`)
- Generate realistic mock data matching the described business context
- Covers all 11 widget types with their config shapes

### Scaffolded routes (return 501 in v1)

- `POST /api/ai/suggest-title`
- `POST /api/ai/insights`

### Authentication / environment

```
# .env.example
VERCEL_OIDC_TOKEN=        # auto-provisioned via `vercel env pull`
DATABASE_URL=             # auto-provisioned via Neon Marketplace install
NEXT_PUBLIC_APP_URL=      # e.g. https://zaiq.app (drives share URLs)
```

No provider API keys required — AI Gateway handles all provider auth via OIDC.

---

## Data Layer

### Prisma Schema — `/prisma/schema.prisma`

**Note on IDs:** Prisma does not natively support `nanoid` as a `@default`. Dashboard IDs are generated at the application layer: `const id = nanoid(10)` before calling `prisma.dashboard.create({ data: { id, ... } })`. The schema uses `@id` with no default for the Dashboard model.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

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
  id          String    @id                 // nanoid(10) set at application layer
  name        String    @default("Untitled Dashboard")
  description String?
  layout      Json
  widgets     Json
  isPublic    Boolean   @default(true)
  views       Int       @default(0)
  userId      String?
  user        User?     @relation(fields: [userId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum Plan {
  FREE
  PRO
  WHITE_LABEL
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
- `User` and `Plan` schema are dormant in v1 (no auth) — present for migration-free v2 upgrade
- `views` is incremented via a fire-and-forget `prisma.dashboard.update` inside `after()` (Next.js 16) in the share view Server Component — not blocking the render, not affected by ISR because it uses `after()` which runs post-response
- `Plan` enum uses `WHITE_LABEL` (underscore) for Postgres enum naming consistency

---

## Routes

### Page routes

```
/                    → Landing page (Server Component, static)
/builder             → New dashboard (client boundary at BuilderCanvas)
/builder/[id]        → Edit existing dashboard (loads from DB, hands to builder)
/dashboard/[id]      → Read-only share view (Server Component)
```

### API routes

```
POST   /api/dashboards           → create; body: { name, layout, widgets }; returns { id, shareUrl }
GET    /api/dashboards           → list all dashboards (v1: global, no auth scope — acknowledged below)
GET    /api/dashboards/[id]      → fetch one dashboard
PATCH  /api/dashboards/[id]      → update name/layout/widgets; no ownership check in v1 (acknowledged below)
DELETE /api/dashboards/[id]      → delete; no ownership check in v1 (acknowledged below)
POST   /api/ai/generate          → prompt → validated DashboardState JSON
POST   /api/ai/suggest-title     → 501 Not Implemented
POST   /api/ai/insights          → 501 Not Implemented
GET|POST /api/auth/[...nextauth] → 501 Not Implemented
```

**Accepted v1 security risks (no auth):**
- `GET /api/dashboards` returns all dashboards globally. Acceptable for v1 open source demo; document in README. This endpoint is not linked from any UI in v1 — it exists for API completeness.
- `PATCH` and `DELETE /api/dashboards/[id]` have no ownership check. Anyone with a dashboard ID can modify or delete it. Mitigated by the 10-character nanoid ID space (~1 quadrillion combinations); not a targeted attack concern for v1. Document in README security section.

### Next.js 16 async params

```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
```

### `proxy.ts` — security headers

Located at project root (same level as `app/`). Sets the following headers:

```ts
// Allow iframe embedding from any origin (required for embed use case)
// Do NOT set X-Frame-Options — it overrides CSP frame-ancestors in some browsers
response.headers.set('Content-Security-Policy', "frame-ancestors *")
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('X-XSS-Protection', '1; mode=block')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
// HSTS intentionally omitted — let Vercel handle it at the edge
```

**Iframe embed:** `frame-ancestors *` in CSP explicitly allows any site to embed a `/dashboard/[id]` URL in an iframe. This is intentional and required for the embed use case. Do not add `X-Frame-Options` header (it would conflict).

---

## Starter Templates

Each template is a complete `{ name, widgets, layout }` object defined in `lib/templates.ts`.

### Analytics Template

```
name: "SaaS Analytics Dashboard"

KPIs (y:0):
  kpi-revenue:    { title: "Total Revenue",      value: "$124,592", change: 12,  changeLabel: "vs last month", prefix: "$" }
  kpi-users:      { title: "Active Users",        value: "8,421",   change: 5,   changeLabel: "vs last month" }
  kpi-cvr:        { title: "Conversion Rate",     value: "3.2%",    change: -0.4, changeLabel: "vs last month", suffix: "%" }
  kpi-session:    { title: "Avg Session",         value: "4m 32s",  change: 8,   changeLabel: "vs last month" }

Charts (y:2):
  chart-revenue:  line-chart  { title: "Daily Revenue", dataKey: "value", color: "#6366f1",
                    data: 30 days of daily revenue values peaking mid-month }
  chart-channels: bar-chart   { title: "Traffic by Channel", dataKey: "value",
                    data: [Organic 4200, Paid 2800, Social 1900, Direct 1400, Email 900] }

Misc (y:6):
  feed-activity:  activity-feed { title: "Recent Activity",
                    events: 8 recent user signup / conversion events with relative timestamps }

Layout:
  kpi-*:         w:3 h:2  (4 KPIs fill row)
  chart-revenue: x:0 y:2  w:6 h:4
  chart-channels: x:6 y:2 w:6 h:4
  feed-activity:  x:0 y:6 w:6 h:4
```

### Inventory Template

```
name: "Inventory Dashboard"

KPIs (y:0):
  kpi-skus:     { title: "Total SKUs",        value: "1,284",    change: 3,   changeLabel: "this month" }
  kpi-lowstock: { title: "Low Stock Items",   value: "23",       change: -15, changeLabel: "vs last week", color: "#ef4444" }
  kpi-value:    { title: "Inventory Value",   value: "$892,441", change: 2,   changeLabel: "vs last month" }
  kpi-turnover: { title: "Turnover Rate",     value: "4.2x",     change: 0.3, changeLabel: "vs last quarter" }

Charts (y:2):
  chart-category: donut-chart  { title: "Inventory by Category",
                    data: [Electronics 38%, Apparel 24%, Home 19%, Sports 12%, Other 7%] }
  tracker-stock:  progress-tracker { title: "Top Product Stock Levels",
                    items: 6 products each with current stock vs max capacity }

Data (y:6):
  table-sku:    data-table { title: "SKU Overview",
                  columns: [SKU, Product Name, Stock, Reorder Point, Status],
                  rows: 8 realistic product rows }

Layout:
  kpi-*:          w:3 h:2
  chart-category: x:0 y:2 w:6 h:4
  tracker-stock:  x:6 y:2 w:6 h:4
  table-sku:      x:0 y:6 w:12 h:4
```

### Purchasing Template

```
name: "Purchasing Dashboard"

KPIs (y:0):
  kpi-openpos:   { title: "Open POs",             value: "34",       change: 6,  changeLabel: "vs last month" }
  kpi-pending:   { title: "Pending Approval",      value: "$128,400", change: 12, changeLabel: "vs last month" }
  kpi-leadtime:  { title: "Avg Lead Time",         value: "12 days",  change: -2, changeLabel: "vs last quarter" }
  kpi-ontime:    { title: "On-Time Delivery",      value: "94%",      change: 1,  changeLabel: "vs last quarter" }

Charts (y:2):
  chart-spend:   bar-chart  { title: "Monthly Spend by Vendor (Last 6 Months)",
                    data: 6 months × 5 vendors }
  gauge-budget:  gauge      { title: "Q2 Budget Utilization", value: 68, max: 100, unit: "%" }

Data (y:6):
  table-pos:     data-table { title: "Purchase Orders",
                    columns: [PO Number, Vendor, Amount, Status, Expected Date],
                    rows: 8 realistic PO rows }
  tracker-dept:  progress-tracker { title: "Budget by Department",
                    items: 5 departments with spend vs budget }

Layout:
  kpi-*:         w:3 h:2
  chart-spend:   x:0 y:2 w:8 h:4
  gauge-budget:  x:8 y:2 w:4 h:4
  table-pos:     x:0 y:6 w:12 h:4
  tracker-dept:  x:0 y:10 w:6 h:4
```

---

## Builder UI Layout

**Full viewport height, no page scroll. Four regions:**

### Top Toolbar (48px, white, border-bottom)
- Left: Mozaiq logo + wordmark
- Center: editable dashboard name (click → `<input>`, blur → save to zustand)
- Right: `Clear` | `Save` (spinner while saving, success toast "Dashboard saved") | `Share` (copies `${NEXT_PUBLIC_APP_URL}/dashboard/${id}` to clipboard, toast "Link copied") | `Preview` (opens share URL in new tab)

**Toast messages (sonner):**
- Save success: "Dashboard saved"
- Save error: "Failed to save — please try again"
- Share (no ID yet): "Save your dashboard first to get a share link"
- Share success: "Link copied to clipboard"
- AI generate success: "Dashboard generated"
- AI generate error: "Generation failed — please try again"
- Clear: no toast (destructive action, just clears state)

### Left Sidebar (260px, `#0f1117`, white text)
- Tab 1 — Components: widget tiles rendered from `widgetRegistry`, grouped by `category`
  - Each tile: icon + label, click or drag to add
- Tab 2 — Templates: 3 `TemplateCard` components, click to load

### Main Canvas (flex-1, `#f4f5f7`)
- `AIGeneratorBar` pinned above the grid (full-width)
- react-grid-layout: 12 columns, rowHeight: 80, margin: [12, 12]
- Empty state (no widgets): centered icon + text "Drag a component or describe your dashboard above"
- Selected widget: 2px solid indigo ring
- Widget hover: drag handle icon at top-center, delete × at top-right corner
- All widgets resizable via react-grid-layout resize handle at bottom-right

### Right Panel (280px, white, border-left, collapsible)
- Visible only when a widget is selected
- Collapse button on left edge
- Section: **General** — title input, description textarea
- Section: **Appearance** — color picker (`<input type="color">`) only for widget types that have a `color` field (kpi, line-chart, area-chart, bar-chart, donut-chart, gauge)
- Section: **Data** — read-only mock data preview (editable in v2)

---

## Landing Page Structure

1. **Navbar** — Logo + wordmark, Docs link, GitHub link, "Start Building Free" CTA → `/builder`
2. **Hero** — Dark gradient bg, "Build beautiful dashboards in minutes" headline, subheadline, dual CTAs ("Start Building Free" + "View on GitHub"), builder screenshot placeholder
3. **Features** — 6 cards: Drag & Drop Builder, AI Generator, Share Anywhere, Starter Templates, Open Source (AGPL-3.0), Data Ready (tagged "v2")
4. **Templates Preview** — 3 cards: Analytics, Inventory, Purchasing — click → `/builder` (template loading from URL param is v2; for v1 cards just link to builder)
5. **Pricing** — 3 tiers (Free / Pro $15/mo / White-label $199/mo). Pro and White-label CTAs show "Coming soon". Note: "Open source — self-host for free forever"
6. **Footer** — GitHub, Self-host (links to README), Roadmap links; AGPL-3.0 copyright

---

## File Structure

```
/app
  layout.tsx
  page.tsx                          ← landing page (Server Component)
  proxy.ts                          ← security headers (Next.js 16, at root level)
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
    ErrorBoundary.tsx
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
    (shadcn/ui primitives: Button, Input, Tabs, Badge, Textarea, etc.)

/lib
  widget-registry.ts
  templates.ts
  mockData.ts
  utils.ts                          ← cn(), shareUrl() helper
  ai.ts                             ← SYSTEM_PROMPT + validateDashboardShape()

/store
  dashboard.ts

/types
  dashboard.ts

/prisma
  schema.prisma

README.md
ROADMAP.md
LICENSE                             ← AGPL-3.0 full text
.env.example
.gitignore                          ← includes .env*.local, .superpowers/
```

---

## Implementation Order

1. **Scaffold** — all files with correct imports, type signatures, and placeholder exports
2. **Types + Registry** — `/types/dashboard.ts`, `/lib/widget-registry.ts`
3. **All 11 widgets** — components with built-in mock data, no builder integration yet
4. **Builder shell** — Toolbar + LeftSidebar + RightPanel + BuilderCanvas wired to zustand; add/select/delete/resize working
5. **3 Templates** — `lib/templates.ts` with full widget + layout data; loadTemplate wired in store + LeftSidebar
6. **AI Generator** — `AIGeneratorBar` + `/api/ai/generate` + `validateDashboardShape` + `generateDashboard` store action
7. **Data layer** — Prisma schema, Neon connection, `saveDashboard` + all CRUD API routes
8. **Share view** — `/dashboard/[id]` read-only, views increment via `after()`, "Built with Mozaiq" badge
9. **Landing page** — full sections as specified
10. **Polish** — error boundaries, empty states, loading states, all toast messages, `proxy.ts` headers
11. **Docs** — README (with Deploy to Vercel button), ROADMAP.md, LICENSE, `.env.example`

---

## Error Handling

- `react-grid-layout`: dynamic import with `ssr: false` — critical
- Every widget: `ErrorBoundary` with friendly fallback card
- All API routes: typed error responses, correct HTTP status codes
- Empty canvas: helpful empty state with instructions
- Save: disabled while saving, success/error toast
- Share before save: "Save your dashboard first to get a share link" toast
- Share clipboard: graceful fallback for browsers without `navigator.clipboard`
- `/dashboard/[id]`: 404 page if dashboard not found
- AI generation: error toast on failure, canvas unchanged
- `validateDashboardShape` failure: 500 with `{ error: 'Invalid AI response' }`, never loads broken state

---

## Version Roadmap Summary

| Version | Focus |
|---|---|
| **V1 (current)** | Open source MVP — builder, 11 widgets, 3 templates, AI generator, save/share |
| V2 | Auth (NextAuth.js), user accounts, Google Sheets + CSV connectors, AI insights |
| V3 | Stripe billing, Free/Pro/White-label tiers |
| V4 | Teams, RBAC, REST API connector, JS embed snippet |
| V5 | Custom domains, full white-label, direct DB connectors |
