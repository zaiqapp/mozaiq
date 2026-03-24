import { validateDashboardShape } from '../ai'

const validDashboard = {
  name: 'Test Dashboard',
  widgets: [
    { id: 'kpi-1', type: 'kpi', config: { title: 'Revenue', value: 100, change: 5, changeLabel: 'vs last month' } },
  ],
  layout: [{ i: 'kpi-1', x: 0, y: 0, w: 3, h: 2 }],
}

describe('validateDashboardShape', () => {
  it('returns valid dashboard unchanged', () => {
    const result = validateDashboardShape(validDashboard)
    expect(result.name).toBe('Test Dashboard')
    expect(result.widgets).toHaveLength(1)
  })

  it('throws when name is missing', () => {
    expect(() => validateDashboardShape({ ...validDashboard, name: '' })).toThrow()
  })

  it('throws when widgets is empty', () => {
    expect(() => validateDashboardShape({ ...validDashboard, widgets: [] })).toThrow()
  })

  it('throws on duplicate widget ids', () => {
    const dup = {
      ...validDashboard,
      widgets: [validDashboard.widgets[0], validDashboard.widgets[0]],
      layout: [validDashboard.layout[0], validDashboard.layout[0]],
    }
    expect(() => validateDashboardShape(dup)).toThrow()
  })

  it('throws when layout i does not match any widget id', () => {
    const bad = {
      ...validDashboard,
      layout: [{ i: 'nonexistent', x: 0, y: 0, w: 3, h: 2 }],
    }
    expect(() => validateDashboardShape(bad)).toThrow()
  })

  it('strips unknown top-level keys', () => {
    const result = validateDashboardShape({ ...validDashboard, extraKey: 'value' } as unknown as typeof validDashboard)
    expect((result as unknown as Record<string, unknown>)['extraKey']).toBeUndefined()
  })
})
