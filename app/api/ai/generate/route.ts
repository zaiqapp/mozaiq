import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { auth } from '@clerk/nextjs/server'
import { SYSTEM_PROMPT, validateDashboardShape } from '@/lib/ai'
import { prisma } from '@/lib/prisma'
import { isGenerationLimitReached } from '@/lib/generation-limit'

export async function POST(req: Request) {
  const { prompt } = await req.json() as { prompt?: string }
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const { userId } = await auth()

  // Rate limit check before calling the model
  const limited = await isGenerationLimitReached(clientIp, userId ?? null)
  if (limited) {
    const message = userId
      ? "You've used your free AI generations. Upgrade to Pro for unlimited."
      : "You've used your free AI generations. Sign up to get more."
    return NextResponse.json({ error: message }, { status: 429 })
  }

  let success = false
  let widgetCount: number | undefined

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-opus-4.6',
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
      maxOutputTokens: 2000,
      providerOptions: {
        gateway: {
          tags: ['feature:ai-generate'],
          user: clientIp ?? undefined,
        },
      },
    })

    const raw = JSON.parse(text) as unknown
    const dashboard = validateDashboardShape(raw)
    widgetCount = dashboard.widgets.length
    success = true

    return NextResponse.json({ dashboard })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    await prisma.generationLog.create({
      data: {
        prompt,
        success,
        widgetCount,
        ip: clientIp,
        ...(userId ? { userId } : {}),
      },
    }).catch(() => { /* non-blocking */ })
  }
}
