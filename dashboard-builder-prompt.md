# Dashboard Builder — Claude Code Master Prompt

> Paste everything below this line into Claude Code to scaffold the full project.

---

## Project Overview

Build a production-ready, open source drag-and-drop dashboard builder. This is an open core product — the builder is free and open source, with a paid hosted SaaS layer added in later versions.

Target use cases:
- Analytics dashboards (revenue, users, conversion)
- Inventory dashboards (stock levels, SKUs, turnover)
- Purchasing dashboards (POs, vendor spend, lead times)

The long-term model is open core + hosted freemium:
- Core builder open sourced on GitHub under AGPL-3.0
- Hosted version with save/share/auth is paid
- White-label and team features are premium tiers

---

## Branding & Naming

- **Product name:** Mozaiq
- **Domain / URL:** zaiq.app
- **GitHub org:** github.com/zaiq
- **Repo name:** mozaiq
- All UI, logos, headings, and copy should reference "Mozaiq" as the product name
- All URLs and share links use zaiq.app as the base domain (e.g. `https://zaiq.app/dashboard/[id]`)
- The "Built with Mozaiq" badge on share views should link to `https://zaiq.app`
- Favicon, meta title, and og:title should all use "Mozaiq"
- The tagline to use throughout: **"Build beautiful dashboards in minutes"**

---

- Use AGPL-3.0 license. Include a full LICENSE file.
- Add license header comments to key source files.
- Create a thorough README.md that includes:
  - Project name, description, and feature list
  - Screenshots/demo GIF placeholder
  - One-click "Deploy to Vercel" button
  - Local development setup instructions
  - Self-hosting section
  - Link to ROADMAP.md
- Create a ROADMAP.md (see Version Roadmap section below)

---

## Tech Stack

- **Next.js 14** (App Router) with **TypeScript** — strict mode enabled
- **Tailwind CSS** for all styling
- **react-grid-layout** for drag, drop, resize canvas
  - CRITICAL: Must use `dynamic(() => import('react-grid-layout'), { ssr: false })` — SSR will break without this
- **recharts** for all chart widgets
- **zustand** for client-side builder state
- **Prisma ORM** with **PostgreSQL** (Supabase)
- **NextAuth.js** for auth (GitHub + Google providers) — scaffold but leave optional for v1
- **nanoid** for generating dashboard share IDs
- **lucide-react** for icons
- **sonner** for toast notifications
- **Anthropic SDK** (`@anthropic-ai/sdk`) for AI dashboard generation

---

## Route Structure

```
/                        → Landing page: hero, features, pricing, templates preview
/builder                 → New dashboard builder (client component)
/builder/[id]            → Edit an existing saved dashboard
/dashboard/[id]          → Public read-only shareable view
/my-dashboards           → User's saved dashboards list (auth required)
/api/dashboards          → POST (create), GET (list all)
/api/dashboards/[id]     → GET (fetch one), PATCH (update), DELETE
/api/auth/[...nextauth]  → NextAuth handler
/api/ai/generate         → POST: natural language → DashboardState JSON
/api/ai/insights         → POST: widget data → insight string (v2)
```

---

## Prisma Schema

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

---

## TypeScript Types (create in /types/dashboard.ts)

```ts
import { Layout } from 'react-grid-layout'

export type WidgetType =
  | 'kpi'
  | 'line-chart'
  | 'bar-chart'
  | 'donut-chart'
  | 'data-table'
  | 'progress-tracker'
  | 'activity-feed'

export type TemplateKey = 'analytics' | 'inventory' | 'purchasing'

export interface BaseWidgetConfig {
  title: string
  description?: string
}

export interface KPIConfig extends BaseWidgetConfig {
  value: string | number
  change: number
  changeLabel: string
  prefix?: string
  suffix?: string
  color?: string
}

export interface ChartConfig extends BaseWidgetConfig {
  dataKey: string
  color?: string
  data?: Record<string, unknown>[]
}

export interface TableConfig extends BaseWidgetConfig {
  columns: { key: string; label: string }[]
  rows: Record<string, unknown>[]
}

export interface ProgressConfig extends BaseWidgetConfig {
  items: { label: string; value: number; max: number; color?: string }[]
}

export interface ActivityConfig extends BaseWidgetConfig {
  events: { id: string; label: string; time: string; icon?: string }[]
}

export type WidgetConfig =
  | KPIConfig
  | ChartConfig
  | TableConfig
  | ProgressConfig
  | ActivityConfig

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
}

export interface DashboardState {
  id?: string
  name: string
  description?: string
  widgets: Widget[]
  layout: Layout[]
  isDirty: boolean
  isSaving: boolean
  isGenerating: boolean       // true while AI generation is in flight
  selectedWidgetId: string | null
}
```

