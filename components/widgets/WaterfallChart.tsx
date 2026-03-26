'use client'

import {
  ResponsiveContainer, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import type { WidgetProps, WaterfallChartConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const MOCK = [
  { label: 'Revenue', value: 50000 },
  { label: 'Upsells', value: 8000 },
  { label: 'Refunds', value: -5000 },
  { label: 'Discounts', value: -3000 },
  { label: 'Net', value: 50000 },
]

interface ProcessedRow {
  label: string
  base: number
  delta: number
  positive: boolean
}

function preprocess(rows: Record<string, unknown>[]): ProcessedRow[] {
  let running = 0
  return rows.map((row, i) => {
    const delta = Number(row.value ?? 0)
    const base = i === 0 ? 0 : running
    running += delta
    return { label: String(row.label ?? ''), base, delta, positive: delta >= 0 }
  })
}

export default function WaterfallChart({ config }: WidgetProps) {
  const c = config as WaterfallChartConfig & { data?: Record<string, unknown>[] }
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const raw = c.data && c.data.length > 0 ? c.data : MOCK
  const processed = preprocess(raw)

  const positiveColor = c.positiveColor ?? '#10b981'
  const negativeColor = c.negativeColor ?? '#ef4444'
  const totalColor = c.totalColor ?? '#6366f1'
  const axisColor = isDark ? '#374151' : '#9ca3af'
  const gridColor = isDark ? 'rgba(255,255,255,0.04)' : '#f3f4f6'
  const lastIndex = processed.length - 1

  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {c.title && (
        <p className={`text-xs font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>{c.title}</p>
      )}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={processed} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: axisColor }} />
            <YAxis tick={{ fontSize: 10, fill: axisColor }} />
            <Tooltip
              contentStyle={{ fontSize: 11 }}
              formatter={(value, name) =>
                name === 'base' ? null : [(value as number).toLocaleString(), 'Value']
              }
            />
            <Bar dataKey="base" stackId="w" fill="transparent" />
            <Bar dataKey="delta" stackId="w">
              {processed.map((entry, i) => (
                <Cell
                  key={i}
                  fill={i === lastIndex ? totalColor : entry.positive ? positiveColor : negativeColor}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
