import { renderHook, act, waitFor } from '@testing-library/react'
import { useDataSource } from '../useDataSource'
import type { Widget } from '@/types/dashboard'

const csvWidget: Widget = {
  id: 'w1', type: 'bar-chart',
  config: { title: 'Test', dataKey: 'value' },
  dataSource: {
    type: 'csv',
    data: [{ name: 'A', value: 10 }],
    mapping: { name: 'name', value: 'value' },
  },
}

const noSourceWidget: Widget = {
  id: 'w2', type: 'kpi',
  config: { title: 'KPI', value: 0, change: 0, changeLabel: '' },
}

const sheetsWidget: Widget = {
  id: 'w3', type: 'line-chart',
  config: { title: 'Line', dataKey: 'value' },
  dataSource: {
    type: 'google-sheets',
    url: 'https://docs.google.com/spreadsheets/d/abc123/edit',
    refreshInterval: 0,
    mapping: { name: 'month', value: 'revenue' },
  },
}

describe('useDataSource', () => {
  it('returns null rows for widget with no dataSource', () => {
    const { result } = renderHook(() => useDataSource(noSourceWidget))
    expect(result.current.rows).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns inline data immediately for CSV source', () => {
    const { result } = renderHook(() => useDataSource(csvWidget))
    expect(result.current.rows).toEqual([{ name: 'A', value: 10 }])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it('fetches from proxy for Google Sheets source', async () => {
    const mockRows = [{ month: 'Jan', revenue: 100 }]
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ columns: ['month', 'revenue'], rows: mockRows }),
    } as Response)

    const { result } = renderHook(() => useDataSource(sheetsWidget))
    expect(result.current.isLoading).toBe(true)

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.rows).toEqual(mockRows)
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/data/google-sheets?url=')
    )
  })

  it('keeps stale rows and sets error on fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    const { result } = renderHook(() => useDataSource(sheetsWidget))
    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.error).toBeTruthy()
    expect(result.current.rows).toBeNull() // no stale rows on first load
  })

  it('does not poll when refreshInterval is 0', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true, json: async () => ({ columns: [], rows: [] }),
    } as Response)
    renderHook(() => useDataSource(sheetsWidget)) // refreshInterval: 0
    await waitFor(() => {}) // let effects settle
    // fetch called once on mount only
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
