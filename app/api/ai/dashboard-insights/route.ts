import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isGenerationLimitReached } from '@/lib/generation-limit'
import {
  DASHBOARD_INSIGHT_SYSTEM_PROMPT,
  buildDashboardUserMessage,
} from '@/lib/ai-insights'

export async function POST(req: Request) {
  const body = await req.json() as {
    dashboardName?: string
    widgets?: Array<{ type: string; config: unknown }>
  }
  const { dashboardName = '', widgets } = body

  if (!widgets || !Array.isArray(widgets) || widgets.length === 0) {
    return NextResponse.json({ error: 'widgets array with at least one item is required' }, { status: 400 })
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
      system: DASHBOARD_INSIGHT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildDashboardUserMessage(dashboardName, widgets) }],
      maxOutputTokens: 600,
      providerOptions: {
        gateway: { tags: ['feature:dashboard-insight'], user: clientIp ?? undefined },
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
        prompt: buildDashboardUserMessage(dashboardName, widgets),
        success,
        widgetCount: widgets.length,
        ip: clientIp,
        ...(userId ? { userId } : {}),
      },
    }).catch(() => { /* non-blocking */ })
  }
}
