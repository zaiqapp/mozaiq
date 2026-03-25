import { prisma } from './prisma'

export async function isGenerationLimitReached(
  ip: string | null,
  userId: string | null,
): Promise<boolean> {
  const raw = process.env.AI_GENERATION_LIMIT
  const limit = raw === '0' ? null : (parseInt(raw ?? '2', 10) || 2)
  if (limit === null) return false
  if (userId) {
    const count = await prisma.generationLog.count({
      where: { userId, success: true },
    })
    return count >= limit
  }
  if (ip) {
    const count = await prisma.generationLog.count({
      where: { ip, success: true },
    })
    return count >= limit
  }
  return false
}
