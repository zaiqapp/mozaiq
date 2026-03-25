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

export type WidgetConfig =
  | KPIConfig | ChartConfig | FunnelConfig | GaugeConfig
  | TableConfig | ProgressConfig | ActivityConfig | TextNoteConfig

// --- v2.3 global data source types ---

export interface GlobalDataSource {
  id: string                           // nanoid
  name: string                         // user-assigned label
  type: 'csv' | 'google-sheets'
  data?: Record<string, unknown>[]     // CSV inline rows
  fileName?: string                    // CSV original filename
  url?: string                         // Google Sheets URL
  gid?: string                         // Sheet tab ID
  refreshInterval?: number             // seconds; 0 = manual
}

export interface AxisMapping {
  column: string        // source column name
  displayName?: string  // optional display label override
}

export interface Widget {
  id: string
  type: WidgetType
  config: WidgetConfig
  dataSourceId?: string                           // references GlobalDataSource.id
  dataSourceMapping?: Record<string, AxisMapping> // fieldKey → { column, displayName? }
  aiInsight?: string
}

export interface DashboardState {
  id?: string
  name: string
  description?: string
  widgets: Widget[]
  layout: LayoutItem[]
  dataSources: GlobalDataSource[]
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
