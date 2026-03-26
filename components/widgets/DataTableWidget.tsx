'use client'
import { useState } from 'react'
import type { WidgetProps, TableConfig } from '@/types/dashboard'
import { ChevronUp, ChevronDown } from 'lucide-react'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export default function DataTableWidget({ config }: WidgetProps) {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'
  const c = config as TableConfig
  const columns = c.columns ?? []
  const rows: Record<string, unknown>[] = (c.rows ?? []) as Record<string, unknown>[]
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey]; const bv = b[sortKey]
        if (av == null || bv == null) return 0
        return sortAsc ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1)
      })
    : rows

  return (
    <div className="flex h-full flex-col overflow-hidden p-4">
      <p className={`mb-2 text-sm font-medium ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className={`border-b ${isDark ? 'border-[rgba(255,255,255,0.08)]' : 'border-gray-200'}`}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`pb-1 text-left font-medium ${isDark ? 'text-[#9ca3af]' : 'text-gray-500'} ${col.sortable ? 'cursor-pointer select-none' : ''}`}
                  onClick={() => {
                    if (!col.sortable) return
                    if (sortKey === col.key) setSortAsc(!sortAsc)
                    else { setSortKey(col.key); setSortAsc(true) }
                  }}
                >
                  <span className="flex items-center gap-0.5">
                    {col.label}
                    {col.sortable && sortKey === col.key && (
                      sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className={
                i % 2 === 0
                  ? (isDark ? 'bg-transparent' : 'bg-white')
                  : (isDark ? 'bg-[rgba(255,255,255,0.04)]' : 'bg-gray-50')
              }>
                {columns.map((col) => (
                  <td key={col.key} className={`py-1 pr-2 ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>
                    {String(row[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
