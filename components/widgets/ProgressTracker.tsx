'use client'
import type { WidgetProps, ProgressConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export default function ProgressTracker({ config }: WidgetProps) {
  const c = config as ProgressConfig
  const items = c.items ?? []
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex h-full flex-col p-4">
      <p className={`mb-3 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <div className="flex flex-col gap-3 overflow-auto">
        {items.map((item, i) => {
          const pct = Math.round((item.value / item.max) * 100)
          return (
            <div key={i}>
              <div className={`mb-1 flex justify-between text-xs ${isDark ? 'text-[#9ca3af]' : 'text-gray-500'}`}>
                <span>{item.label}</span>
                <span className={isDark ? 'text-[#6b7280]' : 'text-gray-400'}>{item.value}/{item.max} ({pct}%)</span>
              </div>
              <div className={`h-1.5 w-full rounded-full ${isDark ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-gray-100'}`}>
                <div
                  className="h-1.5 rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: item.color ?? '#6366f1' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
