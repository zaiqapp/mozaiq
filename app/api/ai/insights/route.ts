import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isGenerationLimitReached } from '@/lib/generation-limit'
import {
  WIDGET_INSIGHT_SYSTEM_PROMPT,
  buildWidgetUserMessage,
} from '@/lib/ai-insights'
import type { WidgetConfig, WidgetType } from '@/types/dashboard'

export async function POST(req: Request) {
  const body = await req.json() as { widgetType?: WidgetType; config?: WidgetConfig }
  const { widgetType, config } = body

  if (!widgetType || config === undefined) {
    return NextResponse.json({ error: 'widgetType and config are required' }, { status: 400 })
  }

  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
  const { userId } = await auth()

  const limited = await isGenerationLimitReached(clientIp, userId ?? null)
  if (limited) {
    const message = userId
      ? "You've used your free AI generations. Upgrade to Pro for unlimited."
      : "You've used your free AI generations. Sign up to get more."
    return NextResponse.json({ error: message }, { status: 429 })
  }

  let success = false

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      system: WIDGET_INSIGHT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildWidgetUserMessage(widgetType, config) }],
      maxOutputTokens: 400,
      providerOptions: {
        gateway: { tags: ['feature:widget-insight'], user: clientIp ?? undefined },
      },
    })

    success = true
    return NextResponse.json({ insight: text.trim() })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    prisma.generationLog.create({
      data: {
        prompt: buildWidgetUserMessage(widgetType, config),
        success,
        ip: clientIp,
        ...(userId ? { userId } : {}),
      },
    }).catch(() => { /* non-blocking */ })
  }
}
