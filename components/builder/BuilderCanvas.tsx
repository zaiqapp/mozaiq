'use client'
import { useCallback } from 'react'
import dynamic from 'next/dynamic'
import type { Layout, GridLayoutProps } from 'react-grid-layout'
import type { ComponentType } from 'react'
import 'react-grid-layout/css/styles.css'
import { useDashboardStore } from '@/store/dashboard'
import { WidgetWrapper } from '../widgets/WidgetWrapper'
import { WidgetRenderer } from '../widgets/WidgetRenderer'
import { AIGeneratorBar } from './AIGeneratorBar'
import { LayoutGrid } from 'lucide-react'

const GridLayout = dynamic(
  () => import('react-grid-layout').then((m) => m.GridLayout),
  { ssr: false }
) as ComponentType<GridLayoutProps>

export function BuilderCanvas() {
  const { widgets, layout, selectedWidgetId, setLayout, selectWidget, removeWidget, isGenerating } = useDashboardStore()

  const handleLayoutChange = useCallback((newLayout: Layout) => {
    setLayout([...newLayout])
  }, [setLayout])

  return (
    <div
      className="flex h-full flex-col bg-[#f4f5f7] p-3"
      onClick={() => selectWidget(null)}
    >
      <div className="mb-3">
        <AIGeneratorBar />
      </div>

      {widgets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-gray-400">
          <LayoutGrid className="h-12 w-12 opacity-30" />
          <p className="text-sm">Drag a component or describe your dashboard above</p>
        </div>
      ) : (
        <div className={`relative flex-1 ${isGenerating ? 'pointer-events-none opacity-50' : ''}`}>
          <GridLayout
            layout={layout}
            width={1200}
            gridConfig={{ cols: 12, rowHeight: 80, margin: [12, 12] as [number, number] }}
            dragConfig={{ enabled: true, bounded: false, handle: '.drag-handle', threshold: 3 }}
            resizeConfig={{ enabled: true, handles: ['se'] as const }}
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
