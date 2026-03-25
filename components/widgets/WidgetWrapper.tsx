'use client'
import { GripVertical, X } from 'lucide-react'
import { ErrorBoundary } from './ErrorBoundary'
import { useDashboardStore } from '@/store/dashboard'
import { cn } from '@/lib/utils'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

interface Props {
  widgetId: string
  title?: string
  children: React.ReactNode
  isReadOnly?: boolean
}

export function WidgetWrapper({ widgetId, title, children, isReadOnly }: Props) {
  const { selectedWidgetId, selectWidget, removeWidget } = useDashboardStore()
  const isSelected = selectedWidgetId === widgetId
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        'group relative h-full w-full rounded-lg shadow-sm',
        isDark ? 'bg-[#161b27]' : 'bg-white',
        isSelected && !isReadOnly && (isDark ? 'ring-2 ring-cyan-500' : 'ring-2 ring-indigo-500'),
      )}
      onClick={() => !isReadOnly && selectWidget(widgetId)}
    >
      {!isReadOnly && (
        <>
          <div className="drag-handle absolute left-1/2 top-1 z-10 -translate-x-1/2 cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
            <GripVertical className={`h-4 w-4 ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`} />
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
