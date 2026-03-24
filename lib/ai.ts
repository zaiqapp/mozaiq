import type { WidgetType } from '@/types/dashboard'
import { WIDGET_TYPES } from './widget-registry'

const VALID_WIDGET_TYPES = new Set<string>(WIDGET_TYPES)

export interface AIGeneratedDashboard {
  name: string
  widgets: { id: string; type: WidgetType; config: Record<string, unknown> }[]
  layout: { i: string; x: number; y: number; w: number; h: number }[]
}

export function validateDashboardShape(raw: unknown): AIGeneratedDashboard {
  if (!raw || typeof raw !== 'object') throw new Error('Response is not an object')
  const obj = raw as Record<string, unknown>

  if (!obj['name'] || typeof obj['name'] !== 'string' || obj['name'].trim() === '') {
    throw new Error('Missing or empty name')
  }

  if (!Array.isArray(obj['widgets']) || obj['widgets'].length === 0) {
    throw new Error('widgets must be a non-empty array')
  }

  if (!Array.isArray(obj['layout']) || obj['layout'].length === 0) {
    throw new Error('layout must be a non-empty array')
  }

  const widgets = obj['widgets'] as Record<string, unknown>[]
  for (const w of widgets) {
    if (!w['id'] || typeof w['id'] !== 'string') throw new Error('Widget missing id')
    if (!w['type'] || !VALID_WIDGET_TYPES.has(w['type'] as string)) {
      throw new Error(`Invalid widget type: ${w['type']}`)
    }
    if (!w['config'] || typeof w['config'] !== 'object') throw new Error('Widget missing config')
    const config = w['config'] as Record<string, unknown>
    if (!config['title'] || typeof config['title'] !== 'string') {
      throw new Error('Widget config missing title')
    }
  }

  const widgetIds = new Set(widgets.map((w) => w['id'] as string))
  if (widgetIds.size !== widgets.length) throw new Error('Duplicate widget IDs')

  const layout = obj['layout'] as Record<string, unknown>[]
  for (const item of layout) {
    if (!widgetIds.has(item['i'] as string)) {
      throw new Error(`Layout item i="${item['i']}" does not match any widget id`)
    }
    for (const key of ['x', 'y', 'w', 'h'] as const) {
      if (typeof item[key] !== 'number') throw new Error(`Layout item missing numeric ${key}`)
    }
  }

  return {
    name: obj['name'] as string,
    widgets: widgets as AIGeneratedDashboard['widgets'],
    layout: layout as AIGeneratedDashboard['layout'],
  }
}

export const SYSTEM_PROMPT = `You are a dashboard builder assistant. When given a description of a dashboard, return a valid JSON object.

Return ONLY a raw JSON object — no markdown, no backticks, no explanation.

The JSON must match this exact shape:
{
  "name": string,
  "widgets": Widget[],
  "layout": Layout[]
}

Available widget types and config shapes:
- "kpi": { title, value (string|number), change (number, % positive=up), changeLabel, prefix?, suffix?, color? }
- "line-chart": { title, dataKey, color?, data?: [{name, value}] }
- "area-chart": { title, dataKey, color?, data?: [{name, value}] }
- "bar-chart": { title, dataKey, color?, data?: [{name, value}] }
- "donut-chart": { title, dataKey, data?: [{name, value}] }
- "funnel-chart": { title, data?: [{name, value, fill?}] }
- "gauge": { title, value (number), min? (default 0), max? (default 100), unit?, color? }
- "data-table": { title, columns: [{key, label}], rows: [{}] }
- "progress-tracker": { title, items: [{label, value, max, color?}] }
- "activity-feed": { title, events: [{id, label, time}] }
- "text-note": { title, content }

Layout items: { i: widgetId, x: 0-11, y: 0+, w: 1-12, h: 1-6 }

Rules:
- Use 12-column grid. KPI w:3 h:2. Charts w:6 h:4. Table w:12 h:4. Gauge w:3 h:3. Text-note w:6 h:2.
- Always include exactly 4 KPI cards at y:0 filling the top row.
- Use 4-8 total widgets per dashboard.
- Widget IDs must be unique short slugs like "kpi-revenue", "chart-users".
- Generate realistic mock data matching the described business context.
- Return ONLY the JSON object. No preamble, no explanation, no markdown fences.`
