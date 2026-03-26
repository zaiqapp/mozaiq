# Widget Inline Data Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Data tab in the right panel a fully functional manual data editor for all 19 widget types, so users can build real dashboards without connecting a data source.

**Architecture:** New `WidgetDataPanel` coordinator replaces `WidgetMappingPanel` in the Data tab. It holds local draft state and renders one of three sub-editors (`ArrayRowEditor`, `ScalarDataFields`, `TableDataEditor`) based on widget type, with an explicit Apply button. Starter data is seeded in `widget-registry.ts` so new widgets are never blank, eliminating `lib/mockData.ts` fallbacks in widget components.

**Tech Stack:** React, TypeScript, Zustand (existing `useDashboardStore`), Tailwind CSS, `useBuilderTheme` for dark/light styling.

---

## File Map

**New files:**
- `components/builder/data-editors/ArrayRowEditor.tsx` — generic CRUD grid; column schema passed as props; handles 14 widget types
- `components/builder/data-editors/ScalarDataFields.tsx` — labeled inputs for KPI (value, change) and Gauge (value)
- `components/builder/data-editors/TableDataEditor.tsx` — two-section editor: columns CRUD + rows CRUD for data-table
- `components/builder/data-editors/WidgetDataPanel.tsx` — coordinator; draft state; Apply button; column schema map; wraps `WidgetMappingPanel` when data source is connected

**Modified files:**
- `components/builder/RightPanel.tsx` — Data tab renders `<WidgetDataPanel>` instead of `<WidgetMappingPanel>`; add `font-sans` to `<aside>`
- `lib/widget-registry.ts` — add starter `data`/`items`/`events`/`columns`/`rows` to `defaultConfig` for all array-based widgets
- `components/widgets/LineChartWidget.tsx` — remove MOCK constant and fallback
- `components/widgets/AreaChartWidget.tsx` — remove MOCK constant and fallback
- `components/widgets/BarChartWidget.tsx` — remove MOCK constant and fallback
- `components/widgets/DonutChartWidget.tsx` — remove CATEGORY_DATA import and fallback
- `components/widgets/FunnelChartWidget.tsx` — remove MOCK constant and fallback
- `components/widgets/RankedList.tsx` — remove MOCK constant and fallback
- `components/widgets/WaterfallChart.tsx` — remove MOCK constant and fallback
- `components/widgets/Treemap.tsx` — remove MOCK constant and fallback
- `components/widgets/ScatterChart.tsx` — remove MOCK constant and fallback
- `components/widgets/MultiLineChart.tsx` — remove MOCK constant and fallback
- `components/widgets/GroupedBarChart.tsx` — remove MOCK constant and fallback
- `components/widgets/StackedBarChart.tsx` — remove MOCK constant and fallback
- `components/widgets/ComboChart.tsx` — remove MOCK constant and fallback
- `components/widgets/DataTableWidget.tsx` — remove MOCK_COLUMNS/MOCK_ROWS and fallbacks
- `components/widgets/ProgressTracker.tsx` — remove MOCK_ITEMS and fallback
- `components/widgets/ActivityFeed.tsx` — remove ACTIVITY_EVENTS import and fallback

---

## Task 1: ArrayRowEditor — generic CRUD grid

