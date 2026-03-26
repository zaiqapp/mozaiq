'use client'
import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Widget } from '@/types/dashboard'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'

interface Props {
  widgets: Widget[]
  dashboardName: string
  onClose: () => void
}

type InsightState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; text: string; widgetCount: number }
  | { status: 'error'; message: string }

export function DashboardInsightsDrawer({ widgets, dashboardName, onClose }: Props) {
  const [state, setState] = useState<InsightState>({ status: 'idle' })
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const dataSources = useDashboardStore((s) => s.dataSources)

  const generate = async () => {
    setState({ status: 'loading' })
    try {
      const res = await fetch('/api/ai/dashboard-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardName,
          widgets: widgets.map((w) => {
            const ds = w.dataSourceId ? dataSources.find((d) => d.id === w.dataSourceId) : undefined
            return {
              type: w.type,
              config: w.config,
              data: ds?.data ?? [],
              mapping: w.dataSourceMapping ?? {},
            }
          }),
        }),
      })
      if (!res.ok) {
        let message = 'Generation failed'
        try {
          const body = await res.json() as { error?: string }
          if (body.error) message = body.error
        } catch { /* non-JSON error body */ }
        setState({ status: 'error', message })
        return
      }
      const data = await res.json() as { insight?: string }
      setState({ status: 'done', text: data.insight ?? '', widgetCount: widgets.length })
    } catch {
      setState({ status: 'error', message: 'Network error — please try again' })
    }
  }

  const asideClass = `flex h-full w-[280px] flex-shrink-0 flex-col border-l font-sans ${
    isDark
      ? 'border-[rgba(34,211,238,0.15)] bg-[#0a0f16]'
      : 'border-indigo-100 bg-white'
  }`

  const mutedClass = `text-[9px] ${isDark ? 'text-[#6b7280]' : 'text-gray-400'}`

  const btnClass = `w-full rounded border px-3 py-2 text-xs transition-colors ${
    isDark
      ? 'border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.08)] text-cyan-400 hover:bg-[rgba(34,211,238,0.12)]'
      : 'border-indigo-300 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
  }`

  return (
    <aside className={asideClass}>
      {/* Header */}
      <div className={`flex items-center justify-between border-b px-4 py-3 ${
        isDark ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-100'
      }`}>
        <span className={`text-xs font-semibold ${isDark ? 'text-cyan-400' : 'text-indigo-600'}`}>
          ✦ Insights
        </span>
        <button
          onClick={onClose}
          className={`rounded p-0.5 transition-colors ${
            isDark ? 'text-[#4b5563] hover:text-[#9ca3af]' : 'text-gray-400 hover:text-gray-600'
          }`}
          aria-label="Close insights"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {(state.status === 'idle' || state.status === 'error') && (
          <div>
            <button onClick={generate} className={btnClass}>
              ✦ Generate
            </button>
            <p className={`mt-1.5 ${mutedClass}`}>
              Analyzes all widgets on your canvas and surfaces trends, relationships, and anomalies.
            </p>
            {state.status === 'error' && (
              <p className="mt-2 text-[10px] text-red-400">{state.message}</p>
            )}
          </div>
        )}

        {state.status === 'loading' && (
          <div className={`flex items-center gap-2 py-2 text-xs ${isDark ? 'text-[#6b7280]' : 'text-gray-400'}`}>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analyzing&hellip;
          </div>
        )}

        {state.status === 'done' && (
          <div>
            <div className={`rounded border p-3 ${
              isDark
                ? 'border-[rgba(34,211,238,0.12)] bg-[rgba(34,211,238,0.04)]'
                : 'border-indigo-100 bg-indigo-50/50'
            }`}>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-[#9ca3af]' : 'text-gray-600'}`}>
                {state.text}
              </p>
            </div>
            <p className={`mt-2 ${mutedClass}`}>
              Based on {state.widgetCount} widget{state.widgetCount !== 1 ? 's' : ''} ·{' '}
              <button
                onClick={generate}
                className={`underline ${isDark ? 'text-[#4b5563] hover:text-[#9ca3af]' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Regenerate
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Footer regenerate button (only when done) */}
      {state.status === 'done' && (
        <div className={`border-t p-3 ${isDark ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-100'}`}>
          <button onClick={generate} className={btnClass}>
            ✦ Regenerate
          </button>
        </div>
      )}
    </aside>
  )
}
