'use client'
import { useEffect } from 'react'
import type { Widget, GlobalDataSource } from '@/types/dashboard'
import type { LayoutItem } from 'react-grid-layout'
import { useDashboardStore } from '@/store/dashboard'
import { BuilderCanvas } from './BuilderCanvas'
import { DashboardInsightsDrawer } from './DashboardInsightsDrawer'
import { LeftSidebar } from './LeftSidebar'
import { RightPanel } from './RightPanel'
import { Toolbar } from './Toolbar'

interface Props {
  id: string
  name: string
  widgets: Widget[]
  layout: LayoutItem[]
  dataSources?: GlobalDataSource[]
}

export function BuilderLoader({ id, name: initialName, widgets: initialWidgets, layout, dataSources = [] }: Props) {
  const { loadDashboard, insightsDrawerOpen, setInsightsDrawerOpen, widgets, name } = useDashboardStore()

  useEffect(() => {
    useDashboardStore.setState({ id })
    loadDashboard({ name: initialName, widgets: initialWidgets, layout, dataSources })
  }, [id, initialName, initialWidgets, layout, dataSources, loadDashboard])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 overflow-y-auto"><BuilderCanvas /></main>
        {insightsDrawerOpen && (
          <DashboardInsightsDrawer
            widgets={widgets}
            dashboardName={name}
            onClose={() => setInsightsDrawerOpen(false)}
          />
        )}
        <RightPanel />
      </div>
    </div>
  )
}
