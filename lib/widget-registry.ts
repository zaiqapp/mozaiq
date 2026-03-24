import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart2, TrendingUp, BarChart, PieChart, Filter,
  Activity, Table, CheckSquare, Zap, FileText,
} from 'lucide-react'
import type { WidgetType, WidgetConfig, WidgetProps } from '@/types/dashboard'

export interface WidgetRegistryEntry {
  component: ComponentType<WidgetProps>
  defaultSize: { w: number; h: number }
  defaultConfig: WidgetConfig
  label: string
  icon: LucideIcon
  category: 'metrics' | 'charts' | 'data' | 'misc'
}

export const WIDGET_TYPES: WidgetType[] = [
  'kpi', 'line-chart', 'area-chart', 'bar-chart', 'donut-chart',
  'funnel-chart', 'gauge', 'data-table', 'progress-tracker',
  'activity-feed', 'text-note',
]

// Placeholder stub - will be replaced with real components in Task 9
const Stub: ComponentType<WidgetProps> = () => null

export const widgetRegistry: Record<WidgetType, WidgetRegistryEntry> = {
  'kpi': {
    component: Stub,
    defaultSize: { w: 3, h: 2 },
    defaultConfig: { title: 'KPI', value: 0, change: 0, changeLabel: 'vs last period' } as WidgetConfig,
    label: 'KPI Card', icon: BarChart2, category: 'metrics',
  },
  'line-chart': {
    component: Stub,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Line Chart', dataKey: 'value' } as WidgetConfig,
    label: 'Line Chart', icon: TrendingUp, category: 'charts',
  },
  'area-chart': {
    component: Stub,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Area Chart', dataKey: 'value' } as WidgetConfig,
    label: 'Area Chart', icon: TrendingUp, category: 'charts',
  },
  'bar-chart': {
    component: Stub,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Bar Chart', dataKey: 'value' } as WidgetConfig,
    label: 'Bar Chart', icon: BarChart, category: 'charts',
  },
  'donut-chart': {
    component: Stub,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Donut Chart', dataKey: 'value' } as WidgetConfig,
    label: 'Donut Chart', icon: PieChart, category: 'charts',
  },
  'funnel-chart': {
    component: Stub,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Funnel Chart' } as WidgetConfig,
    label: 'Funnel Chart', icon: Filter, category: 'charts',
  },
  'gauge': {
    component: Stub,
    defaultSize: { w: 3, h: 3 },
    defaultConfig: { title: 'Gauge', value: 75, max: 100, unit: '%' } as WidgetConfig,
    label: 'Gauge', icon: Activity, category: 'metrics',
  },
  'data-table': {
    component: Stub,
    defaultSize: { w: 12, h: 4 },
    defaultConfig: { title: 'Data Table', columns: [], rows: [] } as WidgetConfig,
    label: 'Data Table', icon: Table, category: 'data',
  },
  'progress-tracker': {
    component: Stub,
    defaultSize: { w: 4, h: 4 },
    defaultConfig: { title: 'Progress', items: [] } as WidgetConfig,
    label: 'Progress', icon: CheckSquare, category: 'data',
  },
  'activity-feed': {
    component: Stub,
    defaultSize: { w: 4, h: 4 },
    defaultConfig: { title: 'Activity Feed', events: [] } as WidgetConfig,
    label: 'Activity Feed', icon: Zap, category: 'misc',
  },
  'text-note': {
    component: Stub,
    defaultSize: { w: 6, h: 2 },
    defaultConfig: { title: 'Note', content: '' } as WidgetConfig,
    label: 'Text / Note', icon: FileText, category: 'misc',
  },
}
