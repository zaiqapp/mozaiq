'use client'

import type { WidgetProps, RankedListConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const MOCK = [
  { label: 'Acme Corp', value: 48000 },
  { label: 'Globex', value: 36000 },
  { label: 'Initech', value: 27000 },
  { label: 'Umbrella', value: 19000 },
  { label: 'Hooli', value: 14000 },
]

export default function RankedList({ config }: WidgetProps) {
  const c = config as RankedListConfig & { data?: Record<string, unknown>[] }
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const raw = c.data && c.data.length > 0 ? c.data : MOCK
  const sorted = [...raw]
    .sort((a, b) => Number(b.value ?? 0) - Number(a.value ?? 0))
    .slice(0, c.maxItems ?? 10)

  const max = Number(sorted[0]?.value ?? 1)
  const barColor = c.color ?? '#6366f1'
  const mutedText = isDark ? 'text-[#4b5563]' : 'text-gray-500'
  const boldText = isDark ? 'text-[#9ca3af]' : 'text-gray-800'

  return (
    <div className="w-full h-full flex flex-col gap-1 p-3 overflow-y-auto">
      {c.title && (
        <p className={`text-xs font-medium mb-1 ${mutedText}`}>{c.title}</p>
      )}
      {sorted.map((row, i) => {
        const val = Number(row.value ?? 0)
        const pct = max > 0 ? (val / max) * 100 : 0
        return (
          <div key={i} className="flex items-center gap-2">
            <span className={`text-[10px] w-4 text-right ${mutedText}`}>{i + 1}</span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 h-2 rounded overflow-hidden bg-muted/30">
                <div
                  className="h-full rounded transition-all"
                  style={{ width: `${pct}%`, background: barColor }}
                />
              </div>
              <span className={`text-[10px] whitespace-nowrap ${mutedText}`}>
                {String(row.label ?? '')}
              </span>
            </div>
            <span className={`text-xs font-semibold ${boldText}`}>
              {val.toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}
