'use client'
import { useState, useRef, useEffect } from 'react'
import { Upload, Link2, X, Pencil, Trash2, RefreshCw, ChevronDown, ChevronUp, Wand2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { nanoid } from 'nanoid'
import { useDashboardStore } from '@/store/dashboard'
import { parseCsvText } from '@/lib/parse-csv'
import { useBuilderTheme } from './BuilderThemeProvider'
import type { GlobalDataSource } from '@/types/dashboard'

const REFRESH_OPTIONS = [
  { label: '10 sec', value: 10 },
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '5 min', value: 300 },
  { label: '15 min', value: 900 },
  { label: 'Manual', value: 0 },
]

type AddMode = 'none' | 'csv' | 'sheets'

interface SheetPreview { columns: string[]; rows: Record<string, unknown>[] }

export function GlobalDataSourcePanel() {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const { dataSources, addGlobalDataSource, updateGlobalDataSource, removeGlobalDataSource, addGeneratedWidgets, widgets } = useDashboardStore()

  const [addMode, setAddMode] = useState<AddMode>('none')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // CSV state
  const [csvPreview, setCsvPreview] = useState<SheetPreview | null>(null)
  const [csvWarning, setCsvWarning] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const expandFileRef = useRef<HTMLInputElement>(null)

  // Expand-CSV state (isolated from add-CSV flow)
  const [expandCsvPreview, setExpandCsvPreview] = useState<SheetPreview | null>(null)
  const [expandCsvWarning, setExpandCsvWarning] = useState<string | null>(null)

  // AI Generate state
  const [generatePrompt, setGeneratePrompt] = useState('')
  const [isGeneratingWidgets, setIsGeneratingWidgets] = useState(false)
  const [hasAutoSuggested, setHasAutoSuggested] = useState(false)

  // Sheets state
  const [sheetsUrl, setSheetsUrl] = useState('')
  const [sheetsGid, setSheetsGid] = useState('')
  const [refreshInterval, setRefreshInterval] = useState(60)
  const [sheetsPreview, setSheetsPreview] = useState<SheetPreview | null>(null)
  const [sheetsWarning, setSheetsWarning] = useState<string | null>(null)
  const [isFetchingSheets, setIsFetchingSheets] = useState(false)

  const border = isDark ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-200'
  const bg = isDark ? 'bg-[#0a0a0f]' : 'bg-white'
  const textMuted = isDark ? 'text-[#4b5563]' : 'text-gray-400'
  const textSecondary = isDark ? 'text-[#6b7280]' : 'text-gray-500'
  const textPrimary = isDark ? 'text-[#9ca3af]' : 'text-gray-700'
  const inputClass = `w-full rounded border px-2 py-1.5 text-sm outline-none ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`
  const btnSecondary = `flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs ${
    isDark ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
  }`
  const btnPrimary = `flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50`
  const sectionLabel = `text-[10px] uppercase tracking-wider ${isDark ? 'text-[#374151]' : 'text-gray-400'}`

  const handleCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const { columns, rows, error, warning } = parseCsvText(text)
    if (error) { toast.error(error); return }
    setCsvWarning(warning ?? null)
    setCsvPreview({ columns, rows })
  }

  const handleExpandCsvFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const { columns, rows, error, warning } = parseCsvText(text)
    if (error) { toast.error(error); return }
    setExpandCsvWarning(warning ?? null)
    setExpandCsvPreview({ columns, rows })
  }

  const handleCsvConnect = () => {
    if (!csvPreview) return
    const fileName = fileRef.current?.files?.[0]?.name
    const ds: GlobalDataSource = {
      id: nanoid(8),
      name: fileName ?? 'CSV Import',
      type: 'csv',
      data: csvPreview.rows,
      fileName,
    }
    addGlobalDataSource(ds)
    setAddMode('none')
    setCsvPreview(null)
    setCsvWarning(null)
    if (fileRef.current) fileRef.current.value = ''
    toast.success('CSV connected')
  }

  const handleSheetsPreview = async () => {
    if (!sheetsUrl.trim()) return
    setIsFetchingSheets(true)
    try {
      const params = new URLSearchParams({ url: sheetsUrl })
      if (sheetsGid.trim()) params.set('gid', sheetsGid.trim())
      const res = await fetch(`/api/data/google-sheets?${params}`)
      const data = await res.json() as { columns?: string[]; rows?: Record<string, unknown>[]; error?: string; warning?: string }
      if (!res.ok || data.error) { toast.error(data.error ?? 'Failed to connect'); return }
      setSheetsWarning(data.warning ?? null)
      setSheetsPreview({ columns: data.columns ?? [], rows: data.rows ?? [] })
    } catch { toast.error('Failed to connect to sheet') }
    finally { setIsFetchingSheets(false) }
  }

  const handleSheetsConnect = () => {
    if (!sheetsPreview) return
    const hostname = (() => { try { return new URL(sheetsUrl).hostname } catch { return 'Sheet' } })()
    const ds: GlobalDataSource = {
      id: nanoid(8),
      name: hostname,
      type: 'google-sheets',
      url: sheetsUrl,
      gid: sheetsGid.trim() || undefined,
      refreshInterval,
    }
    addGlobalDataSource(ds)
    setAddMode('none')
    setSheetsPreview(null)
    setSheetsWarning(null)
    setSheetsUrl('')
    setSheetsGid('')
    toast.success('Google Sheet connected')
  }

  const handleRename = (ds: GlobalDataSource) => {
    setRenamingId(ds.id)
    setRenameValue(ds.name)
  }

  const commitRename = (id: string) => {
    if (renameValue.trim()) updateGlobalDataSource(id, { name: renameValue.trim() })
    setRenamingId(null)
  }

  const handleDeleteRequest = (id: string) => {
    const refCount = widgets.filter((w) => w.dataSourceId === id).length
    if (refCount > 0) { setDeleteConfirmId(id); return }
    removeGlobalDataSource(id)
    toast.success('Data source removed')
  }

  const confirmDelete = (id: string) => {
    removeGlobalDataSource(id)
    setDeleteConfirmId(null)
    toast.success('Data source removed — affected widgets disconnected')
  }

  const rowCount = (ds: GlobalDataSource) => {
    if (ds.type === 'csv') return ds.data?.length ?? 0
    return null // live source — row count not stored
  }

  // Auto-suggest: fire when first source is connected and canvas is empty
  useEffect(() => {
    if (hasAutoSuggested) return
    if (dataSources.length !== 1) return
    if (widgets.length > 0) return
    setHasAutoSuggested(true)
    generateWidgets('Generate a dashboard for this data', dataSources[0]!)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSources.length, widgets.length])

  const generateWidgets = async (prompt: string, sourceOverride?: GlobalDataSource) => {
    const source = sourceOverride ?? dataSources[0]
    if (!source) return

    const cols = source.type === 'csv'
      ? Object.keys(source.data?.[0] ?? {})
      : [] // Sheets: columns not available client-side without live fetch; skip if empty

    const sampleRows = source.type === 'csv' ? (source.data ?? []).slice(0, 5) : []

    setIsGeneratingWidgets(true)
    try {
      const res = await fetch('/api/ai/generate-widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dataSourceId: source.id,
          columns: cols.length ? cols : ['data'],
          sampleRows,
          prompt,
        }),
      })
      const data = await res.json() as { widgets?: { type: string; config: Record<string, unknown>; dataSourceId: string; dataSourceMapping: Record<string, { column: string }> }[]; error?: string }
      if (!res.ok || data.error) { toast.error(data.error ?? 'Generation failed'); return }
      if (data.widgets?.length) {
        addGeneratedWidgets(data.widgets as Parameters<typeof addGeneratedWidgets>[0])
        toast.success(`Added ${data.widgets.length} widgets`)
      }
    } catch { toast.error('Generation failed') }
    finally { setIsGeneratingWidgets(false) }
  }

  return (
    <div className={`border-b ${border} ${bg} px-4 py-3`}>
      {/* Zone 1 — Connected sources */}
      {dataSources.length > 0 && (
        <div className="mb-3">
          <p className={`mb-2 ${sectionLabel}`}>Connected Sources</p>
          <div className="flex flex-col gap-1">
            {dataSources.map((ds) => {
              const count = rowCount(ds)
              const isExpanded = expandedId === ds.id
              const refCount = widgets.filter((w) => w.dataSourceId === ds.id).length

              return (
                <div key={ds.id} className={`rounded border ${isDark ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-100'}`}>
                  <div className={`flex items-center gap-2 px-3 py-2 ${isDark ? 'bg-[rgba(255,255,255,0.02)]' : 'bg-gray-50'}`}>
                    <span className={`text-[10px] rounded px-1.5 py-0.5 ${isDark ? 'bg-[rgba(255,255,255,0.06)] text-[#6b7280]' : 'bg-gray-100 text-gray-500'}`}>
                      {ds.type === 'csv' ? 'CSV' : 'Sheet'}
                    </span>
                    {renamingId === ds.id ? (
                      <input
                        autoFocus
                        className={`flex-1 rounded border px-1.5 py-0.5 text-xs outline-none ${isDark ? 'border-cyan-500/50 bg-[rgba(255,255,255,0.06)] text-[#9ca3af]' : 'border-indigo-400 bg-white text-gray-900'}`}
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => commitRename(ds.id)}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitRename(ds.id); if (e.key === 'Escape') setRenamingId(null) }}
                      />
                    ) : (
                      <span className={`flex-1 text-xs ${textPrimary}`}>{ds.name}</span>
                    )}
                    {count !== null && <span className={`text-[10px] ${textMuted}`}>{count.toLocaleString()} rows</span>}
                    {refCount > 0 && <span className={`text-[10px] ${textMuted}`}>{refCount}w</span>}
                    <button onClick={() => handleRename(ds)} className={`p-0.5 ${textMuted} hover:${textSecondary}`}><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => handleDeleteRequest(ds.id)} className={`p-0.5 text-red-400 hover:text-red-300`}><Trash2 className="h-3 w-3" /></button>
                    <button
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedId(null)
                        } else {
                          setExpandedId(ds.id)
                          setAddMode('none')
                          // Pre-fill state with current source values
                          if (ds.type === 'google-sheets') {
                            setSheetsUrl(ds.url ?? '')
                            setSheetsGid(ds.gid ?? '')
                            setRefreshInterval(ds.refreshInterval ?? 60)
                            setSheetsPreview(null)
                            setSheetsWarning(null)
                          } else {
                            setExpandCsvPreview(null)
                            setExpandCsvWarning(null)
                            if (expandFileRef.current) expandFileRef.current.value = ''
                          }
                        }
                      }}
                      className={`p-0.5 ${textMuted}`}
                    >
                      {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  </div>

                  {isExpanded && ds.type === 'csv' && (
                    <div className={`flex flex-col gap-2 border-t px-3 py-2 ${border}`}>
                      <p className={sectionLabel}>Replace CSV data</p>
                      <input ref={expandFileRef} type="file" accept=".csv" className={inputClass} onChange={handleExpandCsvFile} />
                      {expandCsvWarning && <p className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700">{expandCsvWarning}</p>}
                      {expandCsvPreview && (
                        <div>
                          <p className={`mb-1 text-[10px] ${textMuted}`}>{expandCsvPreview.columns.length} columns · {expandCsvPreview.rows.length.toLocaleString()} rows</p>
                          <div className={`overflow-x-auto rounded border text-[10px] ${isDark ? 'bg-[rgba(255,255,255,0.03)] text-[#9ca3af]' : 'bg-white text-gray-700'}`} style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
                            <table className="w-full">
                              <thead><tr className={isDark ? 'border-b border-[rgba(255,255,255,0.06)]' : 'border-b border-gray-100'}>{expandCsvPreview.columns.map((c) => <th key={c} className={`px-2 py-1 text-left font-medium ${textMuted}`}>{c}</th>)}</tr></thead>
                              <tbody>{expandCsvPreview.rows.slice(0, 3).map((row, i) => (<tr key={i}>{expandCsvPreview.columns.map((c) => <td key={c} className="px-2 py-1">{String(row[c] ?? '')}</td>)}</tr>))}</tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          disabled={!expandCsvPreview}
                          onClick={() => {
                            if (!expandCsvPreview) return
                            const fileName = expandFileRef.current?.files?.[0]?.name
                            updateGlobalDataSource(ds.id, { data: expandCsvPreview.rows, fileName })
                            setExpandedId(null)
                            setExpandCsvPreview(null)
                            setExpandCsvWarning(null)
                            if (expandFileRef.current) expandFileRef.current.value = ''
                            toast.success('CSV data replaced')
                          }}
                          className={btnPrimary}
                        >
                          Replace data
                        </button>
                        <button
                          onClick={() => { setExpandedId(null); setExpandCsvPreview(null); setExpandCsvWarning(null) }}
                          className={btnSecondary}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {isExpanded && ds.type === 'google-sheets' && (
                    <div className={`flex flex-col gap-2 border-t px-3 py-2 ${border}`}>
                      <p className={sectionLabel}>Re-connect Google Sheet</p>
                      <div>
                        <label className={`mb-0.5 block text-[10px] ${textSecondary}`}>Sheet URL</label>
                        <input className={inputClass} placeholder="https://docs.google.com/spreadsheets/d/…" value={sheetsUrl} onChange={(e) => setSheetsUrl(e.target.value)} />
                      </div>
                      <div>
                        <label className={`mb-0.5 block text-[10px] ${textSecondary}`}>Sheet tab ID (optional)</label>
                        <input className={inputClass} placeholder="Leave blank for first tab" value={sheetsGid} onChange={(e) => setSheetsGid(e.target.value)} />
                      </div>
                      <div>
                        <label className={`mb-0.5 block text-[10px] ${textSecondary}`}>Refresh interval</label>
                        <select className={inputClass} value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))}>
                          {REFRESH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <button onClick={handleSheetsPreview} disabled={isFetchingSheets || !sheetsUrl.trim()} className={btnPrimary}>
                        <RefreshCw className={`h-3 w-3 ${isFetchingSheets ? 'animate-spin' : ''}`} />
                        {isFetchingSheets ? 'Connecting…' : 'Re-connect'}
                      </button>
                      {sheetsWarning && <p className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700">{sheetsWarning}</p>}
                      {sheetsPreview && (
                        <div>
                          <p className={`mb-1 text-[10px] ${textMuted}`}>{sheetsPreview.columns.length} columns · {sheetsPreview.rows.length.toLocaleString()} rows</p>
                          <div className={`overflow-x-auto rounded border text-[10px] ${isDark ? 'bg-[rgba(255,255,255,0.03)] text-[#9ca3af]' : 'bg-white text-gray-700'}`} style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
                            <table className="w-full">
                              <thead><tr className={isDark ? 'border-b border-[rgba(255,255,255,0.06)]' : 'border-b border-gray-100'}>{sheetsPreview.columns.map((c) => <th key={c} className={`px-2 py-1 text-left font-medium ${textMuted}`}>{c}</th>)}</tr></thead>
                              <tbody>{sheetsPreview.rows.slice(0, 3).map((row, i) => (<tr key={i}>{sheetsPreview.columns.map((c) => <td key={c} className="px-2 py-1">{String(row[c] ?? '')}</td>)}</tr>))}</tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          disabled={!sheetsPreview}
                          onClick={() => {
                            if (!sheetsPreview) return
                            updateGlobalDataSource(ds.id, {
                              url: sheetsUrl,
                              gid: sheetsGid.trim() || undefined,
                              refreshInterval,
                            })
                            setExpandedId(null)
                            setSheetsPreview(null)
                            setSheetsWarning(null)
                            toast.success('Google Sheet updated')
                          }}
                          className={btnPrimary}
                        >
                          Update
                        </button>
                        <button
                          onClick={() => { setExpandedId(null); setSheetsPreview(null); setSheetsWarning(null) }}
                          className={btnSecondary}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {deleteConfirmId === ds.id && (
                    <div className={`px-3 py-2 border-t ${border} text-xs ${textSecondary}`}>
                      {widgets.filter((w) => w.dataSourceId === ds.id).length} widget(s) use this source — they will be disconnected.
                      <div className="mt-1.5 flex gap-2">
                        <button onClick={() => confirmDelete(ds.id)} className="rounded bg-red-500 px-2 py-1 text-[10px] text-white hover:bg-red-600">Remove anyway</button>
                        <button onClick={() => setDeleteConfirmId(null)} className={btnSecondary + ' py-1 text-[10px]'}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Zone 2 — Add source */}
      {addMode === 'none' && (
        <div className="flex gap-2">
          <button onClick={() => setAddMode('csv')} className={btnSecondary}>
            <Upload className="h-3.5 w-3.5" /> Upload CSV
          </button>
          <button onClick={() => setAddMode('sheets')} className={btnSecondary}>
            <Link2 className="h-3.5 w-3.5" /> Connect Google Sheet
          </button>
        </div>
      )}

      {addMode === 'csv' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className={sectionLabel}>Upload CSV</p>
            <button onClick={() => { setAddMode('none'); setCsvPreview(null); setCsvWarning(null) }} className={textMuted}><X className="h-3 w-3" /></button>
          </div>
          <input ref={fileRef} type="file" accept=".csv" className={inputClass} onChange={handleCsvFile} />
          {csvWarning && <p className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700">{csvWarning}</p>}
          {csvPreview && (
            <div>
              <p className={`mb-1 text-[10px] ${textMuted}`}>{csvPreview.columns.length} columns · {csvPreview.rows.length.toLocaleString()} rows</p>
              <div className={`overflow-x-auto rounded border text-[10px] ${isDark ? 'bg-[rgba(255,255,255,0.03)] text-[#9ca3af]' : 'bg-white text-gray-700'}`} style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
                <table className="w-full">
                  <thead><tr className={isDark ? 'border-b border-[rgba(255,255,255,0.06)]' : 'border-b border-gray-100'}>{csvPreview.columns.map((c) => <th key={c} className={`px-2 py-1 text-left font-medium ${textMuted}`}>{c}</th>)}</tr></thead>
                  <tbody>{csvPreview.rows.slice(0, 3).map((row, i) => (<tr key={i}>{csvPreview.columns.map((c) => <td key={c} className="px-2 py-1">{String(row[c] ?? '')}</td>)}</tr>))}</tbody>
                </table>
              </div>
              <button onClick={handleCsvConnect} className={`${btnPrimary} mt-2 w-full justify-center`}>Use this data</button>
            </div>
          )}
        </div>
      )}

      {addMode === 'sheets' && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className={sectionLabel}>Connect Google Sheet</p>
            <button onClick={() => { setAddMode('none'); setSheetsPreview(null); setSheetsWarning(null) }} className={textMuted}><X className="h-3 w-3" /></button>
          </div>
          <div>
            <label className={`mb-0.5 block text-[10px] ${textSecondary}`}>Sheet URL</label>
            <input className={inputClass} placeholder="https://docs.google.com/spreadsheets/d/…" value={sheetsUrl} onChange={(e) => setSheetsUrl(e.target.value)} />
          </div>
          <div>
            <label className={`mb-0.5 block text-[10px] ${textSecondary}`}>Sheet tab ID (optional)</label>
            <input className={inputClass} placeholder="Leave blank for first tab" value={sheetsGid} onChange={(e) => setSheetsGid(e.target.value)} />
          </div>
          <div>
            <label className={`mb-0.5 block text-[10px] ${textSecondary}`}>Refresh interval</label>
            <select className={inputClass} value={refreshInterval} onChange={(e) => setRefreshInterval(Number(e.target.value))}>
              {REFRESH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button onClick={handleSheetsPreview} disabled={isFetchingSheets || !sheetsUrl.trim()} className={btnPrimary}>
            <RefreshCw className={`h-3 w-3 ${isFetchingSheets ? 'animate-spin' : ''}`} />
            {isFetchingSheets ? 'Connecting…' : 'Connect'}
          </button>
          {sheetsWarning && <p className="rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-700">{sheetsWarning}</p>}
          {sheetsPreview && (
            <div>
              <p className={`mb-1 text-[10px] ${textMuted}`}>{sheetsPreview.columns.length} columns · {sheetsPreview.rows.length.toLocaleString()} rows</p>
              <div className={`overflow-x-auto rounded border text-[10px] ${isDark ? 'bg-[rgba(255,255,255,0.03)] text-[#9ca3af]' : 'bg-white text-gray-700'}`} style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
                <table className="w-full">
                  <thead><tr className={isDark ? 'border-b border-[rgba(255,255,255,0.06)]' : 'border-b border-gray-100'}>{sheetsPreview.columns.map((c) => <th key={c} className={`px-2 py-1 text-left font-medium ${textMuted}`}>{c}</th>)}</tr></thead>
                  <tbody>{sheetsPreview.rows.slice(0, 3).map((row, i) => (<tr key={i}>{sheetsPreview.columns.map((c) => <td key={c} className="px-2 py-1">{String(row[c] ?? '')}</td>)}</tr>))}</tbody>
                </table>
              </div>
              <button onClick={handleSheetsConnect} className={`${btnPrimary} mt-2 w-full justify-center`}>Use this data</button>
            </div>
          )}
        </div>
      )}

      {/* Zone 3 — AI Generate (visible when sources are connected) */}
      {dataSources.length > 0 && addMode === 'none' && (
        <div className={`mt-3 border-t pt-3 ${border}`}>
          <p className={`mb-2 ${sectionLabel}`}>AI Generate</p>
          {isGeneratingWidgets ? (
            <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating widgets…
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                className={inputClass + ' flex-1'}
                placeholder="What would you like to visualize?"
                value={generatePrompt}
                onChange={(e) => setGeneratePrompt(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && generatePrompt.trim()) { generateWidgets(generatePrompt); setGeneratePrompt('') } }}
              />
              <button
                disabled={!generatePrompt.trim()}
                onClick={() => { generateWidgets(generatePrompt); setGeneratePrompt('') }}
                className={`flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs text-white hover:opacity-90 disabled:opacity-50`}
              >
                <Wand2 className="h-3.5 w-3.5" /> Generate
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
