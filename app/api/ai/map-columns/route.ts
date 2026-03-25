import { NextResponse } from 'next/server'
import { generateText } from 'ai'
import { auth } from '@clerk/nextjs/server'
import type { WidgetFieldDef } from '@/lib/widget-field-registry'
import type { WidgetType } from '@/types/dashboard'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    widgetType?: WidgetType
    columns?: string[]
    sampleRows?: Record<string, unknown>[]
    widgetFields?: WidgetFieldDef[]
  }

  if (!body.widgetType || !body.columns?.length || !body.sampleRows || !body.widgetFields?.length) {
    return NextResponse.json({ error: 'widgetType, columns, sampleRows and widgetFields are required' }, { status: 400 })
  }

  const { widgetType, columns, sampleRows, widgetFields } = body

  const prompt = `You are mapping CSV columns to widget fields.

Widget type: ${widgetType}
Available CSV columns: ${JSON.stringify(columns)}
Sample rows (first 3): ${JSON.stringify(sampleRows.slice(0, 3))}

Widget fields to map:
${widgetFields.map((f) => `- "${f.key}" (${f.type}): ${f.description}`).join('\n')}

Return ONLY a valid JSON object mapping each widget field key to the best matching CSV column name.
Example: {"name":"month","value":"revenue"}
If no good match exists for a field, omit it from the mapping.`

  try {
    const { text } = await generateText({
      model: 'anthropic/claude-haiku-4.5',
      messages: [{ role: 'user', content: prompt }],
      maxOutputTokens: 200,
    })

    // Extract JSON from response (model may wrap in ```json ... ```)
    const jsonMatch = /\{[\s\S]*\}/.exec(text)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI returned unparseable response' }, { status: 500 })
    }

    const mapping = JSON.parse(jsonMatch[0]) as unknown
    if (typeof mapping !== 'object' || mapping === null || Array.isArray(mapping)) {
      return NextResponse.json({ error: 'AI returned invalid mapping shape' }, { status: 500 })
    }

    // Validate all values are strings and known columns
    const validated: Record<string, string> = {}
    for (const [k, v] of Object.entries(mapping as Record<string, unknown>)) {
      if (typeof v === 'string' && columns.includes(v)) validated[k] = v
    }

    return NextResponse.json({ mapping: validated })
  } catch {
    return NextResponse.json({ error: 'AI mapping failed' }, { status: 500 })
  }
}
