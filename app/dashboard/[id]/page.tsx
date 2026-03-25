import { notFound } from 'next/navigation'
import { after } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ShareView } from '@/components/share/ShareView'
import { TopNav } from '@/components/nav/TopNav'
import type { Widget } from '@/types/dashboard'
import type { LayoutItem } from 'react-grid-layout'

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dashboard = await prisma.dashboard.findUnique({ where: { id } })
  if (!dashboard) notFound()

  after(async () => {
    await prisma.dashboard.update({ where: { id }, data: { views: { increment: 1 } } })
  })

  return (
    <div>
      <TopNav />
      <ShareView
        id={dashboard.id}
        name={dashboard.name}
        widgets={dashboard.widgets as unknown as Widget[]}
        layout={dashboard.layout as unknown as LayoutItem[]}
      />
    </div>
  )
}
