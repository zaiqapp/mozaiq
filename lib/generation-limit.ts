import { prisma } from './prisma'

const LIMIT = parseInt(process.env.AI_GENERATION_LIMIT ?? '2', 10)

export async function isGenerationLimitReached(
  ip: string | null,
  userId: string | null,
): Promise<boolean> {
  if (userId) {
    const count = await prisma.generationLog.count({
      where: { userId, success: true },
    })
    return count >= LIMIT
  }
  if (ip) {
    const count = await prisma.generationLog.count({
      where: { ip, success: true },
    })
    return count >= LIMIT
  }
  return false
}
