'use client'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export interface ColumnDef {
  key: string
  label: string
  type: 'text' | 'number' | 'color'
  width?: number  // fixed px width; omit for flex-1
}

interface Props {
  columns: ColumnDef[]
  rows: Record<string, unknown>[]
  onChange: (rows: Record<string, unknown>[]) => void
  newRowTemplate: Record<string, unknown>
}

export function ArrayRowEditor({ columns, rows, onChange, newRowTemplate }: Props) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const gridCols = `${columns.map(c => c.width ? `${c.width}px` : '1fr').join(' ')} 20px`

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

  const handleCellChange = (rowIdx: number, key: string, value: unknown) => {
    onChange(rows.map((row, i) => i === rowIdx ? { ...row, [key]: value } : row))
  }

  return (
    <div>
      {/* Column headers */}
      <div className="mb-1 grid gap-1" style={{ gridTemplateColumns: gridCols }}>
        {columns.map(col => (
          <span key={col.key} className={`px-1 ${headerClass}`}>{col.label}</span>
        ))}
        <span />
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="grid items-center gap-1" style={{ gridTemplateColumns: gridCols }}>
            {columns.map(col => (
              <div key={col.key}>
                {col.type === 'color' ? (
                  <input
                    type="color"
                    className={`h-7 w-full cursor-pointer rounded border ${
                      isDark ? 'border-[rgba(255,255,255,0.1)]' : 'border-gray-200'
                    }`}
                    value={typeof row[col.key] === 'string' ? (row[col.key] as string) : '#6366f1'}
                    onChange={e => handleCellChange(rowIdx, col.key, e.target.value)}
                  />
                ) : (
                  <input
                    type={col.type === 'number' ? 'number' : 'text'}
                    className={inputClass}
                    value={row[col.key] === undefined ? '' : String(row[col.key])}
                    onChange={e =>
                      handleCellChange(
                        rowIdx,
                        col.key,
                        col.type === 'number'
                          ? (e.target.value === '' ? 0 : Number(e.target.value))
                          : e.target.value,
                      )
                    }
                  />
                )}
              </div>
            ))}
            <button
              onClick={() => onChange(rows.filter((_, i) => i !== rowIdx))}
              className={deleteClass}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => onChange([...rows, { ...newRowTemplate }])}
        className={addClass}
      >
        + Add row
      </button>
    </div>
  )
}
