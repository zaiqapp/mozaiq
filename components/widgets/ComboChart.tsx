'use client'

import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'
import type { WidgetProps, ComboChartConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const MOCK = [
  { name: 'Acme', bar: 48000, line: 12.4 },
  { name: 'Globex', bar: 32000, line: 8.1 },
  { name: 'Initech', bar: 27000, line: 15.2 },
  { name: 'Umbrella', bar: 19000, line: 6.7 },
]

export default function ComboChart({ config }: WidgetProps) {
  const c = config as ComboChartConfig & { data?: Record<string, unknown>[] }
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const raw = c.data && c.data.length > 0 ? c.data : MOCK
  const axisColor = isDark ? '#374151' : '#9ca3af'
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6'

  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {c.title && (
        <p className={`text-xs font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>{c.title}</p>
      )}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={raw} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: axisColor }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: axisColor }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar yAxisId="left" dataKey="bar" name={c.barLabel ?? 'Volume'} fill="#6366f1" />
            <Line yAxisId="right" type="monotone" dataKey="line" name={c.lineLabel ?? 'Rate'} stroke="#f59e0b" strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
