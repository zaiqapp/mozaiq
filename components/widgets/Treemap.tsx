'use client'

import { ResponsiveContainer, Treemap as RechartsTreemap, Tooltip } from 'recharts'
import type { WidgetProps, TreemapConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const PALETTE = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#f43f5e']

const MOCK = [
  { name: 'Client A', value: 48000 },
  { name: 'Client B', value: 32000 },
  { name: 'Client C', value: 27000 },
  { name: 'Client D', value: 19000 },
  { name: 'Client E', value: 14000 },
]

function CustomCell(props: Record<string, unknown>) {
  const { x, y, width, height, index, name } = props as {
    x: number; y: number; width: number; height: number; index: number; name: string
  }
  const fill = PALETTE[index % PALETTE.length]
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="none" rx={2} />
      {width > 40 && height > 20 && (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={10}>
          {name}
        </text>
      )}
    </g>
  )
}

export default function Treemap({ config }: WidgetProps) {
  const c = config as TreemapConfig & { data?: Record<string, unknown>[] }
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const raw = c.data && c.data.length > 0 ? c.data : MOCK

  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {c.title && (
        <p className={`text-xs font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>{c.title}</p>
      )}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsTreemap
            data={raw}
            dataKey="value"
            nameKey="name"
            content={<CustomCell />}
          >
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [(v as number).toLocaleString(), 'Value']} />
          </RechartsTreemap>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