---

## Zustand Store (create in /store/dashboard.ts)

```ts
interface DashboardStore extends DashboardState {
  addWidget: (type: WidgetType) => void
  removeWidget: (id: string) => void
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void
  setLayout: (layout: Layout[]) => void
  selectWidget: (id: string | null) => void
  setDashboardName: (name: string) => void
  loadTemplate: (template: TemplateKey) => void
  loadDashboard: (dashboard: { name: string; widgets: Widget[]; layout: Layout[] }) => void
  clearCanvas: () => void
  saveDashboard: () => Promise<string>  // returns dashboard ID
  generateDashboard: (prompt: string) => Promise<void>  // AI generation
}
```

---

## Widget Components (create in /components/widgets/)

Build all 7 as self-contained components. Each must handle a loading state and a no-data/empty state gracefully. All use mock data by default.

Each widget receives these props:
```ts
{
  config: WidgetConfig
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  isReadOnly?: boolean
}
```

### KPICard
- Large metric number with prefix/suffix support
- Label below the number
- % change badge (green if positive, red if negative)
- Trend arrow icon (up/down)

### LineChartWidget
- Responsive time-series using recharts LineChart
- Configurable line color
- Clean axes, tooltip on hover
- Mock data: 30 days of daily values

### BarChartWidget
- Grouped bar chart using recharts BarChart
- Tooltip on hover, legend below
- Mock data: 6 categories

### DonutChartWidget
- Donut (not full pie) using recharts PieChart with innerRadius
- Center label showing total value
- Legend below with color indicators

### DataTableWidget
- Sortable columns (click header to sort asc/desc)
- Zebra-striped rows
- Pagination if more than 10 rows

### ProgressTracker
- List of labeled items each with a progress bar
- Shows current value / max value
- Percentage text on the right
- Each item can have its own color

### ActivityFeed
- Scrollable list of events
- Each event: colored dot, label, relative timestamp
- Max height with internal scroll

---

## AI Features (V1 — Build Now)

### Overview
Use the Anthropic API (`claude-sonnet-4-20250514`) for all AI features. The V1 AI feature
is the natural language dashboard generator — it works entirely with mock data so it ships
in V1 with zero dependency on real data sources being connected.

---

### Feature 1: Natural Language Dashboard Generator (V1 — Ship Now)

This is the highest-leverage AI feature. It eliminates the blank canvas problem and is
the single most compelling demo you can show on Product Hunt or a landing page.

**UI — AI Generator Bar**

Add a prominent bar directly above the canvas in the builder, below the toolbar:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ✨  Describe the dashboard you need...                    [Generate →]  │
└─────────────────────────────────────────────────────────────────────────┘
```

- Full-width input, placeholder: "e.g. An analytics dashboard for a SaaS startup tracking MRR, churn, and active users"
- "Generate →" button: shows a spinner + "Generating..." while in flight
- On success: replaces current canvas contents with AI-generated layout, shows success toast
- On error: shows error toast, canvas unchanged
- While generating: disable the Generate button and dim the canvas with a subtle overlay

**API Route — POST /api/ai/generate**

```ts
// Request body
{ prompt: string }

// Response
{ dashboard: { name: string; widgets: Widget[]; layout: Layout[] } }
```

**System prompt to send to Claude:**

```
You are a dashboard builder assistant. When given a description of a dashboard,
you return a valid JSON object representing that dashboard.

You must return ONLY a raw JSON object — no markdown, no backticks, no explanation.

The JSON must match this exact shape:
{
  "name": string,
  "widgets": Widget[],
  "layout": Layout[]
}

