import { auth } from '@clerk/nextjs/server'
import { redirect, notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ViewPage } from '@/components/view/ViewPage'
import type { Widget, GlobalDataSource } from '@/types/dashboard'
import type { LayoutItem } from 'react-grid-layout'

export default async function ViewDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { id } = await params
  const dashboard = await prisma.dashboard.findUnique({ where: { id } })
  if (!dashboard) notFound()

  return (
    <ViewPage
      id={dashboard.id}
      name={dashboard.name}
      widgets={dashboard.widgets as unknown as Widget[]}
      layout={dashboard.layout as unknown as LayoutItem[]}
      dataSources={(dashboard.dataSources as unknown as GlobalDataSource[]) ?? []}
    />
  )
}
