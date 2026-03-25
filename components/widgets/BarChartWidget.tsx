'use client'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { WidgetProps, ChartConfig } from '@/types/dashboard'
import { generateBarData } from '@/lib/mockData'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const MOCK = generateBarData(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'])

export default function BarChartWidget({ config }: WidgetProps) {
  const c = config as ChartConfig
  const data = (c.data && c.data.length > 0) ? c.data : MOCK
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex h-full flex-col p-4">
      <p className={`mb-2 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey={c.dataKey} fill={c.color ?? '#6366f1'} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
