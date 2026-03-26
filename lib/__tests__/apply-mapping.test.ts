import { applyMapping } from '../apply-mapping'
import type { AxisMapping } from '@/types/dashboard'

const rows = [
  { month: 'Jan', revenue: 120, cost: 80 },
  { month: 'Feb', revenue: 200, cost: 90 },
]

// Helper: build AxisMapping from plain fieldKey → column pairs
function m(pairs: Record<string, string>): Record<string, AxisMapping> {
  return Object.fromEntries(Object.entries(pairs).map(([k, v]) => [k, { column: v }]))
}

describe('applyMapping — number type', () => {
  it('sums all row values', () => {
    expect(applyMapping('value', 'number', rows, m({ value: 'revenue' }))).toBe(320)
  })

  it('returns null when column not in mapping', () => {
    expect(applyMapping('value', 'number', rows, {})).toBeNull()
  })

  it('returns null when column missing from rows', () => {
    expect(applyMapping('value', 'number', rows, m({ value: 'nonexistent' }))).toBeNull()
  })

  it('returns null for NaN result', () => {
    const textRows = [{ x: 'hello' }]
    expect(applyMapping('value', 'number', textRows, m({ value: 'x' }))).toBeNull()
  })

  it('returns null for empty rows', () => {
    expect(applyMapping('value', 'number', [], m({ value: 'revenue' }))).toBeNull()
  })
})

describe('applyMapping — string type', () => {
  it('extracts string from first row', () => {
    expect(applyMapping('content', 'string', rows, m({ content: 'month' }))).toBe('Jan')
  })

  it('returns null when not mapped', () => {
    expect(applyMapping('content', 'string', rows, {})).toBeNull()
  })
})

describe('applyMapping — array-of-objects (chart rename mode)', () => {
  it('renames columns using AxisMapping.column', () => {
    const result = applyMapping('data', 'array-of-objects', rows, m({ name: 'month', value: 'revenue' })) as Record<string, unknown>[]
    expect(result).toEqual([
      { name: 'Jan', value: 120 },
      { name: 'Feb', value: 200 },
    ])
  })

  it('returns null when rows is empty', () => {
    expect(applyMapping('data', 'array-of-objects', [], m({ name: 'month', value: 'revenue' }))).toBeNull()
  })

  it('returns null when mapping is empty', () => {
    expect(applyMapping('data', 'array-of-objects', rows, {})).toBeNull()
  })
})

describe('applyMapping — array-of-objects (data-table pass-through mode)', () => {
  it('filters to mapped columns only, keeping source column names', () => {
    const mapping: Record<string, AxisMapping> = {
      Name: { column: 'month' },
      Revenue: { column: 'revenue' },
    }
    const result = applyMapping('rows', 'array-of-objects', rows, mapping) as Record<string, unknown>[]
    expect(result[0]).toHaveProperty('month')
    expect(result[0]).toHaveProperty('revenue')
    expect(result[0]).not.toHaveProperty('cost')
  })
})

describe('applyMapping — activity-feed id coercion', () => {
  it('coerces missing id to string row index', () => {
    const eventRows = [{ label: 'Login', time: '2min ago' }]
    const result = applyMapping('events', 'array-of-objects', eventRows, m({ label: 'label', time: 'time' })) as Record<string, unknown>[]
    expect(typeof result[0]!.id).toBe('string')
    expect(result[0]!.id).toBe('0')
  })
})
