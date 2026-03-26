'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { GridLayoutProps, LayoutItem } from 'react-grid-layout'
import type { Widget, GlobalDataSource } from '@/types/dashboard'
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'
import { BuilderThemeProvider, useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
import { DashboardInsightsDrawer } from '@/components/builder/DashboardInsightsDrawer'
import { useDashboardStore } from '@/store/dashboard'
import Link from 'next/link'
import 'react-grid-layout/css/styles.css'

const GridLayout = dynamic(
  () => import('react-grid-layout').then((m) => m.GridLayout),
  { ssr: false }
) as ComponentType<GridLayoutProps>

interface Props {
  id: string
  name: string
  widgets: Widget[]
  layout: LayoutItem[]
  dataSources?: GlobalDataSource[]
}

function ViewPageInner({ id, name, widgets, layout, dataSources = [] }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const [insightsOpen, setInsightsOpen] = useState(false)
  const loadDashboard = useDashboardStore((s) => s.loadDashboard)

  useEffect(() => {
    loadDashboard({ name, widgets, layout, dataSources })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const headerClass = `flex h-12 flex-shrink-0 items-center gap-3 border-b px-6 ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)]'
      : 'border-gray-200 bg-white'
  }`

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${isDark ? 'bg-[#0f1117]' : 'bg-[#f4f5f7]'}`}>
      {/* Top bar */}
      <header className={headerClass}>
        <Link
          href="/my-dashboards"
          className={`text-xs ${isDark ? 'text-[#4b5563] hover:text-[#9ca3af]' : 'text-gray-400 hover:text-gray-600'}`}
        >
          ← My Dashboards
        </Link>
        <span className={isDark ? 'text-[rgba(255,255,255,0.15)]' : 'text-gray-300'}>·</span>
        <span className={`flex-1 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-900'}`}>
          {name}
        </span>
        <button
          onClick={() => setInsightsOpen((prev) => !prev)}
          disabled={widgets.length === 0}
          className={`rounded border px-3 py-1.5 text-xs transition-colors disabled:opacity-40 ${
            insightsOpen
              ? isDark
                ? 'border-cyan-500/50 bg-[rgba(34,211,238,0.1)] text-cyan-400'
                : 'border-indigo-400 bg-indigo-50 text-indigo-600'
              : isDark
                ? 'border-[rgba(34,211,238,0.25)] bg-[rgba(34,211,238,0.08)] text-cyan-400 hover:bg-[rgba(34,211,238,0.12)]'
                : 'border-indigo-300 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          ✦ Insights
        </button>
        <Link
          href={`/builder/${id}`}
          className={`rounded border px-3 py-1.5 text-xs ${
            isDark
              ? 'border-[rgba(255,255,255,0.1)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)]'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          Edit
        </Link>
      </header>

      {/* Canvas + optional insights drawer */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          {widgets.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                This dashboard has no widgets yet.
              </p>
            </div>
          ) : (
            <GridLayout
              layout={layout}
              width={1200}
              gridConfig={{ cols: 12, rowHeight: 80, margin: [12, 12] as [number, number] }}
              dragConfig={{ enabled: false }}
              resizeConfig={{ enabled: false }}
            >
              {widgets.map((widget) => (
                <div key={widget.id}>
                  <WidgetWrapper widgetId={widget.id} title={widget.config.title} isReadOnly>
                    <WidgetRenderer
                      widget={widget}
                      isSelected={false}
                      onSelect={() => {}}
                      onDelete={() => {}}
                      isReadOnly
                    />
                  </WidgetWrapper>
                </div>
              ))}
            </GridLayout>
          )}
        </main>
        {insightsOpen && (
          <DashboardInsightsDrawer
            widgets={widgets}
            dashboardName={name}
            onClose={() => setInsightsOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

export function ViewPage(props: Props) {
  return (
    <BuilderThemeProvider>
      <ViewPageInner {...props} />
    </BuilderThemeProvider>
  )
}
