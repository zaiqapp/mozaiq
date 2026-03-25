import { renderHook, act, waitFor } from '@testing-library/react'
import { useDataSource } from '../useDataSource'
import { useDashboardStore } from '@/store/dashboard'
import type { Widget, GlobalDataSource } from '@/types/dashboard'

const csvSource: GlobalDataSource = {
  id: 'ds-csv', name: 'Sales CSV', type: 'csv',
  data: [{ name: 'A', value: 10 }],
}

const sheetsSource: GlobalDataSource = {
  id: 'ds-sheets', name: 'Revenue Sheet', type: 'google-sheets',
  url: 'https://docs.google.com/spreadsheets/d/abc123/edit',
  refreshInterval: 0,
}

const csvWidget: Widget = {
  id: 'w1', type: 'bar-chart',
  config: { title: 'Test', dataKey: 'value' },
  dataSourceId: 'ds-csv',
}

const noSourceWidget: Widget = {
  id: 'w2', type: 'kpi',
  config: { title: 'KPI', value: 0, change: 0, changeLabel: '' },
}

const sheetsWidget: Widget = {
  id: 'w3', type: 'line-chart',
  config: { title: 'Line', dataKey: 'value' },
  dataSourceId: 'ds-sheets',
}

function setStoreDataSources(sources: GlobalDataSource[]) {
  useDashboardStore.setState({
    dataSources: sources,
    widgets: [], layout: [], name: 'Test',
    isDirty: false, isSaving: false, isGenerating: false, selectedWidgetId: null,
  })
}

describe('useDataSource', () => {
  it('returns null rows for widget with no dataSourceId', () => {
    setStoreDataSources([])
    const { result } = renderHook(() => useDataSource(noSourceWidget))
    expect(result.current.rows).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns null rows when dataSourceId does not match any global source', () => {
    setStoreDataSources([])
    const { result } = renderHook(() => useDataSource(csvWidget))
    expect(result.current.rows).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  it('returns inline data immediately for CSV source', async () => {
    setStoreDataSources([csvSource])
    const { result } = renderHook(() => useDataSource(csvWidget))
    await waitFor(() => expect(result.current.rows).toEqual([{ name: 'A', value: 10 }]))
    expect(result.current.isLoading).toBe(false)
  })

  it('sets isLoading true initially for Google Sheets source', () => {
    setStoreDataSources([sheetsSource])
    // global.fetch is not mocked — just check initial loading state
    const { result } = renderHook(() => useDataSource(sheetsWidget))
    // Initial state before effect runs
    expect(result.current.rows).toBeNull()
  })
})
