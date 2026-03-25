import { isGenerationLimitReached } from '../generation-limit'

// Mock Prisma
jest.mock('../prisma', () => ({
  prisma: {
    generationLog: {
      count: jest.fn(),
    },
  },
}))

import { prisma } from '../prisma'
const mockCount = prisma.generationLog.count as jest.MockedFunction<typeof prisma.generationLog.count>

describe('isGenerationLimitReached', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default limit is 2 (AI_GENERATION_LIMIT not set in test env)
    delete process.env.AI_GENERATION_LIMIT
  })

  it('returns false when authenticated user is under limit', async () => {
    mockCount.mockResolvedValue(1)
    const result = await isGenerationLimitReached(null, 'user_abc')
    expect(result).toBe(false)
    expect(mockCount).toHaveBeenCalledWith({ where: { userId: 'user_abc', success: true } })
  })

  it('returns true when authenticated user is at limit', async () => {
    mockCount.mockResolvedValue(2)
    const result = await isGenerationLimitReached(null, 'user_abc')
    expect(result).toBe(true)
  })

  it('returns false when anonymous user is under limit', async () => {
    mockCount.mockResolvedValue(0)
    const result = await isGenerationLimitReached('1.2.3.4', null)
    expect(result).toBe(false)
    expect(mockCount).toHaveBeenCalledWith({ where: { ip: '1.2.3.4', success: true } })
  })

  it('returns true when anonymous user is at limit', async () => {
    mockCount.mockResolvedValue(2)
    const result = await isGenerationLimitReached('1.2.3.4', null)
    expect(result).toBe(true)
  })

  it('prefers userId check over IP when both present', async () => {
    mockCount.mockResolvedValue(0)
    await isGenerationLimitReached('1.2.3.4', 'user_abc')
    expect(mockCount).toHaveBeenCalledWith({ where: { userId: 'user_abc', success: true } })
  })

  it('respects AI_GENERATION_LIMIT env var', async () => {
    process.env.AI_GENERATION_LIMIT = '5'
    mockCount.mockResolvedValue(4)
    expect(await isGenerationLimitReached(null, 'user_abc')).toBe(false)
    mockCount.mockResolvedValue(5)
    expect(await isGenerationLimitReached(null, 'user_abc')).toBe(true)
  })

  it('returns false when both ip and userId are null', async () => {
    const result = await isGenerationLimitReached(null, null)
    expect(result).toBe(false)
    expect(mockCount).not.toHaveBeenCalled()
  })
})
