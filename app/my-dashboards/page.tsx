import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TopNav } from '@/components/nav/TopNav'
import { DashboardCard } from '@/components/my-dashboards/DashboardCard'
import { EmptyState } from '@/components/my-dashboards/EmptyState'
import Link from 'next/link'

export default async function MyDashboardsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const rows = await prisma.dashboard.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: { id: true, name: true, widgets: true, updatedAt: true },
  })

  const dashboards = rows.map((d) => {
    const widgets = Array.isArray(d.widgets)
      ? (d.widgets as Array<{ type?: string }>)
      : []
    return {
      id: d.id,
      name: d.name,
      widgetCount: widgets.length,
      widgetTypes: widgets.map((w) => w.type ?? ''),
      updatedAt: d.updatedAt.toISOString(),
    }
  })

  return (
    <div className="min-h-screen bg-[#07070f]">
      <TopNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#f9fafb]">My Dashboards</h1>
            <p className="mt-0.5 text-xs text-[#6b7280]">
              {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/builder"
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
          >
            + New Dashboard
          </Link>
        </div>

        {dashboards.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-2">
            {dashboards.map((d) => (
              <DashboardCard key={d.id} dashboard={d} />
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
