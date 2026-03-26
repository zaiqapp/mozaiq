'use client'
import React, { useState, useEffect } from 'react'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
import { WidgetMappingPanel } from '@/components/builder/WidgetMappingPanel'
import { ArrayRowEditor, type ColumnDef } from './ArrayRowEditor'
import { ScalarDataFields, type ScalarFieldDef } from './ScalarDataFields'
import { TableDataEditor } from './TableDataEditor'
import type {
  Widget,
  WidgetConfig,
  KPIConfig,
  GaugeConfig,
  ChartConfig,
  FunnelConfig,
  TableConfig,
  ProgressConfig,
  ActivityConfig,
  MultiSeriesConfig,
  ScatterChartConfig,
  ComboChartConfig,
  RankedListConfig,
  WaterfallChartConfig,
  TreemapConfig,
} from '@/types/dashboard'

// ── Local type aliases ───────────────────────────────────────────────────────

type TableColumn = { key: string; label: string; sortable?: boolean }
type TableRow = Record<string, unknown>

// ── Module-level column definitions ─────────────────────────────────────────

const CHART_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
]

const FUNNEL_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
]

const WATERFALL_COLUMNS: ColumnDef[] = [
  { key: 'name', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number' },
  {
    key: 'type',
    label: 'Type',
    type: 'select',
    width: 90,
    options: [
      { value: 'positive', label: 'Gain' },
      { value: 'negative', label: 'Loss' },
      { value: 'total', label: 'Total' },
    ],
  },
]

const SCATTER_COLUMNS: ColumnDef[] = [
  { key: 'x', label: 'X', type: 'number' },
  { key: 'y', label: 'Y', type: 'number' },
]

const PROGRESS_COLUMNS: ColumnDef[] = [
  { key: 'label', label: 'Label', type: 'text' },
  { key: 'value', label: 'Value', type: 'number', width: 60 },
  { key: 'max', label: 'Max', type: 'number', width: 60 },
  { key: 'color', label: 'Color', type: 'color', width: 48 },
]

const ACTIVITY_COLUMNS: ColumnDef[] = [
  { key: 'label', label: 'Label', type: 'text' },
  { key: 'time', label: 'Time', type: 'text', width: 80 },
]

// ── Scalar field definitions ─────────────────────────────────────────────────

const KPI_FIELDS: ScalarFieldDef[] = [
  { key: 'value', label: 'Value', type: 'text', hint: 'Shown as-is — include prefix/suffix if needed' },
  { key: 'change', label: 'Change %', type: 'number', hint: 'Positive = green arrow, negative = red arrow' },
]

const GAUGE_FIELDS: ScalarFieldDef[] = [
  { key: 'value', label: 'Value', type: 'number' },
]

// ── Multi-series column derivation ───────────────────────────────────────────

function getMultiSeriesColumns(widget: Widget): ColumnDef[] {
  const nameCol: ColumnDef = { key: 'name', label: 'Label', type: 'text', width: 70 }
  if (widget.type === 'combo-chart') {
    const c = widget.config as ComboChartConfig
    return [
      nameCol,
      { key: 'bar', label: c.barLabel ?? 'Bar', type: 'number' },
      { key: 'line', label: c.lineLabel ?? 'Line', type: 'number' },
    ]
  }
  // multi-line, grouped-bar, stacked-bar
  const c = widget.config as MultiSeriesConfig
  const seriesLabels = c.seriesLabels ?? {}
  const seriesEntries = Object.entries(seriesLabels)
  if (seriesEntries.length === 0) {
    // fallback: two unnamed series
    return [nameCol, { key: 'series1', label: 'Series 1', type: 'number' }, { key: 'series2', label: 'Series 2', type: 'number' }]
  }
  return [nameCol, ...seriesEntries.map(([key, label]) => ({ key, label, type: 'number' as const }))]
}

// ── Draft initializer ────────────────────────────────────────────────────────

function initDraft(widget: Widget): unknown {
  const c = widget.config
  switch (widget.type) {
    case 'kpi': {
      const k = c as KPIConfig
      return { value: k.value ?? '', change: k.change ?? 0 }
    }
    case 'gauge': {
      const g = c as GaugeConfig
      return { value: g.value ?? 0 }
    }
    case 'data-table': {
      const t = c as TableConfig
      return { columns: t.columns ?? [], rows: t.rows ?? [] }
    }
    case 'progress-tracker': {
      const p = c as ProgressConfig
      return (p.items ?? []).map(item => ({ ...item }))
    }
    case 'activity-feed': {
      const a = c as ActivityConfig
      return (a.events ?? []).map(e => ({ label: e.label, time: e.time }))
    }
    case 'funnel-chart': {
      const f = c as FunnelConfig
      return (f.data ?? []).map(d => ({ name: d.name, value: d.value }))
    }
    case 'multi-line-chart':
    case 'grouped-bar-chart':
    case 'stacked-bar-chart':
    case 'combo-chart': {
      const ms = c as MultiSeriesConfig | ComboChartConfig
      return [...((ms as MultiSeriesConfig).data ?? [])]
    }
    case 'scatter-chart': {
      const sc = c as ScatterChartConfig
      return [...(sc.data ?? [])]
    }
    case 'waterfall-chart': {
      const wf = c as WaterfallChartConfig
      return [...(wf.data ?? [])]
    }
    case 'ranked-list': {
      const rl = c as RankedListConfig
      return [...(rl.data ?? [])]
    }
    case 'treemap': {
      const tm = c as TreemapConfig
      return [...(tm.data ?? [])]
    }
    default: {
      // line, area, bar, donut charts
      const chart = c as ChartConfig
      return [...(chart.data ?? [])]
    }
  }
}

// ── renderEditor (outside component to avoid recreation on each render) ──────

function renderEditor(
  widget: Widget,
  draft: unknown,
  setDraft: (d: unknown) => void,
  _isDark: boolean,
): React.ReactNode {
  switch (widget.type) {
    case 'kpi':
      return (
        <ScalarDataFields
          fields={KPI_FIELDS}
          values={draft as Record<string, unknown>}
          onChange={(key, value) => setDraft({ ...(draft as Record<string, unknown>), [key]: value })}
        />
      )
    case 'gauge':
      return (
        <ScalarDataFields
          fields={GAUGE_FIELDS}
          values={draft as Record<string, unknown>}
          onChange={(key, value) => setDraft({ ...(draft as Record<string, unknown>), [key]: value })}
        />
      )
    case 'data-table':
      return (
        <TableDataEditor
          columns={(draft as { columns: TableColumn[]; rows: TableRow[] }).columns}
          rows={(draft as { columns: TableColumn[]; rows: TableRow[] }).rows as Record<string, string | number>[]}
          onChange={(columns, rows) => setDraft({ columns, rows })}
        />
      )
    case 'progress-tracker':
      return (
        <ArrayRowEditor
          columns={PROGRESS_COLUMNS}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={{ label: '', value: 0, max: 100 }}
        />
      )
    case 'activity-feed':
      return (
        <ArrayRowEditor
          columns={ACTIVITY_COLUMNS}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={{ label: '', time: '' }}
        />
      )
    case 'funnel-chart':
      return (
        <ArrayRowEditor
          columns={FUNNEL_COLUMNS}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={{ name: '', value: 0 }}
        />
      )
    case 'scatter-chart':
      return (
        <ArrayRowEditor
          columns={SCATTER_COLUMNS}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={{ x: 0, y: 0 }}
        />
      )
    case 'waterfall-chart':
      return (
        <ArrayRowEditor
          columns={WATERFALL_COLUMNS}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={{ name: '', value: 0, type: 'positive' }}
        />
      )
    case 'multi-line-chart':
    case 'grouped-bar-chart':
    case 'stacked-bar-chart':
    case 'combo-chart': {
      const cols = getMultiSeriesColumns(widget)
      const newRowTpl = Object.fromEntries(cols.map(c => [c.key, c.key === 'name' ? '' : 0]))
      return (
        <ArrayRowEditor
          columns={cols}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={newRowTpl}
        />
      )
    }
    case 'ranked-list':
      return (
        <ArrayRowEditor
          columns={CHART_COLUMNS}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={{ name: '', value: 0 }}
        />
      )
    case 'treemap':
      return (
        <ArrayRowEditor
          columns={CHART_COLUMNS}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={{ name: '', value: 0 }}
        />
      )
    case 'text-note':
      return null
    default:
      // line-chart, area-chart, bar-chart, donut-chart
      return (
        <ArrayRowEditor
          columns={CHART_COLUMNS}
          rows={draft as Record<string, unknown>[]}
          onChange={rows => setDraft(rows)}
          newRowTemplate={{ name: '', value: 0 }}
        />
      )
  }
}

// ── Component ────────────────────────────────────────────────────────────────

interface Props {
  widget: Widget
}

export function WidgetDataPanel({ widget }: Props) {
  const { updateWidgetConfig, dataSources } = useDashboardStore()
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const [draft, setDraft] = useState<unknown>(() => initDraft(widget))
  const [mappingOpen, setMappingOpen] = useState(false)

  // Reset draft when widget changes
  useEffect(() => {
    setDraft(initDraft(widget))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [widget.id])

  const isDirty = JSON.stringify(draft) !== JSON.stringify(initDraft(widget))

  const handleApply = () => {
    switch (widget.type) {
      case 'kpi': {
        const d = draft as { value: unknown; change: unknown }
        updateWidgetConfig(widget.id, { value: d.value as string | number, change: d.change as number })
        break
      }
      case 'gauge': {
        const d = draft as { value: unknown }
        updateWidgetConfig(widget.id, { value: d.value as number })
        break
      }
      case 'data-table': {
        const d = draft as { columns: unknown; rows: unknown }
        updateWidgetConfig(widget.id, { columns: d.columns as TableConfig['columns'], rows: d.rows as TableConfig['rows'] })
        break
      }
      case 'progress-tracker': {
        const rows = (draft as Record<string, unknown>[]).map(r => ({
          label: String(r.label ?? ''),
          value: Number(r.value ?? 0),
          max: Number(r.max ?? 100),
          ...(r.color !== undefined ? { color: String(r.color) } : {}),
        }))
        updateWidgetConfig(widget.id, { items: rows })
        break
      }
      case 'activity-feed': {
        const rows = (draft as Record<string, unknown>[]).map(r => ({
          id: crypto.randomUUID(),
          label: String(r.label ?? ''),
          time: String(r.time ?? ''),
        }))
        updateWidgetConfig(widget.id, { events: rows })
        break
      }
      default: {
        // All array-data widgets: line, area, bar, donut, funnel, waterfall, scatter,
        // ranked-list, treemap, multi-line, grouped-bar, stacked-bar, combo
        const rows = (draft as Record<string, unknown>[]).map(({ _id, ...rest }) => rest)
        updateWidgetConfig(widget.id, { data: rows } as Partial<WidgetConfig>)
        break
      }
    }
  }

  // Data source info
  const dataSource = widget.dataSourceId
    ? dataSources.find(ds => ds.id === widget.dataSourceId)
    : undefined

  return (
    <div className="flex flex-col gap-0">
      {/* Data source banner (if connected) */}
      {dataSource && (
        <div className={`mb-3 rounded border px-3 py-2 text-xs ${
          isDark
            ? 'border-amber-800/50 bg-amber-950/30 text-amber-400'
            : 'border-amber-200 bg-amber-50 text-amber-700'
        }`}>
          ⚡ Connected to <strong>{dataSource.name}</strong> — source data is active. Manual data used as fallback only.
        </div>
      )}

      {/* Section header */}
      <div className={`mb-2 text-[9px] uppercase tracking-wide ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>
        Manual Data
      </div>

      {/* text-note special case */}
      {widget.type === 'text-note' ? (
        <p className={`text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
          Content is editable in the Properties tab.
        </p>
      ) : (
        renderEditor(widget, draft, setDraft, isDark)
      )}

      {/* Apply button */}
      {widget.type !== 'text-note' && (
        <div className="mt-3">
          {isDirty ? (
            <button
              onClick={handleApply}
              className="w-full rounded border border-emerald-600/40 bg-emerald-950/40 py-1.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-950/60"
            >
              ● Apply changes
            </button>
          ) : (
            <button
              disabled
              className={`w-full cursor-not-allowed rounded border py-1.5 text-xs ${
                isDark
                  ? 'border-[rgba(255,255,255,0.06)] text-[#374151]'
                  : 'border-gray-100 text-gray-300'
              }`}
            >
              Apply
            </button>
          )}
        </div>
      )}

      {/* Collapsible source mapping section */}
      {dataSource && (
        <div className={`mt-4 border-t pt-3 ${isDark ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-100'}`}>
          <button
            onClick={() => setMappingOpen(o => !o)}
            className={`flex w-full items-center gap-1 text-[9px] uppercase tracking-wide ${
              isDark ? 'text-[#4b5563] hover:text-[#6b7280]' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span>{mappingOpen ? '▼' : '▶'}</span>
            <span>Source Mapping ({dataSource.name})</span>
          </button>
          {mappingOpen && (
            <div className="mt-2">
              <WidgetMappingPanel widget={widget} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
