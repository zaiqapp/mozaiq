import type { LayoutItem } from 'react-grid-layout'

export type WidgetType =
  | 'kpi' | 'line-chart' | 'area-chart' | 'bar-chart' | 'donut-chart'
  | 'funnel-chart' | 'gauge' | 'data-table' | 'progress-tracker'
  | 'activity-feed' | 'text-note'

export type TemplateKey = 'analytics' | 'inventory' | 'purchasing'

export interface BaseWidgetConfig { title: string; description?: string }

export interface KPIConfig extends BaseWidgetConfig {
  value: string | number
  change: number
  changeLabel: string
  prefix?: string
  suffix?: string
  color?: string
}

export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: unknown
}

export interface ChartConfig extends BaseWidgetConfig {
  dataKey: string
  color?: string
  data?: ChartDataPoint[]
}

export interface FunnelConfig extends BaseWidgetConfig {
  data?: { name: string; value: number; fill?: string }[]
}

export interface GaugeConfig extends BaseWidgetConfig {
  value: number
  min?: number
  max?: number
  unit?: string
  color?: string
}

export interface TableConfig extends BaseWidgetConfig {
  columns: { key: string; label: string; sortable?: boolean }[]
  rows: Record<string, unknown>[]
}

export interface ProgressConfig extends BaseWidgetConfig {
  items: { label: string; value: number; max: number; color?: string }[]
}

export interface ActivityConfig extends BaseWidgetConfig {
  events: { id: string; label: string; time: string; icon?: string }[]
}

export interface TextNoteConfig extends BaseWidgetConfig {
  content: string
}

export type DataSourceType = 'csv' | 'google-sheets'

export interface DataSource {
  type: DataSourceType
  // CSV snapshot
  data?: Record<string, unknown>[]
  fileName?: string
  // Google Sheets live
  url?: string
  gid?: string              // optional numeric sheet tab ID for multi-tab sheets
  refreshInterval?: number  // seconds; default 60, minimum 10 (enforced in useDataSource); 0 = manual only
  // Shared
  mapping?: Record<string, string>  // widgetField → columnName
  error?: string                    // runtime-only; stripped before persisting
}

export type WidgetConfig =
  | KPIConfig | ChartConfig | FunnelConfig | GaugeConfig
  | TableConfig | ProgressConfig | ActivityConfig | TextNoteConfig

export interface Widget {
  id: string
  type: WidgetType
  config: WidgetConfig
  dataSource?: DataSource
  aiInsight?: string
}

export interface DashboardState {
  id?: string
  name: string
  description?: string
  widgets: Widget[]
  layout: LayoutItem[]
  isDirty: boolean
  isSaving: boolean
  isGenerating: boolean
  selectedWidgetId: string | null
}

export interface WidgetProps {
  config: WidgetConfig
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  isReadOnly?: boolean
}
