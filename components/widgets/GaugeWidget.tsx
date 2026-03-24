'use client'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import type { WidgetProps, GaugeConfig } from '@/types/dashboard'

export default function GaugeWidget({ config }: WidgetProps) {
  const c = config as GaugeConfig
  const min = c.min ?? 0
  const max = c.max ?? 100
  const pct = Math.round(((c.value - min) / (max - min)) * 100)
  const data = [{ value: pct, fill: c.color ?? '#6366f1' }]

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <p className="mb-1 text-sm font-medium text-gray-700">{c.title}</p>
      <div className="relative h-32 w-32">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
            startAngle={180} endAngle={0} data={data}
          >
            <RadialBar dataKey="value" cornerRadius={4} background={{ fill: '#f3f4f6' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pt-6">
          <span className="text-xl font-bold text-gray-900">{c.value}{c.unit}</span>
        </div>
      </div>
    </div>
  )
}
