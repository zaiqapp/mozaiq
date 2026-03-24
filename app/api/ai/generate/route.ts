import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { SYSTEM_PROMPT, validateDashboardShape } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const { prompt } = await req.json() as { prompt?: string }
  if (!prompt?.trim()) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const clientIp = req.headers.get('x-forwarded-for') ?? 'unknown'

  let success = false
  let widgetCount: number | undefined

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-sonnet-4.5',
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
      maxOutputTokens: 2000,
      providerOptions: {
        gateway: {
          tags: ['feature:ai-generate'],
          user: clientIp,
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
      data: { prompt, success, widgetCount },
    }).catch(() => { /* non-blocking */ })
  }
}