Available widget types and their config shapes:
- "kpi": { title, value, change (number), changeLabel, prefix?, suffix?, color? }
- "line-chart": { title, dataKey, color?, data: [{name, value}] }
- "bar-chart": { title, dataKey, color?, data: [{name, value}] }
- "donut-chart": { title, dataKey, data: [{name, value}] }
- "data-table": { title, columns: [{key, label}], rows: [{}] }
- "progress-tracker": { title, items: [{label, value, max, color?}] }
- "activity-feed": { title, events: [{id, label, time}] }

Layout items use react-grid-layout format:
{ i: widgetId, x: 0-11, y: 0+, w: 1-12, h: 1-6 }

Rules:
- Use 12-column grid. KPI cards should be w:3, h:2. Charts w:6, h:4. Tables w:12, h:4.
- Generate realistic mock data that fits the user's described business context.
- Include 4 KPI cards at the top of every dashboard.
- Use 4-6 total widgets per dashboard.
- Widget IDs must be unique strings (use short slugs like "kpi-revenue", "chart-users").
- Return ONLY the JSON object. No preamble, no explanation, no markdown fences.
```

**Implementation in /api/ai/generate/route.ts:**

```ts
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: Request) {
  const { prompt } = await req.json()

  if (!prompt?.trim()) {
    return Response.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT, // the prompt above
    messages: [{ role: 'user', content: prompt }]
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''

  try {
    const dashboard = JSON.parse(text)
    return Response.json({ dashboard })
  } catch {
    return Response.json({ error: 'Failed to parse AI response' }, { status: 500 })
  }
}
```

**In the Zustand store — generateDashboard action:**

```ts
generateDashboard: async (prompt: string) => {
  set({ isGenerating: true })
  try {
    const res = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })
    const { dashboard, error } = await res.json()
    if (error) throw new Error(error)
    get().loadDashboard(dashboard)
  } finally {
    set({ isGenerating: false })
  }
}
```

---

### Feature 2: AI Widget Title & Description (V1 — Ship Now)

When a user drops a widget onto the canvas, auto-generate a relevant title based on the
widget type. Small touch, but it removes the friction of naming everything manually.

**Implementation:**
- Trigger on `addWidget()` in the Zustand store after the widget is created
- Fire a non-blocking POST to `/api/ai/suggest-title` with `{ widgetType, dashboardName }`
- API returns `{ title: string, description: string }`
- Silently update the widget config if the canvas still has that widget
- Do not block the UI — widget appears immediately with a placeholder title, AI title
  replaces it within 1-2 seconds

---

### Feature 3: Dashboard Insights on Share View (V2 — Scaffold Types Now)

On the `/dashboard/[id]` read-only view, show a one-line AI-generated insight below
each chart widget. Example: "Revenue peaked on the 14th — up 34% from the prior week."

This is a **Pro tier feature** — gate it behind plan check. Free tier sees a blurred
insight with a "Upgrade to Pro to unlock AI insights" tooltip.

Scaffold the types and UI placeholder now, wire the API call in V2 when real data
is connected:

```ts
// Add to Widget type (scaffold only)
interface Widget {
  ...
  aiInsight?: string  // populated on share view for Pro users
}
```

Add a subtle insight bar below chart widgets on the share view:
```
💡 Revenue is trending up 12% this month, but conversion dropped — worth investigating.
```

---

### Feature 4: Template Customization via AI (V2)

On the Templates tab in the left sidebar, add a "Customize with AI" button below each
template card. User types their business context and AI remaps the template's KPI labels,
column names, and mock data to fit without changing the layout structure.

Example prompt to Claude:
```
Take this dashboard template and adapt the labels, KPI names, column headers, and
mock data values to fit this business context: "[user input]"
Return the same JSON structure with updated config values only — do not change widget
types or layout positions.
```

---

### AI-Related Updates to Other Sections

**Landing page — add to Features section:**
- ✨ AI Dashboard Generator — describe what you need, get a full dashboard in seconds

**Landing page — update pricing table:**
| Free | Pro ($15/mo) | White-label ($199/mo) |
|---|---|---|
| 3 dashboards | Unlimited dashboards | Everything in Pro |
| Watermark on share link | No watermark | Remove all branding |
| Community support | Google Sheets + CSV | Custom domain |
| | **✨ AI dashboard generator** | Team access + permissions |
| | **AI chart insights** | Slack support |
| | Priority support | |

**Environment variables — add:**
```
ANTHROPIC_API_KEY=
```

**File structure — add:**
```
/app/api/ai/
  generate/route.ts        ← natural language → DashboardState
  suggest-title/route.ts   ← widget type → suggested title
  insights/route.ts        ← widget data → insight string (v2)
