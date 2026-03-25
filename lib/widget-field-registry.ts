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
}
