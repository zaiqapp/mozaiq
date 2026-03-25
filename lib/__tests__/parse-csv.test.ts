import { parseCsvText } from '../parse-csv'

describe('parseCsvText', () => {
  it('parses basic CSV with header row', () => {
    const csv = 'name,value\nAlice,10\nBob,20'
    const result = parseCsvText(csv)
    expect(result.error).toBeUndefined()
    expect(result.columns).toEqual(['name', 'value'])
    expect(result.rows).toEqual([
      { name: 'Alice', value: 10 },
      { name: 'Bob', value: 20 },
    ])
  })

  it('uses dynamic typing — numbers parsed as numbers', () => {
    const csv = 'x\n42\n3.14'
    const { rows } = parseCsvText(csv)
    expect(typeof rows[0].x).toBe('number')
    expect(rows[1].x).toBeCloseTo(3.14)
  })

  it('skips empty lines', () => {
    const csv = 'a,b\n1,2\n\n3,4'
    const { rows } = parseCsvText(csv)
    expect(rows).toHaveLength(2)
  })

  it('returns error on malformed CSV (no headers)', () => {
    const { error } = parseCsvText('')
    expect(error).toBeDefined()
  })

  it('truncates at 10000 rows and sets warning', () => {
    const header = 'n\n'
    const rows = Array.from({ length: 10005 }, (_, i) => `${i}`).join('\n')
    const { rows: parsed, warning } = parseCsvText(header + rows)
    expect(parsed).toHaveLength(10000)
    expect(warning).toMatch(/truncated/i)
  })
})
