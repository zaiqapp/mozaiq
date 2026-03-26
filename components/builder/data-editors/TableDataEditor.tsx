'use client'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

interface TableColumn { key: string; label: string; sortable?: boolean }
type TableRow = Record<string, string | number>

interface InternalRow extends TableRow { _id: string }

interface Props {
  columns: TableColumn[]
  rows: TableRow[]
  onChange: (columns: TableColumn[], rows: TableRow[]) => void
}

export function TableDataEditor({ columns, rows, onChange }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  // ── shared style tokens ──────────────────────────────────────────────────
  const inputClass = `rounded border px-1.5 py-1 text-xs outline-none w-full ${
    isDark
      ? 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] focus:border-cyan-500/50'
      : 'border-gray-200 bg-white text-gray-900 focus:border-indigo-400'
  }`
  const deleteClass = `text-sm leading-none transition-colors ${
    isDark ? 'text-[#4b5563] hover:text-red-500' : 'text-gray-300 hover:text-red-500'
  }`
  const addClass = `mt-2 w-full rounded border py-1 text-xs transition-colors ${
    isDark
      ? 'border-dashed border-[rgba(255,255,255,0.1)] text-[#4b5563] hover:text-[#6b7280]'
      : 'border-dashed border-gray-200 text-gray-400 hover:text-gray-600'
  }`
  const headerClass = `text-[9px] uppercase tracking-wide ${isDark ? 'text-[#374151]' : 'text-gray-400'}`
  const sectionHeaderClass = `text-[9px] uppercase tracking-wide mb-1 ${
    isDark ? 'text-[#374151]' : 'text-gray-400'
  }`
  const dividerClass = `my-3 border-t ${isDark ? 'border-[rgba(255,255,255,0.06)]' : 'border-gray-100'}`

  // ── helpers ──────────────────────────────────────────────────────────────
  // Inject _id into rows for stable React keys
  const internalRows: InternalRow[] = rows.map((r, i) =>
    '_id' in r ? (r as InternalRow) : { ...r, _id: `row-${i}-${crypto.randomUUID()}` }
  )

  const emit = (newCols: TableColumn[], newRows: InternalRow[]) => {
    const strippedRows: TableRow[] = newRows.map(({ _id, ...rest }) => rest as TableRow)
    onChange(newCols, strippedRows)
  }

  // ── column handlers ───────────────────────────────────────────────────────
  const handleColChange = (idx: number, field: keyof TableColumn, value: string | boolean) => {
    const newCols = columns.map((c, i) => i === idx ? { ...c, [field]: value } : c)
    emit(newCols, internalRows)
  }

  const handleAddCol = () => {
    emit([...columns, { key: '', label: '', sortable: false }], internalRows)
  }

  const handleDeleteCol = (idx: number) => {
    emit(columns.filter((_, i) => i !== idx), internalRows)
  }

  // ── row handlers ──────────────────────────────────────────────────────────
  const handleCellChange = (rowIdx: number, colKey: string, value: string | number) => {
    const newRows = internalRows.map((r, i) =>
      i === rowIdx ? { ...r, [colKey]: value } : r
    )
    emit(columns, newRows)
  }

  const handleAddRow = () => {
    const blank: InternalRow = { _id: crypto.randomUUID() }
    columns.forEach(c => { blank[c.key] = '' })
    emit(columns, [...internalRows, blank])
  }

  const handleDeleteRow = (rowIdx: number) => {
    emit(columns, internalRows.filter((_, i) => i !== rowIdx))
  }

  // ── grid template strings ─────────────────────────────────────────────────
  // Columns section: key (flex-1), label (flex-1), sortable (~40px), delete (~20px)
  const colGridCols = '1fr 1fr 40px 20px'
  // Rows section: one flex-1 per column + delete (20px)
  const rowGridCols = columns.length > 0
    ? `${columns.map(() => '1fr').join(' ')} 20px`
    : '1fr 20px'

  return (
    <div>
      {/* ── Section 1: Columns ─────────────────────────────────────────── */}
      <div className={sectionHeaderClass}>Columns</div>

      {/* Column section header row */}
      <div className="mb-1 grid gap-1" style={{ gridTemplateColumns: colGridCols }}>
        <span className={`px-1 ${headerClass}`}>KEY</span>
        <span className={`px-1 ${headerClass}`}>LABEL</span>
        <span className={`px-1 ${headerClass}`}>SORT</span>
        <span />
      </div>

      {/* Column rows */}
      <div className="flex flex-col gap-1">
        {columns.map((col, idx) => (
          <div key={idx} className="grid items-center gap-1" style={{ gridTemplateColumns: colGridCols }}>
            <input
              type="text"
              className={inputClass}
              value={col.key}
              onChange={e => handleColChange(idx, 'key', e.target.value)}
              placeholder="key"
            />
            <input
              type="text"
              className={inputClass}
              value={col.label}
              onChange={e => handleColChange(idx, 'label', e.target.value)}
              placeholder="label"
            />
            <div className="flex items-center justify-center">
              <input
                type="checkbox"
                checked={col.sortable ?? false}
                onChange={e => handleColChange(idx, 'sortable', e.target.checked)}
                className="cursor-pointer"
              />
            </div>
            <button onClick={() => handleDeleteCol(idx)} className={deleteClass}>×</button>
          </div>
        ))}
      </div>

      <button onClick={handleAddCol} className={addClass}>+ Add column</button>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className={dividerClass} />

      {/* ── Section 2: Rows ────────────────────────────────────────────── */}
      <div className={sectionHeaderClass}>Rows</div>

      {/* Row section header row */}
      {columns.length > 0 && (
        <div className="mb-1 grid gap-1" style={{ gridTemplateColumns: rowGridCols }}>
          {columns.map(col => (
            <span key={col.key} className={`px-1 ${headerClass}`}>{col.key || '—'}</span>
          ))}
          <span />
        </div>
      )}

      {/* Data rows */}
      <div className="flex flex-col gap-1">
        {internalRows.map((row, rowIdx) => (
          <div key={row._id} className="grid items-center gap-1" style={{ gridTemplateColumns: rowGridCols }}>
            {columns.map(col => (
              <input
                key={col.key}
                type="text"
                className={inputClass}
                value={row[col.key] === undefined ? '' : String(row[col.key])}
                onChange={e => handleCellChange(rowIdx, col.key, e.target.value)}
              />
            ))}
            {columns.length === 0 && <span />}
            <button onClick={() => handleDeleteRow(rowIdx)} className={deleteClass}>×</button>
          </div>
        ))}
      </div>

      <button onClick={handleAddRow} className={addClass}>+ Add row</button>
    </div>
  )
}
