import { act, renderHook } from '@testing-library/react'
import { useDashboardStore } from '../dashboard'

describe('useDashboardStore', () => {
  beforeEach(() => {
    useDashboardStore.setState({
      name: 'Test', widgets: [], layout: [],
      isDirty: false, isSaving: false, isGenerating: false,
      selectedWidgetId: null,
    })
  })

  it('addWidget adds a widget with registry default size', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addWidget('kpi'))
    expect(result.current.widgets).toHaveLength(1)
    expect(result.current.widgets[0]!.type).toBe('kpi')
    expect(result.current.layout[0]!.w).toBe(3)
    expect(result.current.layout[0]!.h).toBe(2)
    expect(result.current.isDirty).toBe(true)
  })

  it('removeWidget removes the widget and its layout item', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addWidget('kpi'))
    const id = result.current.widgets[0]!.id
    act(() => result.current.removeWidget(id))
    expect(result.current.widgets).toHaveLength(0)
    expect(result.current.layout).toHaveLength(0)
  })

  it('selectWidget sets selectedWidgetId', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.selectWidget('abc'))
    expect(result.current.selectedWidgetId).toBe('abc')
  })

  it('clearCanvas resets widgets and layout', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addWidget('kpi'))
    act(() => result.current.clearCanvas())
    expect(result.current.widgets).toHaveLength(0)
    expect(result.current.layout).toHaveLength(0)
    expect(result.current.selectedWidgetId).toBeNull()
  })

  it('updateWidgetConfig updates only the specified widget', () => {
    const { result } = renderHook(() => useDashboardStore())
    act(() => result.current.addWidget('kpi'))
    const id = result.current.widgets[0]!.id
    act(() => result.current.updateWidgetConfig(id, { title: 'Revenue' }))
    expect(result.current.widgets[0]!.config.title).toBe('Revenue')
  })
})
