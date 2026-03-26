'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import type { Widget } from '@/types/dashboard'
import { useDataSource } from '@/hooks/useDataSource'
import { widgetFieldRegistry } from '@/lib/widget-field-registry'
import { useBuilderTheme } from './BuilderThemeProvider'

interface Props {
  widget: Widget
}

type InsightState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'done'; text: string }
  | { status: 'error'; message: string }

// Keys in widget.config that hold inline data — must be stripped when a data source is connected
const DATA_FIELD_KEYS = new Set(
  Object.values(widgetFieldRegistry).flatMap((fields) => fields.map((f) => f.key))
)

export function WidgetInsightPanel({ widget }: Props) {
  const [state, setState] = useState<InsightState>({ status: 'idle' })
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const { rows } = useDataSource(widget)

  const generate = async () => {
    setState({ status: 'loading' })

    // When a data source is connected, strip inline override data from config
    // so the model only sees display settings (title, color, etc.), not stale values
    const displayConfig = widget.dataSourceId
      ? Object.fromEntries(Object.entries(widget.config).filter(([k]) => !DATA_FIELD_KEYS.has(k)))
      : widget.config

    // rows comes from useDataSource — resolves CSV inline data or live Google Sheets fetch
    const resolvedRows = rows ?? []

    try {
      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetType: widget.type,
          config: displayConfig,
          data: resolvedRows,
          mapping: widget.dataSourceMapping ?? {},
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
      const result = await res.json() as { insight?: string }
      setState({ status: 'done', text: result.insight ?? '' })
    } catch {
      setState({ status: 'error', message: 'Network error — please try again' })
    }
  }

  const labelClass = `text-[9px] uppercase tracking-widest ${isDark ? 'text-[#6b7280]' : 'text-gray-400'}`
  const mutedClass = `text-[9px] ${isDark ? 'text-[#6b7280]' : 'text-gray-400'}`
  const btnClass = `w-full rounded border px-3 py-2 text-xs transition-colors ${
    isDark
      ? 'border-[rgba(34,211,238,0.2)] bg-[rgba(34,211,238,0.08)] text-cyan-400 hover:bg-[rgba(34,211,238,0.12)]'
      : 'border-indigo-300 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
  }`

  return (
    <div className="p-4">
      <p className={`mb-3 ${labelClass}`}>Widget Insight</p>

      {(state.status === 'idle' || state.status === 'error') && (
        <div>
          <button onClick={generate} className={btnClass}>
            ✦ Generate Insight
          </button>
          <p className={`mt-1.5 ${mutedClass}`}>
            Analyzes this widget&apos;s data and tells you what&apos;s notable.
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
            Generated just now ·{' '}
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
  )
}
