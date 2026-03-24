import { BuilderCanvas } from '@/components/builder/BuilderCanvas'
import { LeftSidebar } from '@/components/builder/LeftSidebar'
import { RightPanel } from '@/components/builder/RightPanel'
import { Toolbar } from '@/components/builder/Toolbar'

export default function BuilderPage() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <main className="flex-1 overflow-hidden">
          <BuilderCanvas />
        </main>
        <RightPanel />
      </div>
    </div>
  )
}
