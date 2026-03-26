import type { WidgetType, AxisMapping } from '@/types/dashboard'
import { WIDGET_TYPES } from './widget-registry'

const VALID_TYPES = new Set<string>(WIDGET_TYPES)

export interface GeneratedWidget {
  type: WidgetType
  config: Record<string, unknown>
  dataSourceId: string
  dataSourceMapping: Record<string, AxisMapping>
  title?: string
}

export function validateGeneratedWidgets(
  raw: unknown,
  dataSourceId: string,
  allowedColumns: string[],
): GeneratedWidget[] {
  if (!raw || !Array.isArray(raw)) return []
  const colSet = new Set(allowedColumns)
  const result: GeneratedWidget[] = []

  for (const item of raw as Record<string, unknown>[]) {
    if (!item || typeof item !== 'object') continue
    if (!VALID_TYPES.has(item['type'] as string)) continue

    const mappingRaw = item['dataSourceMapping'] as Record<string, unknown> | undefined
    if (!mappingRaw || typeof mappingRaw !== 'object') continue

    const mapping: Record<string, AxisMapping> = {}
    let valid = true
    for (const [fieldKey, val] of Object.entries(mappingRaw)) {
      const col = typeof val === 'object' && val !== null
        ? (val as Record<string, unknown>)['column'] as string | undefined
        : typeof val === 'string' ? val : undefined
      if (!col || !colSet.has(col)) { valid = false; break }
      mapping[fieldKey] = { column: col }
    }
    if (!valid || Object.keys(mapping).length === 0) continue

    result.push({
      type: item['type'] as WidgetType,
      title: typeof item['title'] === 'string' ? item['title'] : undefined,
      config: (typeof item['config'] === 'object' && item['config'] !== null ? item['config'] : {}) as Record<string, unknown>,
      dataSourceId,
      dataSourceMapping: mapping,
    })
  }

  return result
}

export const GENERATE_WIDGETS_SYSTEM_PROMPT = `You are a data visualization assistant. Given column names and sample data, return a JSON array of dashboard widgets.

Return ONLY a raw JSON array — no markdown, no backticks, no explanation.

Each element in the array must have this shape:
{
  "type": WidgetType,
  "config": { "title": string, ...other config fields },
  "dataSourceMapping": { fieldKey: { "column": string } }
}

Available widget types and their dataSourceMapping fields:
- "kpi": { "value": { "column": "<numeric col>" }, "change": { "column": "<numeric col>" } }
- "line-chart": { "name": { "column": "<x-axis col>" }, "value": { "column": "<y-axis col>" } }
- "area-chart": { "name": { "column": "<x-axis col>" }, "value": { "column": "<y-axis col>" } }
- "bar-chart": { "name": { "column": "<category col>" }, "value": { "column": "<numeric col>" } }
- "donut-chart": { "name": { "column": "<category col>" }, "value": { "column": "<numeric col>" } }
- "funnel-chart": { "name": { "column": "<stage col>" }, "value": { "column": "<count col>" } }
- "gauge": { "value": { "column": "<numeric col>" } }
- "data-table": { "<any label>": { "column": "<col>" }, ... } (one entry per column to show)
- "progress-tracker": { "items": { "column": "<items col>" } }
- "activity-feed": { "events": { "column": "<events col>" } }
- "stat-comparison": { "primary": { "column": "<numeric col>" }, "secondary": { "column": "<numeric col>" } } — use for head-to-head comparisons (budgeted vs actual, this vs last period). Always include config: { "primaryLabel": "<col1 name>", "secondaryLabel": "<col2 name>" }
- "multi-line-chart": { "name": { "column": "<x col>" }, "series1": { "column": "<y col>" }, "series2": { "column": "<y col>" } } — 2 series; use when comparing trends of 2 metrics over time. Config: { "seriesLabels": { "series1": "<col1 name>", "series2": "<col2 name>" } }
- "grouped-bar-chart": { "name": { "column": "<category>" }, "series1": { "column": "<val>" }, "series2": { "column": "<val>" } } — side-by-side bars per category. Config: { "seriesLabels": { "series1": "<col1 name>", "series2": "<col2 name>" } }
- "stacked-bar-chart": same mapping as grouped-bar-chart — use when part-to-whole breakdown matters
- "scatter-chart": { "x": { "column": "<numeric>" }, "y": { "column": "<numeric>" }, "label": { "column": "<category>" } } — use for correlation between two numeric columns
- "combo-chart": { "name": { "column": "<category>" }, "bar": { "column": "<numeric>" }, "line": { "column": "<numeric>" } } — use when one metric is volume and another is a rate/ratio. Config: { "barLabel": "<col1 name>", "lineLabel": "<col2 name>" }
- "ranked-list": { "label": { "column": "<category>" }, "value": { "column": "<numeric>" } } — use for top-N rankings; simpler than bar-chart
- "waterfall-chart": { "label": { "column": "<category>" }, "value": { "column": "<numeric>" } } — use for sequential cumulative breakdowns
- "treemap": { "name": { "column": "<category>" }, "value": { "column": "<numeric>" } } — use for proportional share when there are many categories

Rules:
- Generate 3–6 widgets total
- Include a "data-table" when there are more than 3 columns
- Prefer "line-chart" or "area-chart" for time-series data (date/month/week columns)
- Prefer "bar-chart" or "donut-chart" for categorical data
- Use "kpi" for single important numeric values — it automatically sums the column across all rows
- CRITICAL: Each chart type supports exactly ONE "value" column. To compare two metrics (e.g. "budgeted vs actual hours"), use "stat-comparison" or "grouped-bar-chart" / "multi-line-chart" — NOT two separate single-series charts
- Prefer "stat-comparison" over two separate KPIs when directly comparing two metrics
- Prefer "multi-line-chart" or "grouped-bar-chart" over separate single-series charts for multi-metric comparisons
- Prefer "ranked-list" over "bar-chart" for simple top-N use cases
- When generating multi-series widgets, always populate config.seriesLabels with human-readable names from the column names
- ALL column values in dataSourceMapping MUST exactly match one of the column names provided
- Return ONLY the JSON array. No preamble, no explanation.`
