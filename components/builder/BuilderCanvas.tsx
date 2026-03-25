'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Layout, GridLayoutProps } from 'react-grid-layout'
import type { ComponentType } from 'react'
import 'react-grid-layout/css/styles.css'
import { useDashboardStore } from '@/store/dashboard'
import { WidgetWrapper } from '../widgets/WidgetWrapper'
import { WidgetRenderer } from '../widgets/WidgetRenderer'
import { AIGeneratorBar } from './AIGeneratorBar'
import { useBuilderTheme } from './BuilderThemeProvider'
import { LayoutGrid } from 'lucide-react'

const GridLayout = dynamic(
  () => import('react-grid-layout').then((m) => m.GridLayout),
  { ssr: false }
) as ComponentType<GridLayoutProps>

export function BuilderCanvas() {
  const { widgets, layout, selectedWidgetId, setLayout, selectWidget, removeWidget, isGenerating } = useDashboardStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const [gridWidth, setGridWidth] = useState(1200)
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setGridWidth(entry.contentRect.width)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const gridConfig = useMemo(() => ({ cols: 12, rowHeight: 80, margin: [12, 12] as [number, number] }), [])
  const dragConfig = useMemo(() => ({ enabled: true, bounded: false, handle: '.drag-handle', threshold: 3 }), [])
  const resizeConfig = useMemo(() => ({ enabled: true, handles: ['se'] as const }), [])

  const handleLayoutChange = useCallback((newLayout: Layout) => {
    setLayout([...newLayout])
  }, [setLayout])

  return (
    <div
      ref={containerRef}
      className={`relative flex min-h-full flex-col p-3 ${isDark ? 'bg-[#0f1117]' : 'bg-[#f4f5f7]'}`}
      onClick={() => selectWidget(null)}
    >
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)',
            backgroundSize: '25px 25px',
          }}
        />
      )}
      <div className="mb-3">
        <AIGeneratorBar />
      </div>

      {widgets.length === 0 ? (
        <div className={`flex min-h-[60vh] flex-col items-center justify-center gap-3 ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
          <LayoutGrid className="h-12 w-12 opacity-30" />
          <p className="text-sm">Drag a component or describe your dashboard above</p>
        </div>
      ) : (
        <div className={`relative ${isGenerating ? 'pointer-events-none opacity-50' : ''}`}>
          <GridLayout
            layout={layout}
            width={gridWidth}
            gridConfig={gridConfig}
            dragConfig={dragConfig}
            resizeConfig={resizeConfig}
            onLayoutChange={handleLayoutChange}
          >
            {widgets.map((widget) => (
              <div key={widget.id} onClick={(e) => e.stopPropagation()}>
                <WidgetWrapper
                  widgetId={widget.id}
                  title={widget.config.title}
                >
                  <WidgetRenderer
                    widget={widget}
                    isSelected={selectedWidgetId === widget.id}
                    onSelect={() => selectWidget(widget.id)}
                    onDelete={() => removeWidget(widget.id)}
                  />
                </WidgetWrapper>
              </div>
            ))}
          </GridLayout>
        </div>
      )}
    </div>
  )
}