**Files:**
- Create: `components/builder/data-editors/ArrayRowEditor.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export interface ColumnDef {
  key: string
  label: string
  type: 'text' | 'number' | 'color'
  width?: number  // fixed px width; omit for flex-1
}

interface Props {
  columns: ColumnDef[]
  rows: Record<string, unknown>[]
  onChange: (rows: Record<string, unknown>[]) => void
  newRowTemplate: Record<string, unknown>
}

export function ArrayRowEditor({ columns, rows, onChange, newRowTemplate }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const gridCols = `${columns.map(c => c.width ? `${c.width}px` : '1fr').join(' ')} 20px`

  const inputClass = `rounded border px-1.5 py-1 text-xs outline-none w-full ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`
  const deleteClass = `text-sm leading-none transition-colors ${
    isDark ? 'text-[#4b5563] hover:text-red-500' : 'text-gray-300 hover:text-red-500'
  }`
  const addClass = `mt-2 w-full rounded border py-1 text-xs transition-colors ${
    isDark
      ? 'border-dashed border-[rgba(255,255,255,0.1)] text-[#4b5563] hover:text-[#6b7280]'
      : 'border-dashed border-gray-200 text-gray-400 hover:text-gray-600'
  }`
  const headerClass = `text-[9px] uppercase tracking-wide ${isDark ? 'text-[#374151]' : 'text-gray-400'}`

  const handleCellChange = (rowIdx: number, key: string, value: unknown) => {
    onChange(rows.map((row, i) => i === rowIdx ? { ...row, [key]: value } : row))
  }

  return (
    <div>
      {/* Column headers */}
      <div className="mb-1 grid gap-1" style={{ gridTemplateColumns: gridCols }}>
        {columns.map(col => (
          <span key={col.key} className={`px-1 ${headerClass}`}>{col.label}</span>
        ))}
        <span />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid items-center gap-1" style={{ gridTemplateColumns: gridCols }}>
            {columns.map(col => (
              <div key={col.key}>
                {col.type === 'color' ? (
                  <input
                    type="color"
                    className={`h-7 w-full cursor-pointer rounded border ${
                      isDark ? 'border-[rgba(255,255,255,0.1)]' : 'border-gray-200'
                    }`}
                    value={typeof row[col.key] === 'string' ? (row[col.key] as string) : '#6366f1'}
                    onChange={e => handleCellChange(rowIdx, col.key, e.target.value)}
                  />
                ) : (
                  <input
                    type={col.type === 'number' ? 'number' : 'text'}
                    className={inputClass}
                    value={row[col.key] === undefined ? '' : String(row[col.key])}
                    onChange={e =>
                      handleCellChange(
                        rowIdx,
                        col.key,
                        col.type === 'number'
                          ? (e.target.value === '' ? 0 : Number(e.target.value))
                          : e.target.value,
                      )
                    }
                  />
                )}
              </div>
            ))}
            <button
              onClick={() => onChange(rows.filter((_, i) => i !== rowIdx))}
              className={deleteClass}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => onChange([...rows, { ...newRowTemplate }])}
        className={addClass}
      >
        + Add row
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Verify the file compiles — start dev server and check for TypeScript errors**

```bash
npm run dev
```

Expected: server starts, no TS errors in terminal for this file. You don't need to test it in the browser yet — it has no entry point until Task 4.

- [ ] **Step 3: Commit**

```bash
git add components/builder/data-editors/ArrayRowEditor.tsx
git commit -m "feat: add ArrayRowEditor generic CRUD grid for widget data editing"
```

---

## Task 2: ScalarDataFields — labeled inputs for KPI and Gauge

**Files:**
- Create: `components/builder/data-editors/ScalarDataFields.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export interface ScalarFieldDef {
  key: string
  label: string
  type: 'text' | 'number'
  hint?: string
}

interface Props {
  fields: ScalarFieldDef[]
  values: Record<string, unknown>
  onChange: (key: string, value: unknown) => void
}

