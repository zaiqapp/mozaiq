'use client'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useDashboardStore } from '@/store/dashboard'
import type { KPIConfig, ChartConfig, GaugeConfig } from '@/types/dashboard'

const COLOR_WIDGET_TYPES = new Set(['kpi', 'line-chart', 'area-chart', 'bar-chart', 'donut-chart', 'gauge'])

export function RightPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const { widgets, selectedWidgetId, updateWidgetConfig } = useDashboardStore()
  const widget = widgets.find((w) => w.id === selectedWidgetId)

  if (collapsed) {
    return (
      <aside className="relative flex w-6 flex-shrink-0 border-l bg-white">
        <button onClick={() => setCollapsed(false)} className="absolute -left-3 top-4 rounded-full border bg-white p-0.5 shadow">
          <ChevronLeft className="h-3 w-3" />
        </button>
      </aside>
    )
  }

  return (
    <aside className="relative flex h-full w-[280px] flex-shrink-0 flex-col border-l bg-white">
      <button onClick={() => setCollapsed(true)} className="absolute -left-3 top-4 rounded-full border bg-white p-0.5 shadow">
        <ChevronRight className="h-3 w-3" />
      </button>

      {!widget ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-xs text-gray-400">Select a widget to edit its properties</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">General</p>
            <label className="mb-1 block text-xs text-gray-600">Title</label>
            <input
              className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
              value={widget.config.title}
              onChange={(e) => updateWidgetConfig(widget.id, { title: e.target.value })}
            />
            <label className="mb-1 mt-2 block text-xs text-gray-600">Description</label>
            <textarea
              className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:border-indigo-400"
              rows={2}
              value={widget.config.description ?? ''}
              onChange={(e) => updateWidgetConfig(widget.id, { description: e.target.value })}
            />
          </div>

          {COLOR_WIDGET_TYPES.has(widget.type) && (
            <div>
              <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">Appearance</p>
              <label className="mb-1 block text-xs text-gray-600">Accent Color</label>
              <input
                type="color"
                className="h-8 w-full cursor-pointer rounded border"
                value={(widget.config as KPIConfig | ChartConfig | GaugeConfig).color ?? '#6366f1'}
                onChange={(e) => updateWidgetConfig(widget.id, { color: e.target.value })}
              />
            </div>
          )}

          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-400">Data</p>
            <p className="text-xs text-gray-400">Live data connections available in v2</p>
          </div>
        </div>
      )}
    </aside>
  )
}
