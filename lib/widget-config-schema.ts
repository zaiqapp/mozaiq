import type { WidgetType } from '@/types/dashboard'

export type ConfigFieldType = 'text' | 'number' | 'color' | 'boolean' | 'select'

export interface ConfigFieldDef {
  key: string            // property path; dot-notation for nested: 'seriesLabels.series1'
  label: string
  type: ConfigFieldType
  options?: { value: string; label: string }[]
  placeholder?: string
  min?: number
  max?: number
  step?: number
  multiline?: boolean    // renders <textarea> instead of <input>
}

export type WidgetConfigSchema = ConfigFieldDef[]

const COMMON: ConfigFieldDef[] = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'description', label: 'Description', type: 'text', multiline: true },
]

export const widgetConfigSchema: Record<WidgetType, WidgetConfigSchema> = {
  kpi: [
    ...COMMON,
    { key: 'prefix', label: 'Prefix', type: 'text', placeholder: '$' },
    { key: 'suffix', label: 'Suffix', type: 'text', placeholder: '%' },
    { key: 'changeLabel', label: 'Change label', type: 'text', placeholder: 'vs last month' },
    { key: 'color', label: 'Accent color', type: 'color' },
  ],
  gauge: [
    ...COMMON,
    { key: 'min', label: 'Min', type: 'number' },
    { key: 'max', label: 'Max', type: 'number' },
    { key: 'unit', label: 'Unit', type: 'text', placeholder: '%' },
    { key: 'color', label: 'Accent color', type: 'color' },
  ],
  'line-chart': [...COMMON, { key: 'color', label: 'Accent color', type: 'color' }],
  'area-chart': [...COMMON, { key: 'color', label: 'Accent color', type: 'color' }],
  'bar-chart': [...COMMON, { key: 'color', label: 'Accent color', type: 'color' }],
  'donut-chart': [...COMMON],
  'funnel-chart': [...COMMON],
  'data-table': [...COMMON],
  'progress-tracker': [...COMMON],
  'activity-feed': [...COMMON],
  'text-note': [
    ...COMMON,
    { key: 'content', label: 'Content', type: 'text', multiline: true },
  ],
  'stat-comparison': [
    ...COMMON,
    { key: 'primaryLabel', label: 'Primary label', type: 'text', placeholder: 'Budgeted' },
    { key: 'secondaryLabel', label: 'Secondary label', type: 'text', placeholder: 'Actual' },
    { key: 'primary', label: 'Primary value', type: 'number' },
    { key: 'secondary', label: 'Secondary value', type: 'number' },
    { key: 'prefix', label: 'Prefix', type: 'text', placeholder: '$' },
    { key: 'suffix', label: 'Suffix', type: 'text', placeholder: 'hrs' },
    { key: 'deltaPositiveIsGood', label: 'Positive delta is good', type: 'boolean' },
  ],
  'multi-line-chart': [
    ...COMMON,
    { key: 'seriesLabels.series1', label: 'Series 1 label', type: 'text' },
    { key: 'seriesLabels.series2', label: 'Series 2 label', type: 'text' },
  ],
  'grouped-bar-chart': [
    ...COMMON,
    { key: 'seriesLabels.series1', label: 'Series 1 label', type: 'text' },
    { key: 'seriesLabels.series2', label: 'Series 2 label', type: 'text' },
  ],
  'stacked-bar-chart': [
    ...COMMON,
    { key: 'seriesLabels.series1', label: 'Series 1 label', type: 'text' },
    { key: 'seriesLabels.series2', label: 'Series 2 label', type: 'text' },
  ],
  'scatter-chart': [
    ...COMMON,
    { key: 'xLabel', label: 'X axis label', type: 'text' },
    { key: 'yLabel', label: 'Y axis label', type: 'text' },
  ],
  'combo-chart': [
    ...COMMON,
    { key: 'barLabel', label: 'Bar series label', type: 'text' },
    { key: 'lineLabel', label: 'Line series label', type: 'text' },
  ],
  'ranked-list': [
    ...COMMON,
    { key: 'color', label: 'Bar color', type: 'color' },
    { key: 'maxItems', label: 'Max items', type: 'number', min: 1, max: 50 },
  ],
  'waterfall-chart': [
    ...COMMON,
    { key: 'positiveColor', label: 'Gain color', type: 'color' },
    { key: 'negativeColor', label: 'Loss color', type: 'color' },
    { key: 'totalColor', label: 'Total bar color', type: 'color' },
  ],
  treemap: [...COMMON],
}