/components/builder/
  AIGeneratorBar.tsx        ← the prompt input bar above canvas
```

---

### AI Implementation Notes

- Never expose `ANTHROPIC_API_KEY` to the client. All Anthropic API calls go through
  Next.js API routes only.
- Always validate and sanitize the JSON response from Claude before loading it into
  Zustand — use a `validateDashboardShape()` util that checks required fields and
  strips unknown properties.
- Rate limit the `/api/ai/generate` route — max 10 requests per IP per hour in V1
  (use `@upstash/ratelimit` with Upstash Redis, or a simple in-memory map for V1).
- The `suggest-title` call should have a 3-second timeout and fail silently — never
  block the widget drop interaction.
- Log all AI generation prompts + outcomes to a `GenerationLog` table in Prisma for V2
  (helps tune the system prompt and catch failures):

```prisma
model GenerationLog {
  id        String   @id @default(cuid())
  prompt    String
  success   Boolean
  widgetCount Int?
  createdAt DateTime @default(now())
}
```

---

Each template is a complete DashboardState snapshot with realistic mock data. Make them feel meaningfully different from each other.

### Analytics Dashboard
KPIs:
- Total Revenue: $124,592 (+12%, vs last month)
- Active Users: 8,421 (+5%)
- Conversion Rate: 3.2% (-0.4%)
- Avg Session: 4m 32s (+8%)

Widgets:
- Line chart: daily revenue last 30 days
- Bar chart: traffic by channel (Organic, Paid, Social, Direct, Email)
- Activity feed: recent user signups and conversion events

### Inventory Dashboard
KPIs:
- Total SKUs: 1,284
- Low Stock Items: 23 (show warning color)
- Inventory Value: $892,441
- Turnover Rate: 4.2x

Widgets:
- Donut chart: inventory breakdown by category
- Progress tracker: stock levels for 6 top products (% of max capacity)
- Data table: columns = SKU, Product Name, Stock, Reorder Point, Status

### Purchasing Dashboard
KPIs:
- Open POs: 34
- Pending Approval: $128,400
- Avg Lead Time: 12 days
- On-Time Delivery: 94%

Widgets:
- Bar chart: monthly spend by vendor (last 6 months, 5 vendors)
- Data table: columns = PO Number, Vendor, Amount, Status, Expected Date
- Progress tracker: budget utilization by department

---

## Builder UI Layout

Full viewport height, no page scroll. Three-panel layout:

### Left Sidebar (260px fixed)
- Background: #0f1117, text: white
- **Tab 1 — Components**: widget tiles in a grid, grouped by category:
  - Metrics: KPI Card
  - Charts: Line Chart, Bar Chart, Donut Chart
  - Data: Data Table, Progress Tracker, Activity Feed
  - Each tile: icon + label, draggable onto canvas
- **Tab 2 — Templates**: 3 clickable template cards with name, description, and a mini preview icon

### Top Toolbar (48px)
- Background: white, border-bottom
- Left: app logo + name
- Center: editable dashboard name (inline edit on click, blurs to save)
- Right: "Clear" button | "Save" button (spinner while saving, success toast on done) | "Share" button (copies `/dashboard/[id]` URL to clipboard, shows toast) | "Preview" link (opens `/dashboard/[id]` in new tab)

### Main Canvas (flex-1)
- Background: #f4f5f7
- react-grid-layout: 12 columns, rowHeight: 80, margin: [12, 12]
- Empty state: centered icon + "Drag a component to get started"
- Selected widget: 2px solid blue ring
- Widget hover state: shows drag handle at top, delete button (×) at top-right corner
- **All widgets are fully resizable** — react-grid-layout resize handle visible on hover at bottom-right corner of each widget. Users can freely resize any widget after placing it.
- **Default sizes per widget type** (these are starting sizes only, not locked):
  - KPI Card: w:3, h:2
  - Line Chart / Bar Chart / Donut Chart: w:6, h:4
  - Data Table: w:12, h:4
  - Progress Tracker: w:4, h:4
  - Activity Feed: w:4, h:4
- Widgets snap to the 12-column grid on resize and drag

### Right Panel (280px fixed)
- Background: white, border-left
- Visible when a widget is selected
- Collapsible — collapse button on left edge
- Sections:
  - General: title input, description textarea
  - Appearance: color picker for primary color
  - Data: read-only mock data preview (editable in v2 when connected to real sources)

---

## API Routes

### POST /api/dashboards
Create a new dashboard. Body: `{ name, layout, widgets }`. Returns `{ id, shareUrl }`.

### GET /api/dashboards
List all dashboards. In v1 returns all (no auth). In v2 scoped to user.

### GET /api/dashboards/[id]
Fetch a single dashboard by ID. Returns full dashboard object.

### PATCH /api/dashboards/[id]
Update name, layout, or widgets. Returns updated dashboard.

### DELETE /api/dashboards/[id]
Delete a dashboard. Returns 204.

All routes should return typed responses with proper HTTP status codes and error messages.

---

## Shareable View (/dashboard/[id])

- Renders all widgets using the same components as the builder
- react-grid-layout in fully static mode: `isDraggable: false, isResizable: false`
- Clean top bar:
  - Left: dashboard name
  - Center: empty
  - Right: "Built with Mozaiq" badge linking to landing page, "Open in Builder" button
- Full-width, no sidebar panels
- Handle 404 if dashboard ID not found

---

## Landing Page (/)

### Hero
- Strong headline (e.g. "Build beautiful dashboards in minutes")
- Subheadline explaining the use cases
- "Start Building Free" CTA button → links to /builder
- Demo screenshot or embedded GIF placeholder

### Features Section (6 cards)
- Drag & Drop Builder
- Starter Templates
- Share Anywhere (link + iframe)
- Embeddable (paste an iframe into any site)
- Open Source (AGPL-3.0, self-hostable)
- Data Ready (Google Sheets, CSV, API — coming in v2)

### Templates Preview
- Show the 3 template names with brief descriptions

### Pricing Section (scaffold UI — billing not wired until v3)
| Free | Pro ($15/mo) | White-label ($199/mo) |
|---|---|---|
| 3 dashboards | Unlimited dashboards | Everything in Pro |
| Watermark on share link | No watermark | Remove all branding |
| Community support | Google Sheets + CSV | Custom domain |
| | Priority support | Team access + permissions |
| | | Slack support |

Include a note: "Open source — self-host for free forever"

### Footer
- GitHub link, Twitter/X link
- "Self-host for free" text with link to README

---

## Environment Variables

Create a `.env.example`:
```
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXT_PUBLIC_APP_URL=
ANTHROPIC_API_KEY=
```

---

## File Structure to Scaffold

```
/app
  layout.tsx
  page.tsx                          ← landing page
  /builder
    page.tsx                        ← new dashboard
    /[id]
      page.tsx                      ← edit dashboard
  /dashboard
    /[id]
      page.tsx                      ← read-only share view
  /my-dashboards
    page.tsx
  /api
    /dashboards
      route.ts
      /[id]
        route.ts
    /auth
      /[...nextauth]
        route.ts
    /ai
      /generate
        route.ts                    ← natural language → DashboardState JSON
      /suggest-title
        route.ts                    ← widget type → suggested title
      /insights
        route.ts                    ← widget data → insight string (v2)

