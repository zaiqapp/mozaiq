import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const dashboard = await prisma.dashboard.findUnique({ where: { id } })
  if (!dashboard) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(dashboard)
}

export async function PATCH(req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const dashboard = await prisma.dashboard.findUnique({ where: { id }, select: { userId: true } })
    if (!dashboard) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (dashboard.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await req.json() as { name?: string; layout?: Prisma.InputJsonValue; widgets?: Prisma.InputJsonValue; dataSources?: Prisma.InputJsonValue }
    const { name, layout, widgets, dataSources } = body
    const updated = await prisma.dashboard.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(layout !== undefined && { layout }),
        ...(widgets !== undefined && { widgets }),
        ...(dataSources !== undefined && { dataSources }),
      },
    })
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[PATCH /api/dashboards/:id]', err)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  try {
    const dashboard = await prisma.dashboard.findUnique({ where: { id }, select: { userId: true } })
    if (!dashboard) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (dashboard.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    await prisma.dashboard.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
