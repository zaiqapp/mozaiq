'use client'
import type { WidgetProps, ActivityConfig } from '@/types/dashboard'
import { ACTIVITY_EVENTS } from '@/lib/mockData'

export default function ActivityFeed({ config }: WidgetProps) {
  const c = config as ActivityConfig
  const events = c.events.length ? c.events : ACTIVITY_EVENTS

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">{c.title}</p>
      <div className="flex flex-col gap-2 overflow-auto">
        {events.map((event) => (
          <div key={event.id} className="flex items-start gap-2">
            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-700">{event.label}</p>
              <p className="text-[10px] text-gray-400">{event.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
