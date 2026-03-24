import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BuilderLoader } from '@/components/builder/BuilderLoader'
import type { Widget } from '@/types/dashboard'
import type { LayoutItem } from 'react-grid-layout'

export default async function EditBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dashboard = await prisma.dashboard.findUnique({ where: { id } })
  if (!dashboard) notFound()

  return (
    <BuilderLoader
      id={dashboard.id}
      name={dashboard.name}
      widgets={dashboard.widgets as unknown as Widget[]}
      layout={dashboard.layout as unknown as LayoutItem[]}
    />
  )
}
