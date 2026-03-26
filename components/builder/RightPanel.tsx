'use client'
import React, { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'
import { WidgetConfigPanel } from './WidgetConfigPanel'
import { WidgetDataPanel } from './data-editors/WidgetDataPanel'

export function RightPanel() {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const [collapsed, setCollapsed] = useState(false)
  const [activeTab, setActiveTab] = useState<'properties' | 'data'>('properties')
  const { widgets, selectedWidgetId } = useDashboardStore()
  const widget = widgets.find((w) => w.id === selectedWidgetId)

  const asideClass = `border-l ${
    isDark
      ? 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] backdrop-blur-[12px]'
      : 'border-gray-200 bg-white'
  }`
  const collapseButtonClass = `absolute left-1 top-2 rounded-full border p-0.5 ${
    isDark ? 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] backdrop-blur-[8px] text-[#4b5563]' : 'border-gray-200 bg-white text-gray-500'
  }`
  const asideStyle = isDark ? { boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)' } as React.CSSProperties : undefined

  if (collapsed) {
    return (
      <aside className={`relative flex w-6 flex-shrink-0 font-sans ${asideClass}`} style={asideStyle}>
        <button onClick={() => setCollapsed(false)} className={collapseButtonClass}>
          <ChevronLeft className="h-3 w-3" />
        </button>
      </aside>
    )
  }

  return (
    <aside className={`relative flex h-full w-[280px] flex-shrink-0 flex-col font-sans ${asideClass}`} style={asideStyle}>
      <button onClick={() => setCollapsed(true)} className={collapseButtonClass}>
        <ChevronRight className="h-3 w-3" />
      </button>

      {!widget ? (
        <div className="flex flex-1 items-center justify-center p-4">
          <p className={`text-center text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
            Select a widget to edit its properties
          </p>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Tab bar */}
          <div className={`flex border-b ${isDark ? 'border-[rgba(255,255,255,0.08)]' : 'border-gray-200'}`}>
            {(['properties', 'data'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? isDark
                      ? 'border-b-2 border-cyan-500 text-cyan-400'
                      : 'border-b-2 border-indigo-500 text-indigo-600'
                    : isDark
                    ? 'text-[#4b5563] hover:text-[#6b7280]'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'properties' ? 'Properties' : 'Data'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'properties' ? (
              <WidgetConfigPanel widget={widget} />
            ) : (
              <div className="p-4">
                <WidgetDataPanel key={widget.id} widget={widget} />
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
