'use client'
import { widgetRegistry, WIDGET_TYPES } from '@/lib/widget-registry'
import { ComponentTile } from './ComponentTile'
import { TemplateCard } from './TemplateCard'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useBuilderTheme } from './BuilderThemeProvider'

const CATEGORIES = ['metrics', 'charts', 'data', 'misc'] as const

export function LeftSidebar() {
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <aside
      className={`flex h-full w-[260px] flex-shrink-0 flex-col ${
        isDark ? 'bg-[rgba(255,255,255,0.07)] backdrop-blur-[12px]' : 'bg-white border-r border-gray-200'
      }`}
      style={isDark ? { boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)' } : undefined}
    >
      <div className={`flex items-center gap-2 p-4 ${
        isDark ? 'border-b border-white/[0.08]' : 'border-b border-gray-200'
      }`}>
        <div className="h-6 w-6 rounded bg-indigo-600" />
        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mozaiq</span>
      </div>

      <Tabs defaultValue="components" className="flex flex-1 flex-col overflow-hidden">
        <TabsList className={`mx-3 mt-2 grid grid-cols-2 ${isDark ? 'bg-[rgba(255,255,255,0.06)]' : 'bg-gray-100'}`}>
          <TabsTrigger value="components" className="text-xs">Components</TabsTrigger>
          <TabsTrigger value="templates" className="text-xs">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="flex-1 overflow-y-auto p-3">
          {CATEGORIES.map((cat) => {
            const catWidgets = WIDGET_TYPES.filter(
              (t) => widgetRegistry[t].category === cat
            )
            if (!catWidgets.length) return null
            return (
              <div key={cat} className="mb-4">
                <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">
                  {cat}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {catWidgets.map((type) => {
                    const entry = widgetRegistry[type]
                    return (
                      <ComponentTile
                        key={type}
                        type={type}
                        label={entry.label}
                        icon={entry.icon}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </TabsContent>

        <TabsContent value="templates" className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-2">
            <TemplateCard templateKey="analytics" name="Analytics" description="MRR, users, conversion" icon="📊" />
            <TemplateCard templateKey="inventory" name="Inventory" description="SKUs, stock levels, value" icon="📦" />
            <TemplateCard templateKey="purchasing" name="Purchasing" description="POs, vendor spend, delivery" icon="🛒" />
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
