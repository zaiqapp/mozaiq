export const WIDGET_INSIGHT_SYSTEM_PROMPT = `You analyze dashboard widget data and produce concise, actionable business insights.

Given a widget type and its configuration data, write exactly 2-3 sentences that:
1. Identify the most notable pattern, trend, or anomaly in the data
2. Quantify the finding with specific numbers when available
3. Suggest one actionable next step if relevant

Be specific and direct. Do not use bullet points or markdown headers. Plain English only.`

export const DASHBOARD_INSIGHT_SYSTEM_PROMPT = `You analyze multi-widget business dashboards and produce an executive summary.

Given a list of widgets with their types and data, write exactly 2-4 sentences that:
1. Identify the overall story the data tells (growth, risk, opportunity)
2. Highlight the most significant cross-widget finding
3. Note any contradictions or opportunities worth investigating

Be specific and reference actual numbers when available. No bullet points or markdown headers. Plain English only.`

export function buildWidgetUserMessage(widgetType: string, config: unknown): string {
  const type = widgetType.trim()
  return `Widget type: ${type}\nConfig: ${JSON.stringify(config, null, 2)}`
}

export function buildDashboardUserMessage(
  dashboardName: string,
  widgets: Array<{ type: string; config: unknown }>,
): string {
  const name = dashboardName.trim() || 'Untitled'
  const lines = widgets.map((w, i) => `${i + 1}. ${w.type} — ${JSON.stringify(w.config)}`)
  return `Dashboard: ${name}\nWidgets:\n${lines.join('\n')}`
}
