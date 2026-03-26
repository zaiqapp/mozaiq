import type { AxisMapping } from '@/types/dashboard'
import type { WidgetFieldDef } from './widget-field-registry'

// Widget types that use rename mode (name+value output shape)
const CHART_TYPES = new Set(['line-chart', 'area-chart', 'bar-chart', 'donut-chart', 'funnel-chart'])
export { CHART_TYPES }

// fieldKey for data-table uses pass-through mode
const PASS_THROUGH_FIELD = 'rows'

export function applyMapping(
  fieldKey: string,
  fieldType: WidgetFieldDef['type'],
  rows: Record<string, unknown>[],
  mapping: Record<string, AxisMapping>,
): unknown | null {
  if (rows.length === 0) return null
  if (Object.keys(mapping).length === 0) return null

  if (fieldType === 'number') {
    const axisMapping = mapping[fieldKey]
    const col = axisMapping?.column
    if (!col) return null
    const agg = axisMapping?.aggregation ?? 'sum'
    let sum = 0
    let count = 0
    for (const row of rows) {
      const raw = row[col]
      if (raw === undefined || raw === null) continue
      const n = Number(raw)
      if (!isNaN(n)) { sum += n; count++ }
    }
    if (count === 0) return null
    return agg === 'avg' ? Math.round((sum / count) * 100) / 100 : sum
  }

  if (fieldType === 'string') {
    const col = mapping[fieldKey]?.column
    if (!col) return null
    const firstRow = rows[0]
    if (!firstRow) return null
    const raw = firstRow[col]
    if (raw === undefined || raw === null) return null
    return String(raw)
  }

  // array-of-objects
  if (fieldKey === PASS_THROUGH_FIELD) {
    // Pass-through mode for data-table: keep source column names, only include mapped columns
    const mappedCols = new Set(Object.values(mapping).map((m) => m.column))
    return rows.map((row) => {
      const out: Record<string, unknown> = {}
      for (const col of mappedCols) {
        if (col in row) out[col] = row[col]
      }
      return out
    })
  }

  // Rename mode: mapping is widgetKey → AxisMapping, output rows use widgetKey names
  const mappingEntries = Object.entries(mapping)
  if (mappingEntries.length === 0) return null

  return rows.map((row, i) => {
    const out: Record<string, unknown> = {}
    for (const [widgetKey, axisMapping] of mappingEntries) {
      out[widgetKey] = row[axisMapping.column] ?? null
    }
    // activity-feed: ensure id is a string
    if (fieldKey === 'events' && !out['id']) {
      out['id'] = String(i)
    }
    return out
  })
}
