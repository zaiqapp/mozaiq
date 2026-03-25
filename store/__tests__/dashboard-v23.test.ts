import { act, renderHook } from '@testing-library/react'
import { useDashboardStore } from '../dashboard'
import type { GlobalDataSource, AxisMapping } from '@/types/dashboard'

const ds1: GlobalDataSource = {
  id: 'ds1', name: 'Sales', type: 'csv',
  data: [{ month: 'Jan', revenue: 100 }],
  fileName: 'sales.csv',
}

const ds2: GlobalDataSource = {
  id: 'ds2', name: 'Sheet', type: 'google-sheets',
  url: 'https://docs.google.com/spreadsheets/d/abc/edit',
}

function resetStore() {
  useDashboardStore.setState({
    name: 'Test', widgets: [], layout: [], dataSources: [],
    isDirty: false, isSaving: false, isGenerating: false, selectedWidgetId: null,
  })
}

describe('addGlobalDataSource', () => {
  beforeEach(resetStore)

  it('adds a source to dataSources', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addGlobalDataSource(ds1))
    expect(result.current.dataSources).toHaveLength(1)
    expect(result.current.dataSources[0]!.id).toBe('ds1')
    expect(result.current.isDirty).toBe(true)
  })
})

describe('updateGlobalDataSource', () => {
  beforeEach(resetStore)

  it('patches an existing source by id', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addGlobalDataSource(ds1))
    act(() => result.current.updateGlobalDataSource('ds1', { name: 'Renamed' }))
    expect(result.current.dataSources[0]!.name).toBe('Renamed')
  })
})

describe('removeGlobalDataSource', () => {
  beforeEach(resetStore)

  it('removes the source and clears widget references', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addGlobalDataSource(ds1))
    act(() => result.current.addWidget('kpi'))
    const widgetId = result.current.widgets[0]!.id
    act(() => result.current.updateWidgetDataSourceId(widgetId, 'ds1'))
    act(() => result.current.updateWidgetMapping(widgetId, { value: { column: 'revenue' } }))
    act(() => result.current.removeGlobalDataSource('ds1'))
    expect(result.current.dataSources).toHaveLength(0)
    expect(result.current.widgets[0]!.dataSourceId).toBeUndefined()
    expect(result.current.widgets[0]!.dataSourceMapping).toBeUndefined()
  })
})

describe('updateWidgetDataSourceId', () => {
  beforeEach(resetStore)

  it('sets dataSourceId on the widget', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addWidget('bar-chart'))
    const widgetId = result.current.widgets[0]!.id
    act(() => result.current.updateWidgetDataSourceId(widgetId, 'ds1'))
    expect(result.current.widgets[0]!.dataSourceId).toBe('ds1')
    expect(result.current.isDirty).toBe(true)
  })

  it('clears dataSourceId when passed undefined', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addWidget('bar-chart'))
    const widgetId = result.current.widgets[0]!.id
    act(() => result.current.updateWidgetDataSourceId(widgetId, 'ds1'))
    act(() => result.current.updateWidgetDataSourceId(widgetId, undefined))
    expect(result.current.widgets[0]!.dataSourceId).toBeUndefined()
  })
})

describe('updateWidgetMapping', () => {
  beforeEach(resetStore)

  it('sets dataSourceMapping on the widget', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addWidget('bar-chart'))
    const widgetId = result.current.widgets[0]!.id
    const mapping: Record<string, AxisMapping> = { data: { column: 'revenue', displayName: 'Revenue' } }
    act(() => result.current.updateWidgetMapping(widgetId, mapping))
    expect(result.current.widgets[0]!.dataSourceMapping).toEqual(mapping)
    expect(result.current.isDirty).toBe(true)
  })
})

describe('loadDashboard migration', () => {
  beforeEach(resetStore)

  it('migrates legacy dataSource on a widget to a global source', () => {
    const { result } = renderHook(() => useDashboardStore())
    const legacyWidget = {
      id: 'w1', type: 'bar-chart' as const,
      config: { title: 'Chart', dataKey: 'value' },
      dataSource: {
        type: 'csv' as const,
        data: [{ month: 'Jan', revenue: 100 }],
        fileName: 'sales.csv',
        mapping: { name: 'month', value: 'revenue' },
      },
    }
    act(() => result.current.loadDashboard({ name: 'Test', widgets: [legacyWidget as never], layout: [] }))
    expect(result.current.dataSources).toHaveLength(1)
    expect(result.current.dataSources[0]!.name).toBe('sales.csv')
    expect(result.current.widgets[0]!.dataSourceId).toBe(result.current.dataSources[0]!.id)
    expect(result.current.widgets[0]!.dataSourceMapping).toEqual({
      name: { column: 'month' },
      value: { column: 'revenue' },
    })
    expect((result.current.widgets[0] as never as { dataSource?: unknown }).dataSource).toBeUndefined()
  })

  it('deduplicates when two widgets reference the same CSV file', () => {
    const { result } = renderHook(() => useDashboardStore())
    const w1 = { id: 'w1', type: 'bar-chart' as const, config: { title: 'A', dataKey: 'value' }, dataSource: { type: 'csv' as const, fileName: 'sales.csv', data: [] } }
    const w2 = { id: 'w2', type: 'kpi' as const, config: { title: 'B', value: 0, change: 0, changeLabel: '' }, dataSource: { type: 'csv' as const, fileName: 'sales.csv', data: [] } }
    act(() => result.current.loadDashboard({ name: 'Test', widgets: [w1 as never, w2 as never], layout: [] }))
    expect(result.current.dataSources).toHaveLength(1)
    expect(result.current.widgets[0]!.dataSourceId).toBe(result.current.widgets[1]!.dataSourceId)
  })

  it('keeps pre-existing dataSources and does not duplicate them', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.loadDashboard({
      name: 'Test',
      widgets: [],
      layout: [],
      dataSources: [ds1, ds2],
    }))
    expect(result.current.dataSources).toHaveLength(2)
  })
})
