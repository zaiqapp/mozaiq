'use client'
import { useEffect } from 'react'
import type { Widget } from '@/types/dashboard'
import type { LayoutItem } from 'react-grid-layout'
import { useDashboardStore } from '@/store/dashboard'
import { BuilderCanvas } from './BuilderCanvas'
import { LeftSidebar } from './LeftSidebar'
import { RightPanel } from './RightPanel'
import { Toolbar } from './Toolbar'

interface Props { id: string; name: string; widgets: Widget[]; layout: LayoutItem[] }

export function BuilderLoader({ id, name, widgets, layout }: Props) {
  const { loadDashboard } = useDashboardStore()

  useEffect(() => {
    useDashboardStore.setState({ id })
    loadDashboard({ name, widgets, layout })
  }, [id, name, widgets, layout, loadDashboard])

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 overflow-hidden"><BuilderCanvas /></main>
        <RightPanel />
      </div>
    </div>
  )
}
