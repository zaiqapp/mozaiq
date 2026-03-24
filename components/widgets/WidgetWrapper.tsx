'use client'
import { GripVertical, X } from 'lucide-react'
import { ErrorBoundary } from './ErrorBoundary'
import { useDashboardStore } from '@/store/dashboard'
import { cn } from '@/lib/utils'

interface Props {
  widgetId: string
  title?: string
  children: React.ReactNode
  isReadOnly?: boolean
}

export function WidgetWrapper({ widgetId, title, children, isReadOnly }: Props) {
  const { selectedWidgetId, selectWidget, removeWidget } = useDashboardStore()
  const isSelected = selectedWidgetId === widgetId

  return (
    <div
      className={cn(
        'group relative h-full w-full rounded-lg bg-white shadow-sm',
        isSelected && !isReadOnly && 'ring-2 ring-indigo-500',
      )}
      onClick={() => !isReadOnly && selectWidget(widgetId)}
    >
      {!isReadOnly && (
        <>
          <div className="drag-handle absolute left-1/2 top-1 z-10 -translate-x-1/2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
          <button
            className="absolute right-1 top-1 z-10 rounded p-0.5 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); removeWidget(widgetId) }}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      )}
      <ErrorBoundary title={title}>
        {children}
      </ErrorBoundary>
    </div>
  )
}
