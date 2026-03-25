import Papa from 'papaparse'

export interface ParseCsvResult {
  columns: string[]
  rows: Record<string, unknown>[]
  error?: string
  warning?: string
}

const MAX_ROWS = 10_000

export function parseCsvText(text: string): ParseCsvResult {
  if (!text.trim()) return { columns: [], rows: [], error: 'CSV is empty' }

  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
    worker: false,
  })

  if (result.errors.length > 0 && result.data.length === 0) {
    const firstError = result.errors[0]
    return { columns: [], rows: [], error: firstError?.message ?? 'Parse error' }
  }

  const columns = result.meta.fields ?? []
  if (columns.length === 0) {
    return { columns: [], rows: [], error: 'No header row found' }
  }

  let rows = result.data
  let warning: string | undefined
  if (rows.length > MAX_ROWS) {
    rows = rows.slice(0, MAX_ROWS)
    warning = `File truncated to ${MAX_ROWS.toLocaleString()} rows`
  }

  return { columns, rows, warning }
}
