import { NextResponse } from 'next/server'
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
  const { id } = await params
  try {
    const body = await req.json() as { name?: string; layout?: unknown; widgets?: unknown }
    const dashboard = await prisma.dashboard.update({ where: { id }, data: body as Parameters<typeof prisma.dashboard.update>[0]['data'] })
    return NextResponse.json(dashboard)
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    await prisma.dashboard.delete({ where: { id } })
    return new Response(null, { status: 204 })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
