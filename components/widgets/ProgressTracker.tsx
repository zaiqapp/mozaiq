'use client'
import type { WidgetProps, ProgressConfig } from '@/types/dashboard'

const MOCK_ITEMS = [
  { label: 'Item A', value: 70, max: 100, color: '#6366f1' },
  { label: 'Item B', value: 45, max: 100, color: '#8b5cf6' },
]

export default function ProgressTracker({ config }: WidgetProps) {
  const c = config as ProgressConfig
  const items = c.items.length ? c.items : MOCK_ITEMS

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-3 text-sm font-medium text-gray-700">{c.title}</p>
      <div className="flex flex-col gap-3 overflow-auto">
        {items.map((item, i) => {
          const pct = Math.round((item.value / item.max) * 100)
          return (
            <div key={i}>
              <div className="mb-1 flex justify-between text-xs text-gray-600">
                <span>{item.label}</span>
                <span className="text-gray-400">{item.value}/{item.max} ({pct}%)</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-gray-100">
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
