import { widgetConfigSchema } from '../widget-config-schema'
import type { WidgetType } from '@/types/dashboard'

const ALL_TYPES: WidgetType[] = [
  'kpi', 'line-chart', 'area-chart', 'bar-chart', 'donut-chart',
  'funnel-chart', 'gauge', 'data-table', 'progress-tracker', 'activity-feed', 'text-note',
  'stat-comparison', 'multi-line-chart', 'grouped-bar-chart', 'stacked-bar-chart',
  'scatter-chart', 'combo-chart', 'ranked-list', 'waterfall-chart', 'treemap',
]

describe('widgetConfigSchema', () => {
  it('has a non-empty entry for every widget type', () => {
    for (const type of ALL_TYPES) {
      expect(widgetConfigSchema[type], `missing schema for "${type}"`).toBeDefined()
      expect(widgetConfigSchema[type].length, `empty schema for "${type}"`).toBeGreaterThan(0)
    }
  })

  it('every schema has title as its first field', () => {
    for (const type of ALL_TYPES) {
      expect(widgetConfigSchema[type][0]?.key, `"${type}" must start with title`).toBe('title')
    }
  })
})
