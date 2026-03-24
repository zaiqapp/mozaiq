'use client'
import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { GridLayoutProps, LayoutItem } from 'react-grid-layout'
import type { Widget } from '@/types/dashboard'
import { WidgetWrapper } from '@/components/widgets/WidgetWrapper'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'
import Link from 'next/link'
import 'react-grid-layout/css/styles.css'

const GridLayout = dynamic(
  () => import('react-grid-layout').then((m) => m.GridLayout),
  { ssr: false }
) as ComponentType<GridLayoutProps>

interface Props { id: string; name: string; widgets: Widget[]; layout: LayoutItem[] }

export function ShareView({ id, name, widgets, layout }: Props) {
  if (widgets.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f4f5f7]">
        <p className="text-gray-500">This dashboard has no widgets yet.</p>
        <Link href={`/builder/${id}`} className="rounded bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700">
          Open in Builder
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <header className="flex h-12 items-center justify-between border-b bg-white px-6">
        <h1 className="text-sm font-semibold text-gray-900">{name}</h1>
        <div className="flex items-center gap-3">
          <Link href="https://zaiq.app" target="_blank" className="text-xs text-gray-400 hover:text-gray-600">
            Built with Mozaiq
          </Link>
          <Link
            href={`/builder/${id}`}
            className="rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"
          >
            Open in Builder
          </Link>
        </div>
      </header>

      <main className="p-4">
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
      </main>
    </div>
  )
}