/components
  /builder
    BuilderCanvas.tsx
    LeftSidebar.tsx
    RightPanel.tsx
    Toolbar.tsx
    ComponentTile.tsx
    TemplateCard.tsx
    AIGeneratorBar.tsx              ← prompt input bar above canvas
  /widgets
    WidgetRenderer.tsx              ← maps type → component
    WidgetWrapper.tsx               ← handles select/delete/drag handle overlay
    KPICard.tsx
    LineChartWidget.tsx
    BarChartWidget.tsx
    DonutChartWidget.tsx
    DataTableWidget.tsx
    ProgressTracker.tsx
    ActivityFeed.tsx
  /ui
    (shared primitives: Button, Input, Tabs, Badge, etc.)

/lib
  templates.ts
  mockData.ts
  utils.ts
  ai.ts                             ← system prompts + validateDashboardShape() util

/store
  dashboard.ts

/types
  dashboard.ts

/prisma
  schema.prisma

README.md
ROADMAP.md
LICENSE
.env.example
```

---

## Error Handling & Edge Cases

- `react-grid-layout` MUST be dynamically imported with `ssr: false` — this is critical and will cause hydration errors without it
- Wrap every widget in an `ErrorBoundary` that shows a friendly fallback card
- All API routes must return proper HTTP status codes with typed error responses
- Empty canvas must show a clear, helpful empty state (not just a blank area)
- Save button: disabled while saving, shows success toast on completion, shows error toast on failure
- Share button: copies to clipboard with graceful fallback for older browsers
- `/dashboard/[id]`: return a clear 404 page if dashboard not found

---

## Version Roadmap (ROADMAP.md)

### V1 — Open Source MVP (current)
- Drag & drop canvas with react-grid-layout
- 7 widget types with realistic mock data
- 3 starter templates (Analytics, Inventory, Purchasing)
- Save dashboard to database
- Shareable read-only view via `/dashboard/[id]`
- Embeddable via iframe (works automatically from share URL)
- One-click Deploy to Vercel
- AGPL-3.0 open source license
- **✨ AI natural language dashboard generator** (describe → full dashboard in seconds)
- **✨ AI widget title suggestion** (auto-names widgets on drop)

### V2 — Auth + Real Data Sources + AI Upgrades
- NextAuth.js with GitHub and Google providers
- User accounts, dashboard ownership, `/my-dashboards` page
- **Google Sheets connector**: OAuth → paste Sheet URL → auto-map columns to widget data format, configurable auto-refresh (5min / 15min / 1hr)
- CSV upload with column mapper UI
- **✨ AI chart recommendations**: upload data → AI suggests the right chart type + axis mapping
- **✨ AI dashboard insights**: one-line AI insight below each chart on share view (Pro only)
- **✨ AI template customization**: describe your business context → AI remaps template labels and mock data
- Submit Google OAuth consent screen on Day 1 of this milestone — approval can take 1–3 days

### V3 — Billing & SaaS Tiers
- Stripe Checkout integration
- Stripe webhook handler for subscription lifecycle events
- Free tier: 3 dashboards, watermark on share link, no data sources
- Pro tier ($15/mo): unlimited dashboards, no watermark, Google Sheets + CSV, priority support
- White-label tier ($199/mo): remove all branding, custom domain, team access
- Gate Pro features in API routes by checking user plan

### V4 — Teams & More Connectors
- Team workspaces with shared dashboards
- Role-based permissions: viewer / editor / admin
- REST API connector: paste endpoint URL, map JSON response fields to widget data
- Embeddable JS snippet (`<script>` tag embed, not just iframe)

### V5 — White-label & Enterprise
- Custom domain support (CNAME + SSL)
- Full brand removal including favicon and meta
- Custom color theme per workspace
- Agency client management dashboard
- Direct database connectors: Postgres, MySQL (enterprise only)

---

## Implementation Order

Scaffold all files with correct imports and type signatures first. Then implement in this order:

1. Core builder interactions: add widget → configure in right panel → layout saves to Zustand
2. All 7 widgets with realistic mock data
3. 3 templates fully wired with correct layouts and data
4. **AI generator bar + `/api/ai/generate` route** — get this working early, it's your best demo
5. **AI widget title suggestion** — wire into `addWidget()` action, fires silently after drop
6. API routes + Prisma connected to Supabase
7. Save → share URL → read-only view works end-to-end
8. Landing page with pricing section (billing not wired yet)
9. Polish: empty states, error boundaries, loading states, toasts

Nothing should look like a placeholder. Use realistic mock data throughout.
The AI generator should be the first thing someone sees and tries when they open the builder.
