import { parseCsvText } from '@/lib/parse-csv'

export const dynamic = 'force-dynamic'

// Match spreadsheet IDs in Google Sheets URLs
const SHEET_ID_REGEX = /\/spreadsheets\/d\/([\w-]+)/

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function extractSheetId(input: string): string | null {
  const match = SHEET_ID_REGEX.exec(input)
  if (match) return match[1] ?? null
  // Accept a bare ID (no slashes, alphanumeric+dash)
  if (/^[\w-]+$/.test(input) && input.length > 10) return input
  return null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const rawUrl = searchParams.get('url')
  const gid = searchParams.get('gid')

  if (!rawUrl) {
    return json({ error: 'url parameter is required' }, 400)
  }

  const sheetId = extractSheetId(rawUrl)
  if (!sheetId) {
    return json({ error: 'Not a valid Google Sheets URL' }, 400)
  }

  const exportUrl = new URL(`https://docs.google.com/spreadsheets/d/${sheetId}/export`)
  exportUrl.searchParams.set('format', 'csv')
  if (gid) exportUrl.searchParams.set('gid', gid)

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const upstream = await fetch(exportUrl.toString(), { signal: controller.signal })
    if (!upstream.ok) {
      return json({ error: 'Sheet not found or not public' }, 502)
    }
    const text = await upstream.text()
    const { columns, rows, warning, error } = parseCsvText(text)
    if (error) {
      return json({ error }, 502)
    }
    return json({ columns, rows, warning })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream fetch failed'
    return json({ error: message }, 502)
  } finally {
    clearTimeout(timeout)
  }
}
