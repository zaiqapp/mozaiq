import { NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/lib/prisma'
import { shareUrl } from '@/lib/utils'

export async function POST(req: Request) {
  try {
    const body = await req.json() as { name: string; layout: object; widgets: object }
    const id = nanoid(10)
    const dashboard = await prisma.dashboard.create({
      data: { id, name: body.name, layout: body.layout, widgets: body.widgets },
    })
    return NextResponse.json({ id: dashboard.id, shareUrl: shareUrl(dashboard.id) }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create dashboard' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const dashboards = await prisma.dashboard.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true, createdAt: true, updatedAt: true, views: true },
    })
    return NextResponse.json(dashboards)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboards' }, { status: 500 })
  }
}
