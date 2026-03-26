# Spec: Widget Inline Data Editor (v2.5)

**Date:** 2026-03-26
**Status:** Approved

## Problem

When no data source is connected, all widgets display mock data hardcoded in `lib/mockData.ts` or `defaultConfig` zero-values. There is no way for users to customize the actual data values in a widget without connecting a CSV or Google Sheets source. This means every standalone dashboard shows bogus placeholder data.

## Goal

Make the **Data tab** in the right panel a fully functional manual data editor for every widget type. Users can set real values, add/remove rows, and apply changes — with or without a data source connected.

---

## Architecture

### Files changed

| File | Change |
|------|--------|
| `components/builder/RightPanel.tsx` | Data tab renders `<WidgetDataPanel>` instead of `<WidgetMappingPanel>` |
| `lib/widget-registry.ts` | Add sensible starter `data` arrays to `defaultConfig` for all array-based widgets |
| Widget components (12 files) | Remove `lib/mockData.ts` fallbacks — use `config.data` directly |

### New files — `components/builder/data-editors/`

| File | Purpose |
|------|---------|
| `WidgetDataPanel.tsx` | Top-level coordinator: selects editor, holds draft state, renders Apply button and optional data source section |
| `ScalarDataFields.tsx` | Simple labeled inputs for non-array display values (KPI, Gauge) |
| `ArrayRowEditor.tsx` | Generic CRUD grid — add row, delete row, edit any cell. Column schema passed as props. Handles 12 widget types. |
| `MultiSeriesRowEditor.tsx` | CRUD grid with dynamic columns — name + one column per series. Headers come from `seriesLabels` in Properties. |
| `TableDataEditor.tsx` | Two-section editor: (1) columns CRUD (key, label, sortable), (2) rows CRUD grid |

---

## Widget-to-Editor Mapping

| Widget type(s) | Editor | Editable fields |
|----------------|--------|-----------------|
| `kpi` | ScalarDataFields | `value` (text), `change` (number %) |
| `gauge` | ScalarDataFields | `value` (number) |
| `line-chart`, `area-chart`, `bar-chart`, `donut-chart`, `funnel-chart`, `ranked-list`, `treemap` | ArrayRowEditor | `name` (text) + `value` (number) |
| `waterfall-chart` | ArrayRowEditor | `name` + `value` + `type` (select: positive/negative/total) |
| `scatter-chart` | ArrayRowEditor | `x` (number) + `y` (number) |
| `progress-tracker` | ArrayRowEditor | `label` + `value` + `max` + `color` (color picker) |
| `activity-feed` | ArrayRowEditor | `label` (text) + `time` (text) |
| `multi-line-chart`, `grouped-bar-chart`, `stacked-bar-chart`, `combo-chart` | MultiSeriesRowEditor | `name` + one column per series (headers from `seriesLabels` in Properties) |
| `data-table` | TableDataEditor | Columns: `key`, `label`, `sortable`; Rows: dynamic per defined columns |
| `text-note` | (none) | Content already editable in Properties tab |

---

## WidgetDataPanel — Component Design

```
WidgetDataPanel
├── (if widget.dataSourceId)
│   └── Info banner: "Connected to [source name] — source data active. Manual data used as fallback."
│
├── Section header: "Manual Data"
│
├── [ScalarDataFields | ArrayRowEditor | MultiSeriesRowEditor | TableDataEditor]
│   (selected by widget.type)
│
├── Apply button
│   ├── Disabled state: "Apply" (grayed) when draft === current config
│   └── Active state: "● Apply changes" (green) when draft differs
│
└── (if widget.dataSourceId)
    └── Collapsible: "Source Mapping (filename)" → renders existing WidgetMappingPanel
```

---

## Data Flow

### Draft state
`WidgetDataPanel` maintains local draft state initialized from the current widget config. Edits update only the draft; the widget canvas continues showing last-applied values.

```ts
const [draft, setDraft] = useState(initDraft(widget))
const isDirty = !deepEqual(draft, currentConfigData(widget))

// Apply
const handleApply = () => updateWidgetConfig(widget.id, draft)

// Reset on widget change
useEffect(() => setDraft(initDraft(widget)), [widget.id])
```

### Save behavior
- Explicit Apply button — no auto-save
- Switching to another widget discards unsaved draft (no confirmation dialog needed — the data isn't lost, it reverts to the last applied state)
- Apply writes via the existing `updateWidgetConfig` store action

### Data source coexistence
- Manual data (`config.data`, `config.value`, etc.) is always stored in `widget.config`
- When a data source mapping is active, source data takes precedence in the widget renderer
- Manual data acts as fallback if the source is removed or fails
- Source mapping UI collapses into a section below the manual editor (not hidden)

---

## Starter Data in defaultConfig

All array-based widgets get sensible starter rows in `widget-registry.ts` `defaultConfig` so new widgets are never blank. Example:

```ts
'line-chart': {
  defaultConfig: {
    title: 'Line Chart',
    dataKey: 'value',
    data: [
      { name: 'Jan', value: 400 },
      { name: 'Feb', value: 600 },
      { name: 'Mar', value: 500 },
      { name: 'Apr', value: 780 },
    ],
  },
}
```

Widget components remove their `lib/mockData.ts` fallback logic — they render `config.data` directly (which is now always populated via starter data or user edits).

---

## ArrayRowEditor — Column Schema

The column schema is passed as props, making `ArrayRowEditor` fully generic:

```ts
interface ColumnDef {
  key: string
  label: string
  type: 'text' | 'number' | 'color' | 'select'
  options?: { value: string; label: string }[]  // for type: 'select'
  width?: number  // optional fixed width in px
}
```

Each widget type has a static column definition. Examples:

```ts
// Simple charts
const CHART_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
]

// Waterfall
const WATERFALL_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
  { key: 'type', label: 'Type', type: 'select', width: 90,
    options: [
      { value: 'positive', label: 'Gain' },
      { value: 'negative', label: 'Loss' },
      { value: 'total', label: 'Total' },
    ]},
]

// Progress tracker
const PROGRESS_COLUMNS: ColumnDef[] = [
  { key: 'label', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number', width: 60 },
  { key: 'max', label: 'Max', type: 'number', width: 60 },
  { key: 'color', label: 'Color', type: 'color', width: 48 },
]
```

---

## UI Polish — Builder System Font

The builder panel UI (`RightPanel`, `WidgetConfigPanel`, `WidgetDataPanel`, and all sub-editors) will use the OS system font stack instead of the current generic fallback:

```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

Applied via a Tailwind class on the `<aside>` root in `RightPanel.tsx` (or globally on the builder layout). This gives the panel the clean, native feel visible in the mockups.

---

## Out of Scope

- Drag-to-reorder rows in the CRUD grid (future enhancement)
- Undo/redo for data edits
- Import from clipboard / paste CSV
- Per-row color pickers for non-progress-tracker widgets (donut fills etc. remain via data source)
