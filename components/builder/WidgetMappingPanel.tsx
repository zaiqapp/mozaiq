'use client'
import { useState } from 'react'
import { Wand2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDashboardStore } from '@/store/dashboard'
import { widgetFieldRegistry } from '@/lib/widget-field-registry'
import { useDataSource } from '@/hooks/useDataSource'
import { useBuilderTheme } from './BuilderThemeProvider'
import type { Widget, AxisMapping, WidgetConfig } from '@/types/dashboard'

interface Props { widget: Widget }

export function WidgetMappingPanel({ widget }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const { dataSources, updateWidgetDataSourceId, updateWidgetMapping, updateWidgetConfig } = useDashboardStore()
  const { rows: liveRows } = useDataSource(widget)
  const [isAutoMapping, setIsAutoMapping] = useState(false)
  const [selectingSource, setSelectingSource] = useState(false)

  const fields = widgetFieldRegistry[widget.type] ?? []
  const mapping = widget.dataSourceMapping ?? {}
  const assignedSource = dataSources.find((ds) => ds.id === widget.dataSourceId) ?? null

  const sectionLabel = `text-[10px] uppercase tracking-wider mb-2 ${isDark ? 'text-[#374151]' : 'text-gray-400'}`
  const inputClass = `w-full rounded border px-2 py-1.5 text-sm outline-none ${isDark ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50' : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'}`
  const btnSecondary = `flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs ${isDark ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`
  const textMuted = isDark ? 'text-[#4b5563]' : 'text-gray-400'
  const textSecondary = isDark ? 'text-[#6b7280]' : 'text-gray-500'

  // Available columns from the selected source
  const availableCols = assignedSource?.type === 'csv'
    ? Object.keys(assignedSource.data?.[0] ?? {})
    : (liveRows ? Object.keys(liveRows[0] ?? {}) : [])

  const handleSelectSource = (dsId: string) => {
    updateWidgetDataSourceId(widget.id, dsId)
    setSelectingSource(false)
    // Trigger auto-map after assigning source
    handleAutoMap(dsId)
  }

  const handleUpdateMapping = (fieldKey: string, column: string) => {
    const existing = mapping[fieldKey] ?? { column: '' }
    const updated: Record<string, AxisMapping> = { ...mapping }
    if (!column) {
      delete updated[fieldKey]
    } else {
      updated[fieldKey] = { ...existing, column }
    }
    updateWidgetMapping(widget.id, updated)
  }

  const handleUpdateAggregation = (fieldKey: string, aggregation: 'sum' | 'avg') => {
    const existing = mapping[fieldKey]
    if (!existing) return
    updateWidgetMapping(widget.id, { ...mapping, [fieldKey]: { ...existing, aggregation } })
  }

  const handleUpdateDisplayName = (fieldKey: string, displayName: string) => {
    const existing = mapping[fieldKey]
    if (!existing) return
    const updated = { ...mapping, [fieldKey]: { ...existing, displayName: displayName || undefined } }
    updateWidgetMapping(widget.id, updated)
  }

  const handleAutoMap = async (overrideSourceId?: string) => {
    const sourceId = overrideSourceId ?? widget.dataSourceId
    const source = dataSources.find((ds) => ds.id === sourceId)
    if (!source || fields.length === 0) return

    const cols = source.type === 'csv'
      ? Object.keys(source.data?.[0] ?? {})
      : (liveRows ? Object.keys(liveRows[0] ?? {}) : [])
    if (!cols.length) return

    setIsAutoMapping(true)
    try {
      const res = await fetch('/api/ai/map-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetType: widget.type,
          columns: cols,
          sampleRows: (source.type === 'csv' ? source.data : liveRows)?.slice(0, 3) ?? [],
          widgetFields: fields,
        }),
      })
      const data = await res.json() as { mapping?: Record<string, string>; error?: string }
      if (!res.ok || data.error) { toast.error('Auto-map failed — map manually'); return }
      // Convert Record<string, string> → Record<string, AxisMapping>
      const axisMapped: Record<string, AxisMapping> = {}
      for (const [k, v] of Object.entries(data.mapping ?? {})) {
        axisMapped[k] = { column: v }
      }
      updateWidgetMapping(widget.id, axisMapped)
      toast.success('Columns mapped')
    } catch { toast.error('Auto-map failed — map manually') }
    finally { setIsAutoMapping(false) }
  }

  const handleDisconnect = () => {
    updateWidgetDataSourceId(widget.id, undefined)
    updateWidgetMapping(widget.id, {})
  }

  // State 1: no global sources
  if (dataSources.length === 0) {
    return (
      <p className={`text-[10px] ${textMuted}`}>
        Connect a data source from the toolbar to get started.
      </p>
    )
  }

  // State 2: sources exist but none assigned (or user clicked "change")
  if (!assignedSource || selectingSource) {
    return (
      <div className="flex flex-col gap-2">
        <p className={`${sectionLabel}`}>Select Data Source</p>
        {dataSources.map((ds) => (
          <button
            key={ds.id}
            onClick={() => handleSelectSource(ds.id)}
            className={`flex w-full items-center gap-2 rounded border px-3 py-2 text-left text-xs ${
              isDark
                ? 'border-[rgba(255,255,255,0.08)] text-[#9ca3af] hover:bg-[rgba(255,255,255,0.04)]'
                : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className={`rounded px-1.5 py-0.5 text-[9px] ${isDark ? 'bg-[rgba(255,255,255,0.06)] text-[#6b7280]' : 'bg-gray-100 text-gray-500'}`}>
              {ds.type === 'csv' ? 'CSV' : 'Sheet'}
            </span>
            {ds.name}
          </button>
        ))}
        {selectingSource && (
          <button onClick={() => setSelectingSource(false)} className={`text-[10px] ${textMuted}`}>Cancel</button>
        )}
      </div>
    )
  }

  // State 3: source assigned — show axis-aware mapping
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className={`rounded px-2 py-0.5 text-[10px] ${isDark ? 'bg-[rgba(255,255,255,0.06)] text-[#9ca3af]' : 'bg-gray-100 text-gray-600'}`}>
          {assignedSource.type === 'csv' ? '📄' : '📊'} {assignedSource.name}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => setSelectingSource(true)} className={`text-[10px] ${textMuted} hover:${textSecondary}`}>change</button>
          <button onClick={handleDisconnect} className={`text-[10px] text-red-400 hover:text-red-300`}>Disconnect</button>
        </div>
      </div>

      {fields.length > 0 && (
        <div>
          <p className={sectionLabel}>Column Mapping</p>
          <div className="flex flex-col gap-3">
            {fields.map((field) => (
              <div key={field.key}>
                <label className={`mb-1 block text-[10px] ${textSecondary}`}>
                  {field.label}{field.required && <span className="ml-0.5 text-amber-500">*</span>}
                </label>
                <div className="flex flex-col gap-1">
                  <select
                    className={inputClass}
                    value={mapping[field.key]?.column ?? ''}
                    onChange={(e) => handleUpdateMapping(field.key, e.target.value)}
                  >
                    <option value="">(none)</option>
                    {availableCols.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  {field.type === 'number' && !mapping[field.key]?.column && (
                    <input
                      type="number"
                      className={inputClass + ' text-[11px]'}
                      placeholder="Or type a value directly…"
                      value={typeof (widget.config as Record<string, unknown>)[field.key] === 'number'
                        ? String((widget.config as Record<string, unknown>)[field.key])
                        : ''}
                      onChange={(e) => {
                        const v = e.target.value === '' ? undefined : Number(e.target.value)
                        updateWidgetConfig(widget.id, { [field.key]: v } as Partial<WidgetConfig>)
                      }}
                    />
                  )}
                  {field.type === 'number' && mapping[field.key]?.column && (
                    <div className="flex gap-1">
                      {(['sum', 'avg'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => handleUpdateAggregation(field.key, mode)}
                          className={`flex-1 rounded border py-0.5 text-[10px] ${
                            (mapping[field.key]?.aggregation ?? 'sum') === mode
                              ? isDark
                                ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
                                : 'border-indigo-400 bg-indigo-50 text-indigo-600'
                              : isDark
                                ? 'border-[rgba(255,255,255,0.08)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.04)]'
                                : 'border-gray-200 text-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          {mode === 'sum' ? 'Sum' : 'Avg'}
                        </button>
                      ))}
                    </div>
                  )}
                  {mapping[field.key]?.column && (
                    <input
                      className={inputClass + ' text-[11px]'}
                      placeholder={`Display name (default: ${mapping[field.key]!.column})`}
                      value={mapping[field.key]?.displayName ?? ''}
                      onChange={(e) => handleUpdateDisplayName(field.key, e.target.value)}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleAutoMap()}
            disabled={isAutoMapping}
            className={`${btnSecondary} mt-2 w-full justify-center`}
          >
            <Wand2 className="h-3 w-3" /> {isAutoMapping ? 'Mapping…' : 'Auto-map with AI'}
          </button>
        </div>
      )}
    </div>
  )
}