export function ScalarDataFields({ fields, values, onChange }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const inputClass = `w-full rounded border px-2 py-1.5 text-sm outline-none ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`
  const labelClass = `mb-1 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`
  const hintClass = `mt-1 text-[10px] ${isDark ? 'text-[#374151]' : 'text-gray-400'}`

  return (
    <div className="flex flex-col gap-4">
      {fields.map(field => (
        <div key={field.key}>
          <label className={labelClass}>{field.label}</label>
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            className={inputClass}
            value={values[field.key] === undefined ? '' : String(values[field.key])}
            onChange={e =>
              onChange(
                field.key,
                field.type === 'number'
                  ? (e.target.value === '' ? 0 : Number(e.target.value))
                  : e.target.value,
              )
            }
          />
          {field.hint && <p className={hintClass}>{field.hint}</p>}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/builder/data-editors/ScalarDataFields.tsx
git commit -m "feat: add ScalarDataFields for KPI value/change and Gauge value editing"
```

---

## Task 3: TableDataEditor — columns + rows CRUD for data-table

**Files:**
- Create: `components/builder/data-editors/TableDataEditor.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
import type { TableConfig } from '@/types/dashboard'

interface Props {
  columns: TableConfig['columns']
  rows: Record<string, unknown>[]
  onChange: (columns: TableConfig['columns'], rows: Record<string, unknown>[]) => void
}

export function TableDataEditor({ columns, rows, onChange }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const inputClass = `rounded border px-1.5 py-1 text-xs outline-none w-full ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`
  const addClass = `mt-2 w-full rounded border py-1 text-xs transition-colors ${
    isDark
      ? 'border-dashed border-[rgba(255,255,255,0.1)] text-[#4b5563] hover:text-[#6b7280]'
      : 'border-dashed border-gray-200 text-gray-400 hover:text-gray-600'
  }`
  const deleteClass = `text-sm leading-none transition-colors ${
    isDark ? 'text-[#4b5563] hover:text-red-500' : 'text-gray-300 hover:text-red-500'
  }`
  const sectionLabel = `mb-2 text-[9px] uppercase tracking-wide font-medium ${
    isDark ? 'text-[#4b5563]' : 'text-gray-500'
  }`
  const colHeader = `px-1 text-[9px] uppercase tracking-wide truncate ${
    isDark ? 'text-[#374151]' : 'text-gray-400'
  }`

  const updateCol = (idx: number, patch: Partial<TableConfig['columns'][number]>) =>
    onChange(columns.map((c, i) => i === idx ? { ...c, ...patch } : c), rows)

  const deleteCol = (idx: number) => {
    const removedKey = columns[idx].key
    const newCols = columns.filter((_, i) => i !== idx)
    const newRows = rows.map(r => {
      const { [removedKey]: _removed, ...rest } = r
      return rest
    })
    onChange(newCols, newRows)
  }

  const addCol = () =>
    onChange([...columns, { key: `col${columns.length + 1}`, label: `Column ${columns.length + 1}` }], rows)

  const updateCell = (rowIdx: number, key: string, value: string) =>
    onChange(columns, rows.map((r, i) => i === rowIdx ? { ...r, [key]: value } : r))

  const deleteRow = (idx: number) => onChange(columns, rows.filter((_, i) => i !== idx))

  const addRow = () => {
    const newRow: Record<string, unknown> = {}
    columns.forEach(c => { newRow[c.key] = '' })
    onChange(columns, [...rows, newRow])
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Columns section */}
      <div>
        <p className={sectionLabel}>Columns</p>
        <div className="mb-1 grid grid-cols-[1fr_1fr_32px_20px] gap-1">
          <span className={colHeader}>Key</span>
          <span className={colHeader}>Label</span>
          <span className={`text-center ${colHeader}`}>Sort</span>
          <span />
        </div>
        <div className="flex flex-col gap-1">
          {columns.map((col, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_32px_20px] items-center gap-1">
              <input
                className={inputClass}
                value={col.key}
                onChange={e => updateCol(i, { key: e.target.value })}
              />
              <input
                className={inputClass}
                value={col.label}
                onChange={e => updateCol(i, { label: e.target.value })}
              />
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={!!col.sortable}
                  onChange={e => updateCol(i, { sortable: e.target.checked })}
                  className="cursor-pointer"
                  style={{ accentColor: '#6366f1' }}
                />
              </div>
              <button onClick={() => deleteCol(i)} className={deleteClass}>×</button>
            </div>
          ))}
        </div>
        <button onClick={addCol} className={addClass}>+ Add column</button>
      </div>

      {/* Rows section */}
      <div>
        <p className={sectionLabel}>Rows</p>
        {columns.length === 0 ? (
          <p className={`text-xs ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>Add columns first.</p>
        ) : (
          <>
            <div
              className="mb-1 grid gap-1 pr-6"
              style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr)` }}
            >
              {columns.map(col => (
                <span key={col.key} className={colHeader}>{col.key}</span>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {rows.map((row, rowIdx) => (
                <div
                  key={rowIdx}
                  className="grid items-center gap-1"
                  style={{ gridTemplateColumns: `repeat(${columns.length}, 1fr) 20px` }}
                >
                  {columns.map(col => (
                    <input
                      key={col.key}
                      className={inputClass}
                      value={row[col.key] === undefined ? '' : String(row[col.key])}
                      onChange={e => updateCell(rowIdx, col.key, e.target.value)}
                    />
                  ))}
                  <button onClick={() => deleteRow(rowIdx)} className={deleteClass}>×</button>
                </div>
              ))}
            </div>
            <button onClick={addRow} className={addClass}>+ Add row</button>
          </>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/builder/data-editors/TableDataEditor.tsx
git commit -m "feat: add TableDataEditor with columns and rows CRUD for data-table widget"
```

---

## Task 4: WidgetDataPanel — coordinator with draft state and Apply button

**Files:**
- Create: `components/builder/data-editors/WidgetDataPanel.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import type { Widget, WidgetConfig, TableConfig } from '@/types/dashboard'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
import { ArrayRowEditor, type ColumnDef } from './ArrayRowEditor'
import { ScalarDataFields } from './ScalarDataFields'
import { TableDataEditor } from './TableDataEditor'
import { WidgetMappingPanel } from '../WidgetMappingPanel'

// ─── Column schema constants ──────────────────────────────────────────────────

const NAME_VALUE: ColumnDef[] = [
  { key: 'name', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
]

const NAME_VALUE_FILL: ColumnDef[] = [
  { key: 'name', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
  { key: 'fill', label: 'Color', type: 'color', width: 48 },
]

const LABEL_VALUE: ColumnDef[] = [
  { key: 'label', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
]

const XY: ColumnDef[] = [
  { key: 'x', label: 'X', type: 'number' },
  { key: 'y', label: 'Y', type: 'number' },
]

const PROGRESS_COLS: ColumnDef[] = [
  { key: 'label', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number', width: 56 },
  { key: 'max', label: 'Max', type: 'number', width: 56 },
  { key: 'color', label: 'Color', type: 'color', width: 40 },
]

const ACTIVITY_COLS: ColumnDef[] = [
  { key: 'label', label: 'Event', type: 'text' },
  { key: 'time', label: 'Time', type: 'text', width: 80 },
]

// ─── Multi-series schema (derived from widget config) ────────────────────────

function getMultiSeriesColumns(widget: Widget): ColumnDef[] {
  const c = widget.config as Record<string, unknown>
  if (widget.type === 'combo-chart') {
    return [
      { key: 'name', label: 'Label', type: 'text' },
      { key: 'bar', label: (c.barLabel as string) ?? 'Volume', type: 'number' },
      { key: 'line', label: (c.lineLabel as string) ?? 'Rate', type: 'number' },
    ]
  }
  // multi-line-chart, grouped-bar-chart, stacked-bar-chart
  const labels = (c.seriesLabels as Record<string, string>) ?? {}
  return [
    { key: 'name', label: 'Label', type: 'text' },
    { key: 'series1', label: labels.series1 ?? 'Series 1', type: 'number' },
    { key: 'series2', label: labels.series2 ?? 'Series 2', type: 'number' },
  ]
}

function getMultiSeriesNewRow(widget: Widget): Record<string, unknown> {
  return widget.type === 'combo-chart'
    ? { name: '', bar: 0, line: 0 }
    : { name: '', series1: 0, series2: 0 }
}

// ─── Draft state ─────────────────────────────────────────────────────────────

type DataDraft = {
  value?: string | number
  change?: number
  data?: Record<string, unknown>[]
  items?: { label: string; value: number; max: number; color?: string }[]
  events?: { id: string; label: string; time: string }[]
  columns?: TableConfig['columns']
  rows?: Record<string, unknown>[]
}

function initDraft(widget: Widget): DataDraft {
  const c = widget.config as Record<string, unknown>
  switch (widget.type) {
    case 'kpi':    return { value: c.value, change: c.change as number }
    case 'gauge':  return { value: c.value as number }
    case 'data-table': return {
      columns: (c.columns as TableConfig['columns']) ?? [],
      rows: (c.rows as Record<string, unknown>[]) ?? [],
    }
    case 'progress-tracker': return {
      items: (c.items as DataDraft['items']) ?? [],
    }
    case 'activity-feed': return {
      events: (c.events as DataDraft['events']) ?? [],
    }
    default: return {
      data: (c.data as Record<string, unknown>[]) ?? [],
    }
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props { widget: Widget }

export function WidgetDataPanel({ widget }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const updateWidgetConfig = useDashboardStore(s => s.updateWidgetConfig)
  const dataSources = useDashboardStore(s => s.dataSources)

  const [draft, setDraft] = useState<DataDraft>(() => initDraft(widget))
  const [savedDraft, setSavedDraft] = useState<DataDraft>(() => initDraft(widget))
  const [sourceExpanded, setSourceExpanded] = useState(false)

  useEffect(() => {
    const d = initDraft(widget)
    setDraft(d)
    setSavedDraft(d)
  }, [widget.id])

  const isDirty = JSON.stringify(draft) !== JSON.stringify(savedDraft)

  const handleApply = useCallback(() => {
    updateWidgetConfig(widget.id, draft as Partial<WidgetConfig>)
    setSavedDraft(draft)
  }, [widget.id, draft, updateWidgetConfig])

  const sourceInfo = widget.dataSourceId
    ? dataSources.find(ds => ds.id === widget.dataSourceId)
    : null

  const sectionLabel = `mb-2 text-[9px] uppercase tracking-wide font-medium ${
    isDark ? 'text-[#4b5563]' : 'text-gray-500'
  }`
  const applyClass = `w-full rounded py-1.5 text-xs font-medium transition-colors ${
    isDirty
      ? isDark
        ? 'border border-[rgba(16,185,129,0.3)] bg-[rgba(6,78,59,0.4)] text-emerald-400 hover:bg-[rgba(6,78,59,0.6)]'
        : 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      : isDark
        ? 'cursor-not-allowed border border-[rgba(255,255,255,0.06)] text-[#374151]'
        : 'cursor-not-allowed border border-gray-200 text-gray-300'
  }`

  function renderEditor() {
    switch (widget.type) {
      case 'kpi':
        return (
          <ScalarDataFields
            fields={[
              { key: 'value', label: 'Value', type: 'text', hint: 'Shown as-is — add prefix/suffix in Properties' },
              { key: 'change', label: 'Change %', type: 'number', hint: 'Positive = green arrow, negative = red' },
            ]}
            values={draft}
            onChange={(key, value) => setDraft(prev => ({ ...prev, [key]: value }))}
          />
        )

      case 'gauge':
        return (
          <ScalarDataFields
            fields={[{ key: 'value', label: 'Value', type: 'number' }]}
            values={draft}
            onChange={(key, value) => setDraft(prev => ({ ...prev, [key]: value }))}
          />
        )

      case 'data-table':
        return (
          <TableDataEditor
            columns={(draft.columns ?? []) as TableConfig['columns']}
            rows={draft.rows ?? []}
            onChange={(columns, rows) => setDraft(prev => ({ ...prev, columns, rows }))}
          />
        )

      case 'progress-tracker':
        return (
          <ArrayRowEditor
            columns={PROGRESS_COLS}
            rows={(draft.items as Record<string, unknown>[]) ?? []}
            onChange={rows => setDraft(prev => ({
              ...prev,
              items: rows as DataDraft['items'],
            }))}
            newRowTemplate={{ label: '', value: 0, max: 100, color: '#6366f1' }}
          />
        )

      case 'activity-feed':
        return (
          <ArrayRowEditor
            columns={ACTIVITY_COLS}
            rows={(draft.events as Record<string, unknown>[]) ?? []}
            onChange={rows => setDraft(prev => ({
              ...prev,
              events: rows.map(r => ({
                id: (r.id as string) || String(Date.now() + Math.random()),
                label: String(r.label ?? ''),
                time: String(r.time ?? ''),
              })),
            }))}
            newRowTemplate={{ id: '', label: '', time: '' }}
          />
        )

      case 'donut-chart':
      case 'funnel-chart':
        return (
          <ArrayRowEditor
            columns={NAME_VALUE_FILL}
            rows={draft.data ?? []}
            onChange={rows => setDraft(prev => ({ ...prev, data: rows }))}
            newRowTemplate={{ name: '', value: 0, fill: '#6366f1' }}
          />
        )

      case 'waterfall-chart':
      case 'ranked-list':
        return (
          <ArrayRowEditor
            columns={LABEL_VALUE}
            rows={draft.data ?? []}
            onChange={rows => setDraft(prev => ({ ...prev, data: rows }))}
            newRowTemplate={{ label: '', value: 0 }}
          />
        )

      case 'scatter-chart':
        return (
          <ArrayRowEditor
            columns={XY}
            rows={draft.data ?? []}
            onChange={rows => setDraft(prev => ({ ...prev, data: rows }))}
            newRowTemplate={{ x: 0, y: 0 }}
          />
        )

      case 'multi-line-chart':
      case 'grouped-bar-chart':
      case 'stacked-bar-chart':
      case 'combo-chart':
        return (
          <ArrayRowEditor
            columns={getMultiSeriesColumns(widget)}
            rows={draft.data ?? []}
            onChange={rows => setDraft(prev => ({ ...prev, data: rows }))}
            newRowTemplate={getMultiSeriesNewRow(widget)}
          />
        )

      case 'text-note':
        return (
          <p className={`text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
            Edit content in the Properties tab.
          </p>
        )

      default: // line-chart, area-chart, bar-chart, treemap
        return (
          <ArrayRowEditor
            columns={NAME_VALUE}
            rows={draft.data ?? []}
            onChange={rows => setDraft(prev => ({ ...prev, data: rows }))}
            newRowTemplate={{ name: '', value: 0 }}
          />
        )
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Data source banner */}
      {sourceInfo && (
        <div className={`rounded border px-3 py-2 text-xs ${
          isDark
            ? 'border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.05)] text-amber-400'
            : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}>
          ⚡ Connected to <strong>{sourceInfo.name}</strong> — source data active. Manual data used as fallback.
        </div>
      )}

      {/* Manual data editor */}
      <div>
        <p className={sectionLabel}>Manual Data</p>
        {renderEditor()}
      </div>

      {/* Apply button */}
      <button
        onClick={isDirty ? handleApply : undefined}
        disabled={!isDirty}
        className={applyClass}
      >
        {isDirty ? '● Apply changes' : 'Apply'}
      </button>

      {/* Source mapping collapsible */}
      {sourceInfo && (
        <div className={`border-t pt-3 ${isDark ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-100'}`}>
          <button
            onClick={() => setSourceExpanded(e => !e)}
            className={`flex w-full items-center justify-between text-[10px] uppercase tracking-wide transition-colors ${
              isDark ? 'text-[#4b5563] hover:text-[#6b7280]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>Source Mapping ({sourceInfo.name})</span>
            <span>{sourceExpanded ? '▾' : '▸'}</span>
          </button>
          {sourceExpanded && (
            <div className="mt-3">
              <WidgetMappingPanel widget={widget} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npm run dev
```

Expected: server starts cleanly. Check terminal for TS errors relating to new files. Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
git add components/builder/data-editors/WidgetDataPanel.tsx
git commit -m "feat: add WidgetDataPanel coordinator with draft state and Apply button"
```

---

## Task 5: Wire WidgetDataPanel into RightPanel + add system font

**Files:**
- Modify: `components/builder/RightPanel.tsx`

- [ ] **Step 1: Update RightPanel.tsx**

Open `components/builder/RightPanel.tsx`. Make two changes:

**Change 1** — replace the import:
```tsx
// Remove:
import { WidgetMappingPanel } from './WidgetMappingPanel'

// Add:
import { WidgetDataPanel } from './data-editors/WidgetDataPanel'
```

**Change 2** — replace the Data tab content (the `<div className="p-4">` block in the Data tab):
```tsx
// Remove:
              <div className="p-4">
                <WidgetMappingPanel widget={widget} />
              </div>

// Replace with:
              <WidgetDataPanel widget={widget} />
```

**Change 3** — add `font-sans` to the `<aside>` element. Find the line:
```tsx
  const asideClass = `border-l ${
    isDark
      ? 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] backdrop-blur-[12px]'
      : 'border-gray-200 bg-white'
  }`
```
Replace with:
```tsx
  const asideClass = `border-l font-sans ${
    isDark
      ? 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] backdrop-blur-[12px]'
      : 'border-gray-200 bg-white'
  }`
```

- [ ] **Step 2: Verify in browser**

With the dev server running, open the dashboard builder. Add any widget (e.g., a KPI card or line chart). Select it. Click the **Data** tab in the right panel.

Expected:
- "Manual Data" section appears with the correct editor for the widget type
- KPI shows two text inputs (Value, Change%)
- A line/bar/area chart shows a grid with Label + Value columns and an "+ Add row" button
- Apply button is grayed (no changes yet)
- Edit a value → Apply button goes green with "● Apply changes"
- Click Apply → widget on canvas updates, button goes gray again
- Switching to a different widget resets the panel

- [ ] **Step 3: Verify font change**

The right panel text (labels, inputs, buttons) should now use the OS system font (San Francisco on Mac, Segoe UI on Windows) instead of the generic browser default.

- [ ] **Step 4: Commit**

```bash
git add components/builder/RightPanel.tsx
git commit -m "feat: wire WidgetDataPanel into Data tab; apply system font to builder panel"
```

---

## Task 6: Seed starter data in widget-registry and remove mock fallbacks from widget components

**Files:**
- Modify: `lib/widget-registry.ts`
- Modify: 15 widget component files

### Part A — Update widget-registry.ts

- [ ] **Step 1: Update defaultConfig for all array-based widgets in `lib/widget-registry.ts`**

Find each widget entry and update `defaultConfig` as follows. Leave `kpi`, `gauge`, `stat-comparison`, and `text-note` unchanged — they already have correct defaults.

```ts
'line-chart': {
  // ...existing size/label/icon/category...
  defaultConfig: { title: 'Line Chart', dataKey: 'value', data: [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 600 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 780 },
  ] },
},

'area-chart': {
  defaultConfig: { title: 'Area Chart', dataKey: 'value', data: [
    { name: 'Jan', value: 300 },
    { name: 'Feb', value: 520 },
    { name: 'Mar', value: 410 },
    { name: 'Apr', value: 650 },
  ] },
},

'bar-chart': {
  defaultConfig: { title: 'Bar Chart', dataKey: 'value', data: [
    { name: 'Q1', value: 3200 },
    { name: 'Q2', value: 4800 },
    { name: 'Q3', value: 4100 },
    { name: 'Q4', value: 5900 },
  ] },
},

'donut-chart': {
  defaultConfig: { title: 'Donut Chart', dataKey: 'value', data: [
    { name: 'Category A', value: 40, fill: '#6366f1' },
    { name: 'Category B', value: 30, fill: '#8b5cf6' },
    { name: 'Category C', value: 20, fill: '#a78bfa' },
    { name: 'Other', value: 10, fill: '#c4b5fd' },
  ] },
},

'funnel-chart': {
  defaultConfig: { title: 'Funnel Chart', data: [
    { name: 'Visits', value: 10000, fill: '#6366f1' },
    { name: 'Leads', value: 6200, fill: '#8b5cf6' },
    { name: 'Trials', value: 3100, fill: '#a78bfa' },
    { name: 'Customers', value: 890, fill: '#c4b5fd' },
  ] },
},

'data-table': {
  defaultConfig: { title: 'Data Table',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'value', label: 'Value', sortable: true },
    ],
    rows: [
      { name: 'Item A', value: 100 },
      { name: 'Item B', value: 200 },
      { name: 'Item C', value: 150 },
    ],
  },
},

'progress-tracker': {
  defaultConfig: { title: 'Progress', items: [
    { label: 'Goal A', value: 70, max: 100, color: '#6366f1' },
    { label: 'Goal B', value: 45, max: 100, color: '#8b5cf6' },
  ] },
},

'activity-feed': {
  defaultConfig: { title: 'Activity Feed', events: [
    { id: '1', label: 'New signup: alex@example.com', time: '2 min ago' },
    { id: '2', label: 'Conversion: starter → pro', time: '15 min ago' },
    { id: '3', label: 'Trial started: widget-co.com', time: '1 hr ago' },
  ] },
},

'multi-line-chart': {
  defaultConfig: { title: 'Multi-Line Chart',
    seriesLabels: { series1: 'Series 1', series2: 'Series 2' },
    data: [
      { name: 'Jan', series1: 40, series2: 30 },
      { name: 'Feb', series1: 55, series2: 40 },
      { name: 'Mar', series1: 45, series2: 50 },
      { name: 'Apr', series1: 70, series2: 45 },
    ],
  } satisfies MultiSeriesConfig,
},

'grouped-bar-chart': {
  defaultConfig: { title: 'Grouped Bar Chart',
    seriesLabels: { series1: 'Series 1', series2: 'Series 2' },
    data: [
      { name: 'Jan', series1: 40, series2: 30 },
      { name: 'Feb', series1: 55, series2: 40 },
      { name: 'Mar', series1: 45, series2: 50 },
      { name: 'Apr', series1: 70, series2: 45 },
    ],
  } satisfies MultiSeriesConfig,
},

'stacked-bar-chart': {
  defaultConfig: { title: 'Stacked Bar Chart',
    seriesLabels: { series1: 'Series 1', series2: 'Series 2' },
    data: [
      { name: 'Jan', series1: 40, series2: 30 },
      { name: 'Feb', series1: 55, series2: 40 },
      { name: 'Mar', series1: 45, series2: 50 },
      { name: 'Apr', series1: 70, series2: 45 },
    ],
  } satisfies MultiSeriesConfig,
},

'scatter-chart': {
  defaultConfig: { title: 'Scatter Chart', xLabel: 'X', yLabel: 'Y',
    data: [
      { x: 10000, y: 80 },
      { x: 25000, y: 150 },
      { x: 18000, y: 120 },
      { x: 40000, y: 200 },
    ],
  } satisfies ScatterChartConfig,
},

'combo-chart': {
  defaultConfig: { title: 'Combo Chart', barLabel: 'Volume', lineLabel: 'Rate',
    data: [
      { name: 'Acme', bar: 48000, line: 12.4 },
      { name: 'Globex', bar: 32000, line: 8.1 },
      { name: 'Initech', bar: 27000, line: 15.2 },
      { name: 'Umbrella', bar: 19000, line: 6.7 },
    ],
  } satisfies ComboChartConfig,
},

'ranked-list': {
  defaultConfig: { title: 'Ranked List', color: '#6366f1', maxItems: 10,
    data: [
      { label: 'Item A', value: 48000 },
      { label: 'Item B', value: 36000 },
      { label: 'Item C', value: 27000 },
      { label: 'Item D', value: 19000 },
    ],
  } satisfies RankedListConfig,
},

'waterfall-chart': {
  defaultConfig: { title: 'Waterfall Chart',
    positiveColor: '#10b981', negativeColor: '#ef4444', totalColor: '#6366f1',
    data: [
      { label: 'Revenue', value: 50000 },
      { label: 'Upsells', value: 8000 },
      { label: 'Refunds', value: -5000 },
      { label: 'Discounts', value: -3000 },
      { label: 'Net', value: 50000 },
    ],
  } satisfies WaterfallChartConfig,
},

treemap: {
  defaultConfig: { title: 'Treemap',
    data: [
      { name: 'Client A', value: 48000 },
      { name: 'Client B', value: 32000 },
      { name: 'Client C', value: 27000 },
      { name: 'Client D', value: 19000 },
      { name: 'Client E', value: 14000 },
    ],
  } satisfies TreemapConfig,
},
```

Note: The `satisfies` type constraints on `multi-line-chart`, `scatter-chart`, `combo-chart`, etc. will cause TypeScript errors because those config types don't currently include `data` in their definitions. Fix this by updating `types/dashboard.ts` — the `data` field is already typed as `data?: Record<string, unknown>[]` in those interfaces, so `satisfies` should work. If you get TS errors, remove the `satisfies` cast from entries that have `data` and add `as MultiSeriesConfig` etc. instead, or just remove `satisfies` entirely from those entries.

- [ ] **Step 2: Commit the registry changes**

```bash
git add lib/widget-registry.ts
git commit -m "feat: seed starter data in widget defaultConfig so new widgets are never blank"
```

### Part B — Remove mock fallbacks from widget components

Apply the same pattern to each file. The change in each file is:
1. Remove the `const MOCK = [...]` or `const MOCK_* = [...]` constant
2. Remove any `import { ... } from '@/lib/mockData'` if present
3. Change the data resolution from `c.data && c.data.length > 0 ? c.data : MOCK` to `c.data ?? []`

- [ ] **Step 3: Update LineChartWidget.tsx, AreaChartWidget.tsx, BarChartWidget.tsx**

In each file, find the MOCK constant and fallback pattern. Replace:
```tsx
const MOCK = [...]

// inside component:
const data = (c.data && c.data.length > 0) ? c.data : MOCK
```
With:
```tsx
// inside component:
const data = c.data ?? []
```

- [ ] **Step 4: Update DonutChartWidget.tsx**

Remove the `CATEGORY_DATA` import from `@/lib/mockData`. Replace:
```tsx
import { CATEGORY_DATA } from '@/lib/mockData'
// ...
const data = (c.data && c.data.length > 0) ? c.data : CATEGORY_DATA
```
With:
```tsx
const data = c.data ?? []
```

- [ ] **Step 5: Update FunnelChartWidget.tsx**

Remove `const MOCK = [...]`. Replace:
```tsx
const data = (c.data && c.data.length > 0) ? c.data : MOCK
```
With:
```tsx
const data = c.data ?? []
```

- [ ] **Step 6: Update RankedList.tsx**

Remove `const MOCK = [...]`. Replace:
```tsx
const raw = c.data && c.data.length > 0 ? c.data : MOCK
```
With:
```tsx
const raw = c.data ?? []
```

- [ ] **Step 7: Update WaterfallChart.tsx**

Remove `const MOCK = [...]`. Replace:
```tsx
const raw = c.data && c.data.length > 0 ? c.data : MOCK
```
With:
```tsx
const raw = c.data ?? []
```

- [ ] **Step 8: Update Treemap.tsx**

Remove `const MOCK = [...]`. Replace:
```tsx
const raw = c.data && c.data.length > 0 ? c.data : MOCK
```
With:
```tsx
const raw = c.data ?? []
```

- [ ] **Step 9: Update ScatterChart.tsx**

Remove `const MOCK = [...]`. Replace:
```tsx
const raw = c.data && c.data.length > 0 ? c.data : MOCK
```
With:
```tsx
const raw = c.data ?? []
```

- [ ] **Step 10: Update MultiLineChart.tsx, GroupedBarChart.tsx, StackedBarChart.tsx, ComboChart.tsx**

In each file, remove `const MOCK = [...]`. Replace the fallback:
```tsx
const raw = c.data && c.data.length > 0 ? c.data : MOCK
```
With:
```tsx
const raw = c.data ?? []
```

- [ ] **Step 11: Update DataTableWidget.tsx**

Remove `MOCK_COLUMNS` and `MOCK_ROWS`. Replace:
```tsx
const MOCK_COLUMNS = [...]
const MOCK_ROWS = [...]
// ...
const columns = c.columns.length ? c.columns : MOCK_COLUMNS
const rows: Record<string, unknown>[] = (c.rows.length ? c.rows : MOCK_ROWS) as Record<string, unknown>[]
```
With:
```tsx
const columns = c.columns
const rows = c.rows as Record<string, unknown>[]
```

- [ ] **Step 12: Update ProgressTracker.tsx**

Remove `const MOCK_ITEMS = [...]`. Replace:
```tsx
const items = c.items.length ? c.items : MOCK_ITEMS
```
With:
```tsx
const items = c.items
```

- [ ] **Step 13: Update ActivityFeed.tsx**

Remove the `ACTIVITY_EVENTS` import from `@/lib/mockData`. Replace:
```tsx
import { ACTIVITY_EVENTS } from '@/lib/mockData'
// ...
const events = c.events.length ? c.events : ACTIVITY_EVENTS
```
With:
```tsx
const events = c.events
```

- [ ] **Step 14: Verify no remaining imports of lib/mockData**

```bash
grep -r "from '@/lib/mockData'" components/
```

Expected: no output. If any imports remain, update those files too.

- [ ] **Step 15: Delete lib/mockData.ts**

```bash
rm lib/mockData.ts
```

Verify the build still works:
```bash
npm run dev
```

Expected: no errors. If `lib/mockData.ts` is still imported anywhere, the build will error — fix those imports.

- [ ] **Step 16: Verify in browser — end-to-end**

With the dev server running:

1. Open the builder. Clear the canvas if needed.
2. **Drag in a Line Chart** — it should immediately show the 4 starter data points (Jan/Feb/Mar/Apr). No mock/random data.
3. **Select it → Data tab** — grid shows the 4 rows. Edit "Jan" value to 1000, click Apply → chart updates.
4. **Add a row** — click "+ Add row", type a label and value, click Apply → new data point appears in chart.
5. **Drag in a KPI card** — select it → Data tab → value and change% fields appear.
6. **Drag in a Donut chart** — select it → Data tab → grid with Label/Value/Color columns (color picker per row).
7. **Drag in a Data Table** — Data tab → columns section and rows section both present.
8. **Drag in a Multi-Line Chart** — Data tab → 3-column grid (Label, Series 1, Series 2). Change series names in Properties → column headers update in Data tab.

- [ ] **Step 17: Commit**

```bash
git add components/widgets/ lib/
git commit -m "feat: replace mock data fallbacks with starter data from config; delete lib/mockData.ts"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Data tab always shows manual editor (WidgetDataPanel)
- ✅ All 19 widget types covered (text-note shows "edit in Properties" message)
- ✅ Scalar editors for KPI and Gauge
- ✅ ArrayRowEditor handles 12+ widget types
- ✅ MultiSeriesRowEditor handled inline in WidgetDataPanel via dynamic column schema
- ✅ TableDataEditor for data-table with full columns+rows CRUD
- ✅ Local draft state — no auto-save
- ✅ Apply button: disabled when clean, green+dot when dirty
- ✅ Switching widgets resets draft (useEffect on widget.id)
- ✅ Data source banner + collapsible mapping when dataSourceId is set
- ✅ Starter data in defaultConfig for all array-based widgets
- ✅ Mock fallbacks removed from all 15 widget components
- ✅ lib/mockData.ts deleted
- ✅ System font (font-sans) on RightPanel aside

**Type consistency check:**
- `ColumnDef` exported from `ArrayRowEditor.tsx`, imported in `WidgetDataPanel.tsx` ✅
- `DataDraft` type in `WidgetDataPanel` covers all widget-specific field shapes ✅
- `initDraft` returns correct keys per widget type ✅
- `handleApply` passes `draft as Partial<WidgetConfig>` to `updateWidgetConfig` — consistent with existing store signature ✅

**No placeholders:** All steps have exact code. ✅
