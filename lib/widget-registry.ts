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
  'stat-comparison', 'multi-line-chart', 'grouped-bar-chart', 'stacked-bar-chart',
  'scatter-chart', 'combo-chart', 'ranked-list', 'waterfall-chart', 'treemap',
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
    defaultConfig: {
      title: 'Line Chart', dataKey: 'value',
      data: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 600 },
        { name: 'Mar', value: 500 },
        { name: 'Apr', value: 780 },
      ],
    },
    label: 'Line Chart', icon: TrendingUp, category: 'charts',
  },
  'area-chart': {
    component: AreaChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: {
      title: 'Area Chart', dataKey: 'value',
      data: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 600 },
        { name: 'Mar', value: 500 },
        { name: 'Apr', value: 780 },
      ],
    },
    label: 'Area Chart', icon: TrendingUp, category: 'charts',
  },
  'bar-chart': {
    component: BarChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: {
      title: 'Bar Chart', dataKey: 'value',
      data: [
        { name: 'Jan', value: 400 },
        { name: 'Feb', value: 600 },
        { name: 'Mar', value: 500 },
        { name: 'Apr', value: 780 },
      ],
    },
    label: 'Bar Chart', icon: BarChart, category: 'charts',
  },
  'donut-chart': {
    component: DonutChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: {
      title: 'Donut Chart', dataKey: 'value',
      data: [
        { name: 'Electronics', value: 38 },
        { name: 'Apparel', value: 24 },
        { name: 'Home', value: 19 },
        { name: 'Sports', value: 12 },
      ],
    },
    label: 'Donut Chart', icon: PieChart, category: 'charts',
  },
  'funnel-chart': {
    component: FunnelChartWidget,
    defaultSize: { w: 6, h: 4 },
    defaultConfig: {
      title: 'Funnel Chart',
      data: [
        { name: 'Awareness', value: 1000, fill: '#6366f1' },
        { name: 'Interest', value: 650, fill: '#8b5cf6' },
        { name: 'Decision', value: 280, fill: '#a78bfa' },
        { name: 'Action', value: 120, fill: '#c4b5fd' },
      ],
    },
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
    defaultConfig: {
      title: 'Data Table',
      columns: [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'value', label: 'Value', sortable: true },
      ],
      rows: [
        { name: 'Acme Corp', value: 48000 },
        { name: 'Globex', value: 36000 },
        { name: 'Initech', value: 29000 },
      ],
    },
    label: 'Data Table', icon: Table, category: 'data',
  },
  'progress-tracker': {
    component: ProgressTracker,
    defaultSize: { w: 4, h: 4 },
    defaultConfig: {
      title: 'Progress',
      items: [
        { label: 'Revenue', value: 68, max: 100, color: '#6366f1' },
        { label: 'Users', value: 45, max: 100, color: '#22d3ee' },
        { label: 'Deals', value: 82, max: 100, color: '#4ade80' },
      ],
    },
    label: 'Progress', icon: CheckSquare, category: 'data',
  },
  'activity-feed': {
    component: ActivityFeed,
    defaultSize: { w: 4, h: 4 },
    defaultConfig: {
      title: 'Activity Feed',
      events: [
        { id: '1', label: 'New user signed up', time: '2 min ago' },
        { id: '2', label: 'Invoice #1042 paid', time: '14 min ago' },
        { id: '3', label: 'Deal closed — Acme Corp', time: '1 hr ago' },
      ],
    },
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
      data: [
        { name: 'Jan', series1: 420, series2: 310 },
        { name: 'Feb', series1: 580, series2: 390 },
        { name: 'Mar', series1: 390, series2: 280 },
        { name: 'Apr', series1: 720, series2: 450 },
      ],
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
      data: [
        { name: 'Jan', series1: 420, series2: 310 },
        { name: 'Feb', series1: 580, series2: 390 },
        { name: 'Mar', series1: 390, series2: 280 },
        { name: 'Apr', series1: 720, series2: 450 },
      ],
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
      data: [
        { name: 'Jan', series1: 420, series2: 310 },
        { name: 'Feb', series1: 580, series2: 390 },
        { name: 'Mar', series1: 390, series2: 280 },
        { name: 'Apr', series1: 720, series2: 450 },
      ],
    } satisfies MultiSeriesConfig,
    label: 'Stacked Bar Chart',
    icon: Layers,
    category: 'charts',
  },
  'scatter-chart': {
    component: dynamic(() => import('@/components/widgets/ScatterChart')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 5, h: 3 },
    defaultConfig: {
      title: 'Scatter Chart', xLabel: 'X', yLabel: 'Y',
      data: [
        { x: 10, y: 30 },
        { x: 40, y: 80 },
        { x: 70, y: 50 },
        { x: 50, y: 90 },
      ],
    } satisfies ScatterChartConfig,
    label: 'Scatter Chart',
    icon: ScatterChart,
    category: 'charts',
  },
  'combo-chart': {
    component: dynamic(() => import('@/components/widgets/ComboChart')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 6, h: 3 },
    defaultConfig: {
      title: 'Combo Chart', barLabel: 'Volume', lineLabel: 'Rate',
      data: [
        { name: 'Jan', bar: 400, line: 24 },
        { name: 'Feb', bar: 600, line: 38 },
        { name: 'Mar', bar: 500, line: 29 },
        { name: 'Apr', bar: 780, line: 43 },
      ],
    } satisfies ComboChartConfig,
    label: 'Combo Chart',
    icon: BarChart3,
    category: 'charts',
  },
  'ranked-list': {
    component: dynamic(() => import('@/components/widgets/RankedList')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 4, h: 3 },
    defaultConfig: {
      title: 'Ranked List', color: '#6366f1', maxItems: 10,
      data: [
        { label: 'Acme Corp', value: 48000 },
        { label: 'Globex', value: 36000 },
        { label: 'Initech', value: 27000 },
        { label: 'Umbrella', value: 19000 },
        { label: 'Hooli', value: 14000 },
      ],
    } satisfies RankedListConfig,
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
      data: [
        { label: 'Revenue', value: 50000 },
        { label: 'Upsells', value: 8000 },
        { label: 'Refunds', value: -5000 },
        { label: 'Discounts', value: -3000 },
        { label: 'Net', value: 50000 },
      ],
    } satisfies WaterfallChartConfig,
    label: 'Waterfall Chart',
    icon: GitFork,
    category: 'charts',
  },
  treemap: {
    component: dynamic(() => import('@/components/widgets/Treemap')) as unknown as ComponentType<WidgetProps>,
    defaultSize: { w: 5, h: 3 },
    defaultConfig: {
      title: 'Treemap',
      data: [
        { name: 'Category A', value: 400 },
        { name: 'Category B', value: 300 },
        { name: 'Category C', value: 200 },
        { name: 'Category D', value: 150 },
      ],
    } satisfies TreemapConfig,
    label: 'Treemap',
    icon: Table2,
    category: 'charts',
  },
}
