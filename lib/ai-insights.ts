export const WIDGET_INSIGHT_SYSTEM_PROMPT = `You analyze dashboard widget data and produce concise, actionable business insights.

You will receive a widget type, its display configuration, and the actual data rows it is rendering.
Write exactly 2-3 sentences that:
1. Identify the most notable pattern, trend, or anomaly visible in the data rows
2. Quantify the finding using specific numbers from the data
3. Suggest one actionable next step

Only describe what is actually present in the data. Do not invent numbers or trends not shown.
If no data rows are provided, say so and skip analysis. Do not use bullet points or markdown. Plain English only.`

export const DASHBOARD_INSIGHT_SYSTEM_PROMPT = `You analyze multi-widget business dashboards and produce an executive summary.

You will receive each widget's type, display configuration, and its actual data rows.
Write exactly 2-4 sentences that:
1. Identify the overall story the data tells using specific numbers from the rows
2. Highlight the most significant cross-widget finding
3. Note any contradictions or opportunities worth investigating

Only describe what is actually in the provided data. Do not invent metrics.
If widgets have no data rows, note that analysis is limited. No bullet points or markdown. Plain English only.`

const MAX_ROWS = 50

export function buildWidgetUserMessage(
  widgetType: string,
  config: unknown,
  data?: Record<string, unknown>[],
  mapping?: Record<string, { column: string }>,
): string {
  const type = widgetType.trim()
  const lines: string[] = [
    `Widget type: ${type}`,
    `Config: ${JSON.stringify(config, null, 2)}`,
  ]
  if (mapping && Object.keys(mapping).length > 0) {
    lines.push(`Column mapping: ${JSON.stringify(mapping)}`)
  }
  if (data && data.length > 0) {
    const sample = data.slice(0, MAX_ROWS)
    lines.push(`Data rows (${data.length} total${data.length > MAX_ROWS ? `, showing first ${MAX_ROWS}` : ''}):\n${JSON.stringify(sample, null, 2)}`)
  } else {
    lines.push('Data rows: none available')
  }
  return lines.join('\n')
}

export function buildDashboardUserMessage(
  dashboardName: string,
  widgets: Array<{ type: string; config: unknown; data?: Record<string, unknown>[]; mapping?: Record<string, { column: string }> }>,
): string {
  const name = dashboardName.trim() || 'Untitled'
  const sections = widgets.map((w, i) => {
    const parts: string[] = [`${i + 1}. ${w.type} — config: ${JSON.stringify(w.config)}`]
    if (w.mapping && Object.keys(w.mapping).length > 0) {
      parts.push(`   mapping: ${JSON.stringify(w.mapping)}`)
    }
    if (w.data && w.data.length > 0) {
      const sample = w.data.slice(0, MAX_ROWS)
      parts.push(`   data (${w.data.length} rows): ${JSON.stringify(sample)}`)
    } else {
      parts.push('   data: none')
    }
    return parts.join('\n')
  })
  return `Dashboard: ${name}\nWidgets:\n${sections.join('\n')}`
}
