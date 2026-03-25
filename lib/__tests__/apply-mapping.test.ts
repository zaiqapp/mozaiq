import { applyMapping } from '../apply-mapping'

const rows = [
  { month: 'Jan', revenue: 120, cost: 80 },
  { month: 'Feb', revenue: 200, cost: 90 },
]

describe('applyMapping — number type', () => {
  it('extracts number from first row', () => {
    const result = applyMapping('value', 'number', rows, { value: 'revenue' })
    expect(result).toBe(120)
  })

  it('returns null when column not in mapping', () => {
    expect(applyMapping('value', 'number', rows, {})).toBeNull()
  })

  it('returns null when column missing from rows', () => {
    expect(applyMapping('value', 'number', rows, { value: 'nonexistent' })).toBeNull()
  })

  it('returns null for NaN result', () => {
    const textRows = [{ x: 'hello' }]
    expect(applyMapping('value', 'number', textRows, { value: 'x' })).toBeNull()
  })

  it('returns null for empty rows', () => {
    expect(applyMapping('value', 'number', [], { value: 'revenue' })).toBeNull()
  })
})

describe('applyMapping — string type', () => {
  it('extracts string from first row', () => {
    expect(applyMapping('content', 'string', rows, { content: 'month' })).toBe('Jan')
  })

  it('returns null when not mapped', () => {
    expect(applyMapping('content', 'string', rows, {})).toBeNull()
  })
})

describe('applyMapping — array-of-objects (chart rename mode)', () => {
  it('renames columns for chart widgets (name + value)', () => {
    const result = applyMapping('data', 'array-of-objects', rows, { name: 'month', value: 'revenue' }) as Record<string, unknown>[]
    expect(result).toEqual([
      { name: 'Jan', value: 120 },
      { name: 'Feb', value: 200 },
    ])
  })

  it('returns null when rows is empty', () => {
    expect(applyMapping('data', 'array-of-objects', [], { name: 'month', value: 'revenue' })).toBeNull()
  })

  it('returns null when mapping is empty', () => {
    expect(applyMapping('data', 'array-of-objects', rows, {})).toBeNull()
  })
})

describe('applyMapping — array-of-objects (data-table pass-through mode)', () => {
  it('passes through rows with source column names for data-table (fieldKey=rows)', () => {
    const mapping = { Name: 'month', Revenue: 'revenue' }
    const result = applyMapping('rows', 'array-of-objects', rows, mapping) as Record<string, unknown>[]
    // pass-through: rows keep original column names, only mapped columns included
    expect(result[0]).toHaveProperty('month')
    expect(result[0]).toHaveProperty('revenue')
    expect(result[0]).not.toHaveProperty('cost') // not in mapping values
  })
})

describe('applyMapping — activity-feed id coercion', () => {
  it('coerces missing id to string row index', () => {
    const eventRows = [{ label: 'Login', time: '2min ago' }]
    const result = applyMapping('events', 'array-of-objects', eventRows, { label: 'label', time: 'time' }) as Record<string, unknown>[]
    expect(typeof result[0].id).toBe('string')
    expect(result[0].id).toBe('0')
  })
})
