'use client'

import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { WidgetProps, MultiSeriesConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const SERIES_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']
const SERIES_KEYS = ['series1', 'series2'] as const

const MOCK = [
  { name: 'Jan', series1: 40, series2: 30 },
  { name: 'Feb', series1: 55, series2: 40 },
  { name: 'Mar', series1: 45, series2: 50 },
  { name: 'Apr', series1: 70, series2: 45 },
  { name: 'May', series1: 65, series2: 60 },
]

export default function MultiLineChart({ config }: WidgetProps) {
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
          <LineChart data={raw} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} />
            <YAxis tick={{ fontSize: 10, fill: axisColor }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {activeKeys.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                name={c.seriesLabels?.[key] ?? key}
                stroke={SERIES_COLORS[i]}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
