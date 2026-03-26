'use client'

import {
  ResponsiveContainer, ScatterChart as RechartsScatter, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import type { WidgetProps, ScatterChartConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const MOCK = [
  { x: 10000, y: 80 }, { x: 25000, y: 150 }, { x: 18000, y: 120 },
  { x: 40000, y: 200 }, { x: 32000, y: 180 }, { x: 15000, y: 95 },
]

export default function ScatterChart({ config }: WidgetProps) {
  const c = config as ScatterChartConfig & { data?: Record<string, unknown>[] }
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
          <RechartsScatter margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="x" type="number" name={c.xLabel ?? 'X'}
              tick={{ fontSize: 10, fill: axisColor }}
            />
            <YAxis
              dataKey="y" type="number" name={c.yLabel ?? 'Y'}
              tick={{ fontSize: 10, fill: axisColor }}
            />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: 11 }} />
            <Scatter data={raw} fill="#6366f1" />
          </RechartsScatter>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
