import { prisma } from './prisma'

export async function isGenerationLimitReached(
  ip: string | null,
  userId: string | null,
): Promise<boolean> {
  const limit = parseInt(process.env.AI_GENERATION_LIMIT ?? '2', 10) || 2
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
