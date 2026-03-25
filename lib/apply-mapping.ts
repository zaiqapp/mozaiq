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
  mapping: Record<string, string>,
): unknown | null {
  if (rows.length === 0) return null
  if (Object.keys(mapping).length === 0) return null

  if (fieldType === 'number') {
    const col = mapping[fieldKey]
    if (!col) return null
    const firstRow = rows[0]
    if (!firstRow) return null
    const raw = firstRow[col]
    if (raw === undefined || raw === null) return null
    const n = Number(raw)
    return isNaN(n) ? null : n
  }

  if (fieldType === 'string') {
    const col = mapping[fieldKey]
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
    const mappedCols = new Set(Object.values(mapping))
    return rows.map((row) => {
      const out: Record<string, unknown> = {}
      for (const col of mappedCols) {
        if (col in row) out[col] = row[col]
      }
      return out
    })
  }

  // Rename mode: mapping is widgetKey → sourceColumn, output rows use widgetKey names
  const mappingEntries = Object.entries(mapping)
  if (mappingEntries.length === 0) return null

  return rows.map((row, i) => {
    const out: Record<string, unknown> = {}
    for (const [widgetKey, sourceCol] of mappingEntries) {
      out[widgetKey] = row[sourceCol] ?? null
    }
    // activity-feed: ensure id is a string
    if (fieldKey === 'events' && !out['id']) {
      out['id'] = String(i)
    }
    return out
  })
}
