'use client'
import type { WidgetProps, ActivityConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export default function ActivityFeed({ config }: WidgetProps) {
  const c = config as ActivityConfig
  const events = c.events ?? []
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex h-full flex-col p-4">
      <p className={`mb-3 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <div className="flex flex-col gap-2 overflow-auto">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-2">
            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
            <div className="min-w-0">
              <p className={`truncate text-xs ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{event.label}</p>
              <p className={`text-[10px] ${isDark ? 'text-[#6b7280]' : 'text-gray-400'}`}>{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
