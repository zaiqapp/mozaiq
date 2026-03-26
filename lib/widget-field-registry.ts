import type { WidgetType } from '@/types/dashboard'

export interface WidgetFieldDef {
  key: string
  label: string
  type: 'string' | 'number' | 'array-of-objects'
  required: boolean
  description: string
}

export const widgetFieldRegistry: Record<WidgetType, WidgetFieldDef[]> = {
  'kpi': [
    { key: 'value', label: 'Value', type: 'number', required: true, description: 'Primary metric value' },
    { key: 'change', label: 'Change %', type: 'number', required: false, description: 'Percentage change vs prior period' },
  ],
  'line-chart':   [{ key: 'data', label: 'Data rows', type: 'array-of-objects', required: true, description: 'Array with name + numeric value columns' }],
  'area-chart':   [{ key: 'data', label: 'Data rows', type: 'array-of-objects', required: true, description: 'Array with name + numeric value columns' }],
  'bar-chart':    [{ key: 'data', label: 'Data rows', type: 'array-of-objects', required: true, description: 'Array with name + numeric value columns' }],
  'donut-chart':  [{ key: 'data', label: 'Data rows', type: 'array-of-objects', required: true, description: 'Array with name + numeric value columns' }],
  'funnel-chart': [{ key: 'data', label: 'Funnel stages', type: 'array-of-objects', required: true, description: 'Array with stage name + count value' }],
  'gauge':        [{ key: 'value', label: 'Value', type: 'number', required: true, description: 'Current gauge reading' }],
  'data-table':   [{ key: 'rows', label: 'Table rows', type: 'array-of-objects', required: true, description: 'Array of row objects' }],
  'progress-tracker': [{ key: 'items', label: 'Progress items', type: 'array-of-objects', required: true, description: 'Array with label, value, max fields' }],
  'activity-feed': [{ key: 'events', label: 'Events', type: 'array-of-objects', required: true, description: 'Array with label + time fields' }],
  'text-note':    [{ key: 'content', label: 'Content', type: 'string', required: true, description: 'Text content from a single cell value' }],
  'stat-comparison': [
    { key: 'primary', label: 'Primary value', type: 'number', required: true, description: 'Maps to a numeric column. Value shown is the sum across all rows.' },
    { key: 'secondary', label: 'Secondary value', type: 'number', required: true, description: 'Maps to a numeric column. Value shown is the sum across all rows.' },
  ],
  'multi-line-chart': [
    { key: 'data', label: 'Chart data', type: 'array-of-objects', required: true,
      description: 'Map: name → x-axis col, series1 → first line, series2 → second line (optional)' },
  ],
  'grouped-bar-chart': [
    { key: 'data', label: 'Chart data', type: 'array-of-objects', required: true,
      description: 'Map: name → category col, series1 → first bars, series2 → second bars (optional)' },
  ],
  'stacked-bar-chart': [
    { key: 'data', label: 'Chart data', type: 'array-of-objects', required: true,
      description: 'Map: name → category col, series1 → first stack, series2 → second stack (optional)' },
  ],
  'scatter-chart': [
    { key: 'data', label: 'Chart data', type: 'array-of-objects', required: true,
      description: 'Map: x → numeric col, y → numeric col, label → category col (optional tooltip label)' },
  ],
  'combo-chart': [
    { key: 'data', label: 'Chart data', type: 'array-of-objects', required: true,
      description: 'Map: name → category col, bar → numeric col, line → numeric col' },
  ],
  'ranked-list': [
    { key: 'data', label: 'List data', type: 'array-of-objects', required: true,
      description: 'Map: label → category col, value → numeric col. Auto-sorted descending.' },
  ],
  'waterfall-chart': [
    { key: 'data', label: 'Chart data', type: 'array-of-objects', required: true,
      description: 'Map: label → category col, value → numeric col. Positive = gain, negative = loss.' },
  ],
  'treemap': [
    { key: 'data', label: 'Chart data', type: 'array-of-objects', required: true,
      description: 'Map: name → category col, value → numeric col. Area proportional to value.' },
  ],
}
