/**
 * @jest-environment node
 */
import { POST } from '../insights/route'

jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }))
jest.mock('ai', () => ({ generateText: jest.fn() }))
jest.mock('@/lib/prisma', () => ({
  prisma: { generationLog: { create: jest.fn().mockResolvedValue({}) } },
}))
jest.mock('@/lib/generation-limit', () => ({
  isGenerationLimitReached: jest.fn(),
}))

import { auth } from '@clerk/nextjs/server'
import { generateText } from 'ai'
import { isGenerationLimitReached } from '@/lib/generation-limit'

const mockAuth = auth as jest.MockedFunction<typeof auth>
const mockGenerate = generateText as jest.MockedFunction<typeof generateText>
const mockLimited = isGenerationLimitReached as jest.MockedFunction<typeof isGenerationLimitReached>

const validBody = {
  widgetType: 'kpi',
  config: { title: 'Revenue', value: 84200, change: 12.4, changeLabel: 'vs last month' },
}

describe('POST /api/ai/insights', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'user_1' } as Awaited<ReturnType<typeof auth>>)
    mockLimited.mockResolvedValue(false)
  })

  it('returns 400 when widgetType is missing', async () => {
    const req = new Request('http://localhost/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify({ config: {} }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when config is missing', async () => {
    const req = new Request('http://localhost/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify({ widgetType: 'kpi' }),
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 429 when rate limited', async () => {
    mockLimited.mockResolvedValue(true)
    const req = new Request('http://localhost/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(429)
  })

  it('returns 200 with insight string from AI', async () => {
    mockGenerate.mockResolvedValue({
      text: 'Revenue peaked in April at $84.2K.',
    } as Awaited<ReturnType<typeof generateText>>)
    const req = new Request('http://localhost/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json() as { insight: string }
    expect(body.insight).toBe('Revenue peaked in April at $84.2K.')
  })

  it('returns 500 when AI throws', async () => {
    mockGenerate.mockRejectedValue(new Error('AI error'))
    const req = new Request('http://localhost/api/ai/insights', {
      method: 'POST',
      body: JSON.stringify(validBody),
    })
    const res = await POST(req)
    expect(res.status).toBe(500)
  })
})
