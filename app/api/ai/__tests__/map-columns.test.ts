/**
 * @jest-environment node
 */
import { POST } from '../map-columns/route'

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}))
jest.mock('ai', () => ({
  generateText: jest.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { generateText } from 'ai'
const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockGenerate = generateText as jest.MockedFunction<typeof generateText>

const validBody = {
  widgetType: 'bar-chart',
  columns: ['month', 'revenue', 'cost'],
  sampleRows: [{ month: 'Jan', revenue: 100, cost: 60 }],
  widgetFields: [
    { key: 'data', label: 'Data rows', type: 'array-of-objects', required: true, description: 'Chart data' },
  ],
}

describe('POST /api/ai/map-columns', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue({ userId: null } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
    const req = new Request('http://localhost/api/ai/map-columns', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 400 when required fields are missing', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
    const req = new Request('http://localhost/api/ai/map-columns', {
      method: 'POST',
      body: JSON.stringify({ widgetType: 'bar-chart' }), // missing columns etc.
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns mapping from AI response', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
    mockGenerate.mockResolvedValue({ text: '{"name":"month","value":"revenue"}' } as Awaited<ReturnType<typeof generateText>>)
    const req = new Request('http://localhost/api/ai/map-columns', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json() as { mapping: Record<string, string> }
    expect(body.mapping).toEqual({ name: 'month', value: 'revenue' })
  })

  it('returns 500 when AI returns unparseable output', async () => {
    mockAuth.mockResolvedValue({ userId: 'user_1' } as ReturnType<typeof auth> extends Promise<infer T> ? T : never)
    mockGenerate.mockResolvedValue({ text: 'not valid json' } as Awaited<ReturnType<typeof generateText>>)
    const req = new Request('http://localhost/api/ai/map-columns', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
