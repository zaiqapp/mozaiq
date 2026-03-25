import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { isGenerationLimitReached } from '@/lib/generation-limit'
import { validateGeneratedWidgets, GENERATE_WIDGETS_SYSTEM_PROMPT } from '@/lib/ai-generate-widgets'
import { widgetRegistry } from '@/lib/widget-registry'
import type { WidgetType, WidgetConfig } from '@/types/dashboard'

export async function POST(req: Request) {
  const body = await req.json() as {
    dataSourceId?: string
    columns?: string[]
    sampleRows?: Record<string, unknown>[]
    prompt?: string
  }

  const { dataSourceId, columns, sampleRows, prompt } = body

  if (!dataSourceId || !columns?.length || !prompt?.trim()) {
    return NextResponse.json({ error: 'dataSourceId, columns, and prompt are required' }, { status: 400 })
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
  let widgetCount: number | undefined

  try {
    const userMessage = `Columns: ${columns.join(', ')}\n\nSample data:\n${JSON.stringify(sampleRows?.slice(0, 5) ?? [], null, 2)}\n\nUser request: ${prompt}`

    const { text } = await generateText({
      model: 'anthropic/claude-sonnet-4.6',
      system: GENERATE_WIDGETS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
      maxOutputTokens: 3000,
      providerOptions: {
        gateway: {
          tags: ['feature:generate-widgets'],
          user: clientIp ?? undefined,
        },
      },
    })

    const raw = JSON.parse(text) as unknown
    const validated = validateGeneratedWidgets(raw, dataSourceId, columns)

    if (validated.length === 0) {
      return NextResponse.json({ error: 'AI could not generate valid widgets for this data' }, { status: 500 })
    }

    // Merge with widget defaults so config is always complete
    const widgets = validated.map((w) => ({
      ...w,
      config: {
        ...(widgetRegistry[w.type as WidgetType]?.defaultConfig ?? {}),
        ...w.config,
      } as WidgetConfig,
    }))

    widgetCount = widgets.length
    success = true

    return NextResponse.json({ widgets })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Generation failed'
    return NextResponse.json({ error: message }, { status: 500 })
  } finally {
    prisma.generationLog.create({
      data: {
        prompt: prompt ?? '',
        success,
        widgetCount,
        ip: clientIp,
        ...(userId ? { userId } : {}),
      },
    }).catch(() => { /* non-blocking */ })
  }
}
