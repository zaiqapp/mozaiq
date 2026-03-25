'use client'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useState } from 'react'
import { useDashboardStore } from '@/store/dashboard'
import type { KPIConfig, ChartConfig, GaugeConfig } from '@/types/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'

const COLOR_WIDGET_TYPES = new Set(['kpi', 'line-chart', 'area-chart', 'bar-chart', 'donut-chart', 'gauge'])

export function RightPanel() {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const [collapsed, setCollapsed] = useState(false)
  const { widgets, selectedWidgetId, updateWidgetConfig } = useDashboardStore()
  const widget = widgets.find((w) => w.id === selectedWidgetId)

  const asideClass = `border-l ${isDark ? 'border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]' : 'border-gray-200 bg-white'}`
  const collapseButtonClass = `absolute -left-3 top-4 rounded-full border p-0.5 ${
    isDark ? 'border-[rgba(255,255,255,0.1)] bg-[#0a0a0f] text-[#4b5563]' : 'border-gray-200 bg-white text-gray-500'
  }`
  const inputClass = `w-full rounded border px-2 py-1.5 text-sm outline-none ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`

  if (collapsed) {
    return (
      <aside className={`relative flex w-6 flex-shrink-0 ${asideClass}`}>
        <button onClick={() => setCollapsed(false)} className={collapseButtonClass}>
          <ChevronLeft className="h-3 w-3" />
        </button>
      </aside>
    )
  }

  return (
    <aside className={`relative flex h-full w-[280px] flex-shrink-0 flex-col ${asideClass}`}>
      <button onClick={() => setCollapsed(true)} className={collapseButtonClass}>
        <ChevronRight className="h-3 w-3" />
      </button>

      {!widget ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className={`text-center text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>Select a widget to edit its properties</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto p-4">
          <div>
            <p className={`mb-1 text-[10px] uppercase tracking-wider ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>General</p>
            <label htmlFor="widget-title" className={`mb-1 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`}>Title</label>
            <input
              id="widget-title"
              className={inputClass}
              value={widget.config.title}
              onChange={(e) => updateWidgetConfig(widget.id, { title: e.target.value })}
            />
            <label htmlFor="widget-desc" className={`mb-1 mt-2 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`}>Description</label>
            <textarea
              id="widget-desc"
              className={inputClass}
              rows={2}
              value={widget.config.description ?? ''}
              onChange={(e) => updateWidgetConfig(widget.id, { description: e.target.value })}
            />
          </div>

          {widget.type === 'text-note' && (
            <div>
              <p className={`mb-1 text-[10px] uppercase tracking-wider ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>Content</p>
              <label htmlFor="widget-content" className={`mb-1 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`}>Note text</label>
              <textarea
                id="widget-content"
                className={inputClass}
                rows={5}
                value={(widget.config as { content?: string }).content ?? ''}
                onChange={(e) => updateWidgetConfig(widget.id, { content: e.target.value })}
              />
            </div>
          )}

          {COLOR_WIDGET_TYPES.has(widget.type) && (
            <div>
              <p className={`mb-1 text-[10px] uppercase tracking-wider ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>Appearance</p>
              <label className={`mb-1 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`}>Accent Color</label>
              <input
                type="color"
                className={`h-8 w-full cursor-pointer rounded border ${isDark ? 'border-[rgba(255,255,255,0.1)]' : 'border-gray-200'}`}
                value={(widget.config as KPIConfig | ChartConfig | GaugeConfig).color ?? '#6366f1'}
                onChange={(e) => updateWidgetConfig(widget.id, { color: e.target.value })}
              />
            </div>
          )}

          <div>
            <p className={`mb-1 text-[10px] uppercase tracking-wider ${isDark ? 'text-[#374151]' : 'text-gray-400'}`}>Data</p>
            <p className={`text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>Live data connections available in v2</p>
          </div>
        </div>
      )}
    </aside>
  )
}
