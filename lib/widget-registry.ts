import type { ComponentType } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  BarChart2, TrendingUp, BarChart, PieChart, Filter,
  Activity, Table, CheckSquare, Zap, FileText,
  ArrowLeftRight, Layers, BarChart3, List, GitFork, Table2, ScatterChart,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import type {
  WidgetType, WidgetConfig, WidgetProps,
  StatComparisonConfig, MultiSeriesConfig, ScatterChartConfig,
  ComboChartConfig, RankedListConfig, WaterfallChartConfig, TreemapConfig,
} from '@/types/dashboard'

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

const KPICard = dynamic(() => import('@/components/widgets/KPICard')) as unknown as ComponentType<WidgetProps>
const LineChartWidget = dynamic(() => import('@/components/widgets/LineChartWidget')) as unknown as ComponentType<WidgetProps>
const AreaChartWidget = dynamic(() => import('@/components/widgets/AreaChartWidget')) as unknown as ComponentType<WidgetProps>
const BarChartWidget = dynamic(() => import('@/components/widgets/BarChartWidget')) as unknown as ComponentType<WidgetProps>
const DonutChartWidget = dynamic(() => import('@/components/widgets/DonutChartWidget')) as unknown as ComponentType<WidgetProps>
const FunnelChartWidget = dynamic(() => import('@/components/widgets/FunnelChartWidget')) as unknown as ComponentType<WidgetProps>
const GaugeWidget = dynamic(() => import('@/components/widgets/GaugeWidget')) as unknown as ComponentType<WidgetProps>
const DataTableWidget = dynamic(() => import('@/components/widgets/DataTableWidget')) as unknown as ComponentType<WidgetProps>
const ProgressTracker = dynamic(() => import('@/components/widgets/ProgressTracker')) as unknown as ComponentType<WidgetProps>
const ActivityFeed = dynamic(() => import('@/components/widgets/ActivityFeed')) as unknown as ComponentType<WidgetProps>
const TextNoteWidget = dynamic(() => import('@/components/widgets/TextNoteWidget')) as unknown as ComponentType<WidgetProps>

