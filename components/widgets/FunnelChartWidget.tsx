'use client'
import { ResponsiveContainer, FunnelChart, Funnel, LabelList, Tooltip } from 'recharts'
import type { WidgetProps, FunnelConfig } from '@/types/dashboard'

const MOCK = [
  { name: 'Visits', value: 10000, fill: '#6366f1' },
  { name: 'Leads', value: 6200, fill: '#8b5cf6' },
  { name: 'Trials', value: 3100, fill: '#a78bfa' },
  { name: 'Customers', value: 890, fill: '#c4b5fd' },
]

export default function FunnelChartWidget({ config }: WidgetProps) {
  const c = config as FunnelConfig
  const data = (c.data && c.data.length > 0) ? c.data : MOCK

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-2 text-sm font-medium text-[#e5e7eb]">{c.title}</p>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={data} isAnimationActive>
              <LabelList position="right" fill="#9ca3af" stroke="none" dataKey="name" style={{ fontSize: 11 }} />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
