'use client'

import { useCallback } from 'react'
import type { Widget, WidgetConfig } from '@/types/dashboard'
import { widgetConfigSchema, type ConfigFieldDef } from '@/lib/widget-config-schema'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'

// --- helpers for dot-notation nested config keys ---

function getPath(obj: Record<string, unknown>, key: string): unknown {
  return key.split('.').reduce<unknown>(
    (acc, k) => (acc !== null && typeof acc === 'object' ? (acc as Record<string, unknown>)[k] : undefined),
    obj,
  )
}

function setPath(
  obj: Record<string, unknown>,
  key: string,
  value: unknown,
): Record<string, unknown> {
  const parts = key.split('.')
  const head = parts[0] as string
  const tail = parts.slice(1)
  if (tail.length === 0) return { ...obj, [head]: value }
  return {
    ...obj,
    [head]: setPath((obj[head] as Record<string, unknown>) ?? {}, tail.join('.'), value),
  }
}

// ---

interface Props { widget: Widget }

export function WidgetConfigPanel({ widget }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const updateWidgetConfig = useDashboardStore((s) => s.updateWidgetConfig)
  const updateWidgetMapping = useDashboardStore((s) => s.updateWidgetMapping)

  const schema = widgetConfigSchema[widget.type] ?? []
  const configObj = widget.config as unknown as Record<string, unknown>

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      const updated = key.includes('.')
        ? setPath(configObj, key, value)
        : { [key]: value }
      updateWidgetConfig(widget.id, updated as Partial<WidgetConfig>)
    },
    [widget.id, configObj, updateWidgetConfig],
  )

  const handleOverride = useCallback(
    (key: string) => {
      if (!widget.dataSourceMapping) return
      const { [key]: _removed, ...rest } = widget.dataSourceMapping
      updateWidgetMapping(widget.id, rest)
    },
    [widget.id, widget.dataSourceMapping, updateWidgetMapping],
  )

  const inputClass = `w-full rounded border px-2 py-1.5 text-sm outline-none ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`

  const labelClass = `mb-1 block text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-600'}`

  return (
    <div className="flex flex-col gap-4 p-4">
      {schema.map((field) => {
        const sourcedFrom = widget.dataSourceMapping?.[field.key]?.column
        const isSourced = !!sourcedFrom && (field.type === 'number' || field.type === 'text' || field.type === 'color' || field.type === 'boolean' || field.type === 'select')
        const value = getPath(configObj, field.key)

        return (
          <div key={field.key}>
            <div className="flex items-center justify-between mb-1">
              <label className={labelClass}>{field.label}</label>
              {isSourced && (
                <button
                  onClick={() => handleOverride(field.key)}
                  className="text-[10px] text-indigo-500 hover:underline"
                >
                  sourced from &ldquo;{sourcedFrom}&rdquo; · override
                </button>
              )}
            </div>

            {isSourced ? (
              <div className={`${inputClass} opacity-50 cursor-not-allowed`}>(auto)</div>
            ) : field.type === 'color' ? (
              <input
                type="color"
                className={`h-8 w-full cursor-pointer rounded border ${
                  isDark ? 'border-[rgba(255,255,255,0.1)]' : 'border-gray-200'
                }`}
                value={typeof value === 'string' ? value : '#6366f1'}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            ) : field.type === 'boolean' ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!value}
                  onChange={(e) => handleChange(field.key, e.target.checked)}
                  className="rounded"
                />
              </label>
            ) : field.type === 'number' ? (
              <input
                type="number"
                className={inputClass}
                value={typeof value === 'number' ? value : ''}
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                placeholder={field.placeholder}
                onChange={(e) =>
                  handleChange(
                    field.key,
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            ) : field.multiline ? (
              <textarea
                className={inputClass}
                rows={field.key === 'content' ? 5 : 2}
                value={typeof value === 'string' ? value : ''}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            ) : (
              <input
                type="text"
                className={inputClass}
                value={typeof value === 'string' ? value : ''}
                placeholder={field.placeholder}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