export const widgetRegistry: Record<WidgetType, WidgetRegistryEntry> = {
  'kpi': {
    component: KPICard,
    defaultSize: { w: 3, h: 2 },
    defaultConfig: { title: 'KPI', value: 0, change: 0, changeLabel: 'vs last period' },
    label: 'KPI Card', icon: BarChart2, category: 'metrics',
  },
  'line-chart': {
    component: LineChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Line Chart', dataKey: 'value' },
    label: 'Line Chart', icon: TrendingUp, category: 'charts',
  },
  'area-chart': {
    component: AreaChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Area Chart', dataKey: 'value' },
    label: 'Area Chart', icon: TrendingUp, category: 'charts',
  },
  'bar-chart': {
    component: BarChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Bar Chart', dataKey: 'value' },
    label: 'Bar Chart', icon: BarChart, category: 'charts',
  },
  'donut-chart': {
    component: DonutChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Donut Chart', dataKey: 'value' },
    label: 'Donut Chart', icon: PieChart, category: 'charts',
  },
  'funnel-chart': {
    component: FunnelChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: { title: 'Funnel Chart' },
    label: 'Funnel Chart', icon: Filter, category: 'charts',
  },
  'gauge': {
    component: GaugeWidget,
    defaultSize: { w: 3, h: 3 },
    defaultConfig: { title: 'Gauge', value: 75, max: 100, unit: '%' },
    label: 'Gauge', icon: Activity, category: 'metrics',
  },
  'data-table': {
    component: DataTableWidget,
    defaultSize: { w: 12, h: 4 },
    defaultConfig: { title: 'Data Table', columns: [], rows: [] },
    label: 'Data Table', icon: Table, category: 'data',
  },
  'progress-tracker': {
    component: ProgressTracker,
    defaultSize: { w: 4, h: 4 },
    defaultConfig: { title: 'Progress', items: [] },
    label: 'Progress', icon: CheckSquare, category: 'data',
  },
  'activity-feed': {
    component: ActivityFeed,
    defaultSize: { w: 4, h: 4 },
    defaultConfig: { title: 'Activity Feed', events: [] },
    label: 'Activity Feed', icon: Zap, category: 'misc',
  },
  'text-note': {
    component: TextNoteWidget,
    defaultSize: { w: 6, h: 2 },
    defaultConfig: { title: 'Note', content: '' },
    label: 'Text / Note', icon: FileText, category: 'misc',
  },
  'stat-comparison': {
    component: dynamic(() => import('@/components/widgets/StatComparison')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 4, h: 2 },
    defaultConfig: {
      title: 'Comparison',
      primaryLabel: 'Primary',
      secondaryLabel: 'Secondary',
      primary: 0,
      secondary: 0,
      prefix: '',
      suffix: '',
      deltaPositiveIsGood: true,
    } satisfies StatComparisonConfig,
    label: 'Stat Comparison',
    icon: ArrowLeftRight,
    category: 'metrics',
  },
  'multi-line-chart': {
    component: dynamic(() => import('@/components/widgets/MultiLineChart')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 6, h: 3 },
    defaultConfig: {
      title: 'Multi-Line Chart',
      seriesLabels: { series1: 'Series 1', series2: 'Series 2' },
    } satisfies MultiSeriesConfig,
    label: 'Multi-Line Chart',
    icon: TrendingUp,
    category: 'charts',
  },
  'grouped-bar-chart': {
    component: dynamic(() => import('@/components/widgets/GroupedBarChart')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 6, h: 3 },
    defaultConfig: {
      title: 'Grouped Bar Chart',
      seriesLabels: { series1: 'Series 1', series2: 'Series 2' },
    } satisfies MultiSeriesConfig,
    label: 'Grouped Bar Chart',
    icon: BarChart2,
    category: 'charts',
  },
  'stacked-bar-chart': {
    component: dynamic(() => import('@/components/widgets/StackedBarChart')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 6, h: 3 },
    defaultConfig: {
      title: 'Stacked Bar Chart',
      seriesLabels: { series1: 'Series 1', series2: 'Series 2' },
    } satisfies MultiSeriesConfig,
    label: 'Stacked Bar Chart',
    icon: Layers,
    category: 'charts',
  },
  'scatter-chart': {
    component: dynamic(() => import('@/components/widgets/ScatterChart')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 5, h: 3 },
    defaultConfig: { title: 'Scatter Chart', xLabel: 'X', yLabel: 'Y' } satisfies ScatterChartConfig,
    label: 'Scatter Chart',
    icon: ScatterChart,
    category: 'charts',
  },
  'combo-chart': {
    component: dynamic(() => import('@/components/widgets/ComboChart')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 6, h: 3 },
    defaultConfig: { title: 'Combo Chart', barLabel: 'Volume', lineLabel: 'Rate' } satisfies ComboChartConfig,
    label: 'Combo Chart',
    icon: BarChart3,
    category: 'charts',
  },
  'ranked-list': {
    component: dynamic(() => import('@/components/widgets/RankedList')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 4, h: 3 },
    defaultConfig: { title: 'Ranked List', color: '#6366f1', maxItems: 10 } satisfies RankedListConfig,
    label: 'Ranked List',
    icon: List,
    category: 'data',
  },
  'waterfall-chart': {
    component: dynamic(() => import('@/components/widgets/WaterfallChart')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 6, h: 3 },
    defaultConfig: {
      title: 'Waterfall Chart',
      positiveColor: '#10b981',
      negativeColor: '#ef4444',
      totalColor: '#6366f1',
    } satisfies WaterfallChartConfig,
    label: 'Waterfall Chart',
    icon: GitFork,
    category: 'charts',
  },
  treemap: {
    component: dynamic(() => import('@/components/widgets/Treemap')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 5, h: 3 },
    defaultConfig: { title: 'Treemap' } satisfies TreemapConfig,
    label: 'Treemap',
    icon: Table2,
    category: 'charts',
  },
}
