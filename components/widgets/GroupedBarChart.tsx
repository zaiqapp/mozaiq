'use client'

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { WidgetProps, MultiSeriesConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const SERIES_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']
const SERIES_KEYS = ['series1', 'series2'] as const

const MOCK = [
  { name: 'Acme', series1: 48000, series2: 42000 },
  { name: 'Globex', series1: 32000, series2: 36000 },
  { name: 'Initech', series1: 27000, series2: 25000 },
  { name: 'Umbrella', series1: 19000, series2: 21000 },
]

export default function GroupedBarChart({ config }: WidgetProps) {
  const c = config as MultiSeriesConfig & { data?: Record<string, unknown>[] }
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const raw = c.data && c.data.length > 0 ? c.data : MOCK
  const activeKeys = SERIES_KEYS.filter((k) => raw[0]?.[k] !== undefined)

  const axisColor = isDark ? '#374151' : '#9ca3af'
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6'

  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {c.title && (
        <p className={`text-xs font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>{c.title}</p>
      )}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={raw} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} />
            <YAxis tick={{ fontSize: 10, fill: axisColor }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {activeKeys.map((key, i) => (
              <Bar
                key={key}
                dataKey={key}
                name={c.seriesLabels?.[key] ?? key}
                fill={SERIES_COLORS[i]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
