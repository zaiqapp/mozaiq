'use client'
import { useState, useRef } from 'react'
import { Upload, Link2, X, Wand2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useDashboardStore } from '@/store/dashboard'
import { parseCsvText } from '@/lib/parse-csv'
import { widgetFieldRegistry } from '@/lib/widget-field-registry'
import { useDataSource } from '@/hooks/useDataSource'
import type { Widget, DataSource } from '@/types/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'

const REFRESH_OPTIONS = [
  { label: '10 sec', value: 10 },
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: 'Manual', value: 0 },
]

interface Props { widget: Widget }

export function DataSourcePanel({ widget }: Props) {
  const { updateDataSource } = useDashboardStore()
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const ds = widget.dataSource
  const fields = widgetFieldRegistry[widget.type] ?? []
  const { rows: liveRows, lastFetched } = useDataSource(widget)

  const [mode, setMode] = useState<'idle' | 'csv' | 'sheets'>('idle')
  const [preview, setPreview] = useState<{ columns: string[]; rows: Record<string, unknown>[] } | null>(null)
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [sheetsGid, setSheetsGid] = useState('')
  const [refreshInterval, setRefreshInterval] = useState(60)
  const [isFetching, setIsFetching] = useState(false)
  const [isAutoMapping, setIsAutoMapping] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const sectionLabel = `text-[10px] uppercase tracking-wider mb-2 ${isDark ? 'text-[#374151]' : 'text-gray-400'}`
  const inputClass = `w-full rounded border px-2 py-1.5 text-sm outline-none ${isDark ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50' : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'}`
  const btnSecondary = `flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs ${isDark ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`
  const btnPrimary = `flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50`

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const { columns, rows, error, warning: w } = parseCsvText(text)
    if (error) { toast.error(error); return }
    setWarning(w ?? null)
    setPreview({ columns, rows })
  }

  const handleCsvConnect = () => {
    if (!preview) return
    const newDs: DataSource = { type: 'csv', data: preview.rows, fileName: fileRef.current?.files?.[0]?.name }
    updateDataSource(widget.id, newDs)
    setMode('idle')
    setPreview(null)
    toast.success('CSV connected')
  }

  const handleSheetsPreview = async () => {
    if (!sheetsUrl.trim()) return
    setIsFetching(true)
    try {
      const params = new URLSearchParams({ url: sheetsUrl })
      if (sheetsGid.trim()) params.set('gid', sheetsGid.trim())
      const res = await fetch(`/api/data/google-sheets?${params}`)
      const data = await res.json() as { columns?: string[]; rows?: Record<string, unknown>[]; error?: string; warning?: string }
      if (!res.ok || data.error) { toast.error(data.error ?? 'Failed to connect'); return }
      setWarning(data.warning ?? null)
      setPreview({ columns: data.columns ?? [], rows: data.rows ?? [] })
    } catch { toast.error('Failed to connect to sheet') }
    finally { setIsFetching(false) }
  }

  const handleSheetsConnect = () => {
    if (!preview) return
    const newDs: DataSource = {
      type: 'google-sheets', url: sheetsUrl,
      gid: sheetsGid.trim() || undefined, refreshInterval,
    }
    updateDataSource(widget.id, newDs)
    setMode('idle')
    setPreview(null)
    toast.success('Google Sheet connected')
  }

  const handleUpdateMapping = (fieldKey: string, colName: string) => {
    if (!ds) return
    const mapping = { ...(ds.mapping ?? {}), [fieldKey]: colName }
    if (!colName) delete mapping[fieldKey]
    updateDataSource(widget.id, { ...ds, mapping })
  }

  const handleAutoMap = async () => {
    if (!ds || fields.length === 0) return
    const sheetsCols = liveRows ? Object.keys(liveRows[0] ?? {}) : []
    const cols = ds.type === 'csv'
      ? Object.keys(ds.data?.[0] ?? {})
      : sheetsCols
    if (!cols.length) return

    setIsAutoMapping(true)
    try {
      const res = await fetch('/api/ai/map-columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widgetType: widget.type,
          columns: cols,
          sampleRows: (ds.type === 'csv' ? ds.data : liveRows)?.slice(0, 3) ?? [],
          widgetFields: fields,
        }),
      })
      const data = await res.json() as { mapping?: Record<string, string>; error?: string }
      if (!res.ok || data.error) { toast.error('Auto-map failed — map manually'); return }
      updateDataSource(widget.id, { ...ds, mapping: data.mapping })
      toast.success('Columns mapped')
    } catch { toast.error('Auto-map failed — map manually') }
    finally { setIsAutoMapping(false) }
  }

  const handleDisconnect = () => { updateDataSource(widget.id, undefined); setMode('idle') }

  // Format "last synced X ago"
  const syncedAgo = lastFetched
    ? (() => {
        const secs = Math.floor((Date.now() - new Date(lastFetched).getTime()) / 1000)
        if (secs < 60) return `${secs}s ago`
        return `${Math.floor(secs / 60)}m ago`
      })()
    : null

  // Available columns for mapping dropdowns
  const availableCols = ds?.type === 'csv'
    ? Object.keys(ds.data?.[0] ?? {})
    : (liveRows ? Object.keys(liveRows[0] ?? {}) : [])

  // --- CONNECTED STATE ---
  if (ds) {
    const badge = ds.type === 'csv' ? ds.fileName ?? 'CSV' : (() => { try { return new URL(ds.url!).hostname } catch { return 'Sheet' } })()
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className={`rounded px-2 py-0.5 text-[10px] ${isDark ? 'bg-[rgba(255,255,255,0.06)] text-[#9ca3af]' : 'bg-gray-100 text-gray-600'}`}>
            {ds.type === 'csv' ? '📄' : '📊'} {badge}
          </span>
          <div className="flex items-center gap-2">
            {syncedAgo && <span className={`text-[10px] ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>Synced {syncedAgo}</span>}
            <button onClick={handleDisconnect} className={`text-[10px] ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-600'}`}>
              Disconnect
            </button>
          </div>
        </div>

        {fields.length > 0 && (
          <div>
            <p className={sectionLabel}>Column Mapping</p>
            <div className="flex flex-col gap-2">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className={`mb-0.5 block text-[10px] ${isDark ? 'text-[#6b7280]' : 'text-gray-500'}`}>
                    {field.label}{field.required && <span className="ml-0.5 text-amber-500">*</span>}
                  </label>
                  <select
                    className={inputClass}
                    value={ds.mapping?.[field.key] ?? ''}
                    onChange={(e) => handleUpdateMapping(field.key, e.target.value)}
                  >
                    <option value="">(none)</option>
                    {availableCols.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button onClick={handleAutoMap} disabled={isAutoMapping} className={`${btnSecondary} mt-2 w-full justify-center`}>
              <Wand2 className="h-3 w-3" /> {isAutoMapping ? 'Mapping…' : 'Auto-map with AI'}
            </button>
          </div>
        )}
      </div>
    )
  }

  // --- IDLE STATE (no source) ---
  if (mode === 'idle') {
    return (
      <div className="flex flex-col gap-2">
        <button onClick={() => setMode('csv')} className={`${btnSecondary} w-full justify-start gap-2`}>
          <Upload className="h-3.5 w-3.5" />
          <div className="text-left">
            <div>Upload CSV</div>
            <div className={`text-[9px] ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>Snapshot — stored with dashboard</div>
          </div>
        </button>
        <button onClick={() => setMode('sheets')} className={`${btnSecondary} w-full justify-start gap-2`}>
          <Link2 className="h-3.5 w-3.5" />
          <div className="text-left">
            <div>Connect Google Sheet</div>
            <div className={`text-[9px] ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>Live — syncs from public sheet</div>
          </div>
        </button>
      </div>
    )
  }

  // --- CSV FLOW ---
  if (mode === 'csv') {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className={sectionLabel}>Upload CSV</p>
          <button onClick={() => { setMode('idle'); setPreview(null) }} className={`text-[10px] ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
            <X className="h-3 w-3" />
          </button>
        </div>
        <input ref={fileRef} type="file" accept=".csv" className={inputClass} onChange={handleCsvFile} />
        {warning && <p className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700">{warning}</p>}
        {preview && (
          <div>
            <p className={`mb-1 text-[10px] ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
              {preview.columns.length} columns · {preview.rows.length.toLocaleString()} rows
            </p>
            <div className={`overflow-x-auto rounded border text-[10px] ${isDark ? 'bg-[rgba(255,255,255,0.03)] text-[#9ca3af]' : 'bg-white text-gray-700'}`} style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
              <table className="w-full">
                <thead>
                  <tr className={isDark ? 'border-b border-[rgba(255,255,255,0.06)]' : 'border-b border-gray-100'}>{preview.columns.map((c) => <th key={c} className={`px-2 py-1 text-left font-medium ${isDark ? 'text-[#6b7280]' : 'text-gray-500'}`}>{c}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 3).map((row, i) => (
                    <tr key={i}>{preview.columns.map((c) => <td key={c} className="px-2 py-1">{String(row[c] ?? '')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleCsvConnect} className={`${btnPrimary} mt-2 w-full justify-center`}>Use this data</button>
          </div>
        )}
      </div>
    )
  }

  // --- GOOGLE SHEETS FLOW ---
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className={sectionLabel}>Connect Google Sheet</p>
        <button onClick={() => { setMode('idle'); setPreview(null) }} className={`text-[10px] ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
          <X className="h-3 w-3" />
        </button>
      </div>
      <div>
        <label className={`mb-0.5 block text-[10px] ${isDark ? 'text-[#6b7280]' : 'text-gray-500'}`}>Sheet URL</label>
        <input className={inputClass} placeholder="https://docs.google.com/spreadsheets/d/…" value={sheetsUrl} onChange={(e) => setSheetsUrl(e.target.value)} />
      </div>
      <div>
        <label className={`mb-0.5 block text-[10px] ${isDark ? 'text-[#6b7280]' : 'text-gray-500'}`}>Sheet tab ID (optional)</label>
        <input className={inputClass} placeholder="Leave blank for first tab" value={sheetsGid} onChange={(e) => setSheetsGid(e.target.value)} />
      </div>
      <div>
        <label className={`mb-0.5 block text-[10px] ${isDark ? 'text-[#6b7280]' : 'text-gray-500'}`}>Refresh interval</label>
        <select className={inputClass} value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))}>
          {REFRESH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
      <button onClick={handleSheetsPreview} disabled={isFetching || !sheetsUrl.trim()} className={btnPrimary}>
        <RefreshCw className={`h-3 w-3 ${isFetching ? 'animate-spin' : ''}`} /> {isFetching ? 'Connecting…' : 'Connect'}
      </button>
      {warning && <p className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700">{warning}</p>}
      {preview && (
        <div>
          <p className={`mb-1 text-[10px] ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>
            {preview.columns.length} columns · {preview.rows.length.toLocaleString()} rows
          </p>
          <div className={`overflow-x-auto rounded border text-[10px] ${isDark ? 'bg-[rgba(255,255,255,0.03)] text-[#9ca3af]' : 'bg-white text-gray-700'}`} style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
            <table className="w-full">
              <thead>
                <tr className={isDark ? 'border-b border-[rgba(255,255,255,0.06)]' : 'border-b border-gray-100'}>{preview.columns.map((c) => <th key={c} className={`px-2 py-1 text-left font-medium ${isDark ? 'text-[#6b7280]' : 'text-gray-500'}`}>{c}</th>)}</tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 3).map((row, i) => (
                  <tr key={i}>{preview.columns.map((c) => <td key={c} className="px-2 py-1">{String(row[c] ?? '')}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={handleSheetsConnect} className={`${btnPrimary} mt-2 w-full justify-center`}>Use this data</button>
        </div>
      )}
    </div>
  )
}
