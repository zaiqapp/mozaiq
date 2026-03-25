/**
 * @jest-environment node
 */
// Helper to call the route handler directly
import { GET } from '../google-sheets/route'

// Mock parseCsvText
jest.mock('@/lib/parse-csv', () => ({
  parseCsvText: jest.fn(() => ({
    columns: ['month', 'revenue'],
    rows: [{ month: 'Jan', revenue: 100 }],
  })),
}))

// Mock global fetch
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('GET /api/data/google-sheets', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 400 when url param is missing', async () => {
    const req = new Request('http://localhost/api/data/google-sheets')
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 for non-Google-Sheets URL', async () => {
    const req = new Request('http://localhost/api/data/google-sheets?url=' + encodeURIComponent('https://example.com/file.csv'))
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  it('extracts spreadsheet ID and fetches CSV export', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => 'month,revenue\nJan,100',
    })
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/abc123XYZ/edit#gid=0'
    const req = new Request('http://localhost/api/data/google-sheets?url=' + encodeURIComponent(sheetUrl))
    const res = await GET(req)
    expect(res.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('abc123XYZ'),
      expect.any(Object)
    )
    const body = await res.json() as { columns: string[] }
    expect(body.columns).toEqual(['month', 'revenue'])
  })

  it('returns 502 when upstream fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/abc123/edit'
    const req = new Request('http://localhost/api/data/google-sheets?url=' + encodeURIComponent(sheetUrl))
    const res = await GET(req)
    expect(res.status).toBe(502)
  })

  it('returns 502 when sheet is not public (non-200 upstream)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 403 })
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/abc123/edit'
    const req = new Request('http://localhost/api/data/google-sheets?url=' + encodeURIComponent(sheetUrl))
    const res = await GET(req)
    expect(res.status).toBe(502)
  })

  it('passes gid param to export URL', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => 'a,b\n1,2',
    })
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/abc123/edit'
    const req = new Request('http://localhost/api/data/google-sheets?url=' + encodeURIComponent(sheetUrl) + '&gid=999')
    await GET(req)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('gid=999'),
      expect.any(Object)
    )
  })
})
