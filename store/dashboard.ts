import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { LayoutItem } from 'react-grid-layout'
import type {
  DashboardState, Widget, WidgetType, WidgetConfig, TemplateKey,
  GlobalDataSource, AxisMapping,
} from '@/types/dashboard'
import { widgetRegistry } from '@/lib/widget-registry'
import { templates } from '@/lib/templates'

// Legacy DataSource shape — only used for migration, not exported
interface LegacyDataSource {
  type: 'csv' | 'google-sheets'
  data?: Record<string, unknown>[]
  fileName?: string
  url?: string
  gid?: string
  refreshInterval?: number
  mapping?: Record<string, string>
  error?: string
}

interface DashboardStore extends DashboardState {
  addWidget: (type: WidgetType) => void
  removeWidget: (id: string) => void
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void
  setLayout: (layout: LayoutItem[]) => void
  selectWidget: (id: string | null) => void
  setDashboardName: (name: string) => void
  loadTemplate: (template: TemplateKey) => void
  loadDashboard: (dashboard: {
    name: string
    widgets: Widget[]
    layout: LayoutItem[]
    dataSources?: GlobalDataSource[]
  }) => void
  addGlobalDataSource: (ds: GlobalDataSource) => void
  updateGlobalDataSource: (id: string, patch: Partial<GlobalDataSource>) => void
  removeGlobalDataSource: (id: string) => void
  updateWidgetDataSourceId: (widgetId: string, dataSourceId: string | undefined) => void
  updateWidgetMapping: (widgetId: string, mapping: Record<string, AxisMapping>) => void
  addGeneratedWidgets: (generated: Array<{
    type: WidgetType
    config: Partial<WidgetConfig>
    dataSourceId: string
    dataSourceMapping: Record<string, AxisMapping>
  }>) => void
  clearCanvas: () => void
  saveDashboard: () => Promise<string>
  generateDashboard: (prompt: string) => Promise<void>
}

const initialState: DashboardState = {
  name: 'Untitled Dashboard',
  widgets: [],
  layout: [],
  dataSources: [],
  isDirty: false,
  isSaving: false,
  isGenerating: false,
  selectedWidgetId: null,
}

function migrateWidgets(
  widgets: Widget[],
  existingDataSources: GlobalDataSource[],
): { widgets: Widget[]; dataSources: GlobalDataSource[] } {
  const dataSources = [...existingDataSources]

  const migratedWidgets = widgets.map((w) => {
    const legacyDs = (w as Widget & { dataSource?: LegacyDataSource }).dataSource
    if (!legacyDs) return w

    // Determine deduplication key
    const dedupeKey = legacyDs.type === 'google-sheets'
      ? `sheets:${legacyDs.url ?? ''}:${legacyDs.gid ?? ''}`
      : `csv:${legacyDs.fileName ?? ''}`

    let existingId = dataSources.find((ds) => {
      if (ds.type !== legacyDs.type) return false
      if (ds.type === 'google-sheets') {
        return `sheets:${ds.url ?? ''}:${ds.gid ?? ''}` === dedupeKey
      }
      return `csv:${ds.fileName ?? ''}` === dedupeKey
    })?.id

    if (!existingId) {
      const hostname = (() => { try { return new URL(legacyDs.url!).hostname } catch { return undefined } })()
      const newDs: GlobalDataSource = {
        id: nanoid(8),
        name: legacyDs.fileName ?? hostname ?? 'Imported Source',
        type: legacyDs.type,
        data: legacyDs.data,
        fileName: legacyDs.fileName,
        url: legacyDs.url,
        gid: legacyDs.gid,
        refreshInterval: legacyDs.refreshInterval,
      }
      dataSources.push(newDs)
      existingId = newDs.id
    }

    const mapping: Record<string, AxisMapping> = {}
    for (const [fieldKey, colName] of Object.entries(legacyDs.mapping ?? {})) {
      mapping[fieldKey] = { column: colName }
    }

    const { dataSource: _removed, ...rest } = w as Widget & { dataSource?: LegacyDataSource }
    return { ...rest, dataSourceId: existingId, ...(Object.keys(mapping).length ? { dataSourceMapping: mapping } : {}) }
  })

  return { widgets: migratedWidgets, dataSources }
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  ...initialState,

  addWidget: (type) => {
    const id = nanoid(8)
    const entry = widgetRegistry[type]
    const newWidget: Widget = { id, type, config: { ...entry.defaultConfig } }
    const currentLayout = get().layout
    const maxY = currentLayout.length
      ? Math.max(...currentLayout.map((l) => l.y + l.h))
      : 0
    const newLayoutItem: LayoutItem = { i: id, x: 0, y: maxY, ...entry.defaultSize }
    set((state) => ({
      widgets: [...state.widgets, newWidget],
      layout: [...state.layout, newLayoutItem],
      isDirty: true,
    }))
  },

  removeWidget: (id) => {
    set((state) => ({
      widgets: state.widgets.filter((w) => w.id !== id),
      layout: state.layout.filter((l) => l.i !== id),
      selectedWidgetId: state.selectedWidgetId === id ? null : state.selectedWidgetId,
      isDirty: true,
    }))
  },

  updateWidgetConfig: (id, config) => {
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === id ? { ...w, config: { ...w.config, ...config } } : w
      ),
      isDirty: true,
    }))
  },

  setLayout: (layout) => set({ layout, isDirty: true }),
  selectWidget: (id) => set({ selectedWidgetId: id }),
  setDashboardName: (name) => set({ name, isDirty: true }),

  loadTemplate: (template) => {
    const t = templates[template]
    set({ ...t, dataSources: [], id: undefined, isDirty: false, selectedWidgetId: null })
  },

  loadDashboard: (dashboard) => {
    const { name, layout, dataSources: incomingDs = [], widgets: rawWidgets } = dashboard
    const { widgets, dataSources } = migrateWidgets(rawWidgets, incomingDs)
    set({ name, widgets, layout, dataSources, isDirty: false, selectedWidgetId: null })
  },

  addGlobalDataSource: (ds) => {
    set((state) => ({ dataSources: [...state.dataSources, ds], isDirty: true }))
  },

  updateGlobalDataSource: (id, patch) => {
    set((state) => ({
      dataSources: state.dataSources.map((ds) => ds.id === id ? { ...ds, ...patch } : ds),
      isDirty: true,
    }))
  },

  removeGlobalDataSource: (id) => {
    set((state) => ({
      dataSources: state.dataSources.filter((ds) => ds.id !== id),
      widgets: state.widgets.map((w) =>
        w.dataSourceId === id
          ? { ...w, dataSourceId: undefined, dataSourceMapping: undefined }
          : w
      ),
      isDirty: true,
    }))
  },

  updateWidgetDataSourceId: (widgetId, dataSourceId) => {
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId
          ? { ...w, dataSourceId, ...(dataSourceId === undefined && { dataSourceMapping: undefined }) }
          : w
      ),
      isDirty: true,
    }))
  },

  updateWidgetMapping: (widgetId, mapping) => {
    set((state) => ({
      widgets: state.widgets.map((w) =>
        w.id === widgetId ? { ...w, dataSourceMapping: mapping } : w
      ),
      isDirty: true,
    }))
  },

  addGeneratedWidgets: (generated) => {
    set((state) => {
      const currentLayout = state.layout
      const curY = currentLayout.length
        ? Math.max(...currentLayout.map((l) => l.y + l.h))
        : 0

      const newWidgets: Widget[] = []
      const newLayoutItems: LayoutItem[] = []

      let yOffset = 0
      let leftBuffer: { id: string; h: number } | null = null

      for (const item of generated) {
        const id = nanoid(8)
        const entry = widgetRegistry[item.type]
        const isFullWidth = entry.defaultSize.w === 12
        const itemH = entry.defaultSize.h

        newWidgets.push({
          id,
          type: item.type,
          config: { ...entry.defaultConfig, ...item.config } as WidgetConfig,
          dataSourceId: item.dataSourceId,
          dataSourceMapping: item.dataSourceMapping,
        })

        if (isFullWidth) {
          // Flush pending left widget first
          if (leftBuffer) {
            const li = newLayoutItems.find((l) => l.i === leftBuffer!.id)!
            li.x = 0; li.y = curY + yOffset; li.w = 6; li.h = leftBuffer.h
            yOffset += leftBuffer.h
            leftBuffer = null
          }
          newLayoutItems.push({ i: id, x: 0, y: curY + yOffset, w: 12, h: itemH })
          yOffset += itemH
        } else if (!leftBuffer) {
          // Park in left slot (position assigned when right slot fills or at end)
          newLayoutItems.push({ i: id, x: 0, y: 0, w: 6, h: itemH }) // placeholder y
          leftBuffer = { id, h: itemH }
        } else {
          // Fill the right slot, finalize the row
          const leftEntry = newLayoutItems.find((l) => l.i === leftBuffer!.id)!
          const rowH = Math.max(leftBuffer.h, itemH)
          leftEntry.x = 0; leftEntry.y = curY + yOffset; leftEntry.w = 6; leftEntry.h = leftBuffer.h
          newLayoutItems.push({ i: id, x: 6, y: curY + yOffset, w: 6, h: itemH })
          yOffset += rowH
          leftBuffer = null
        }
      }

      // Flush remaining left widget
      if (leftBuffer) {
        const li = newLayoutItems.find((l) => l.i === leftBuffer!.id)!
        li.x = 0; li.y = curY + yOffset; li.w = 6; li.h = leftBuffer.h
      }

      return {
        widgets: [...state.widgets, ...newWidgets],
        layout: [...state.layout, ...newLayoutItems],
        isDirty: true,
      }
    })
  },

  clearCanvas: () => {
    set({ widgets: [], layout: [], dataSources: [], selectedWidgetId: null, isDirty: true })
  },

  saveDashboard: async () => {
    const { id, name, widgets, layout, dataSources } = get()
    set({ isSaving: true })
    try {
      // Strip inline row data from live sources (Google Sheets) — they re-fetch on load.
      // Only CSV sources need their data persisted inline.
      const dataSourcesForSave = dataSources.map((ds) =>
        ds.type === 'google-sheets' ? { ...ds, data: undefined } : ds
      )

      // CSV size guard: sum inline data across all CSV global sources
      const csvSize = dataSourcesForSave.reduce((acc, ds) => {
        if (ds.type === 'csv' && ds.data) {
          return acc + JSON.stringify(ds.data).length
        }
        return acc
      }, 0)
      if (csvSize > 3_000_000) {
        throw new Error('CSV data is too large to save (>3MB). Try uploading a smaller file.')
      }

      const body = JSON.stringify({ name, widgets, layout, dataSources: dataSourcesForSave })
      let res = await fetch(id ? `/api/dashboards/${id}` : '/api/dashboards', {
        method: id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
      if (res.status === 404 && id) {
        set({ id: undefined })
        res = await fetch('/api/dashboards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
      }
      if (!res.ok) throw new Error(`Save failed (${res.status})`)
      const data = await res.json() as { id: string }
      set({ id: data.id, isDirty: false })
      return data.id
    } finally {
      set({ isSaving: false })
    }
  },

  generateDashboard: async (prompt) => {
    set({ isGenerating: true })
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json() as { dashboard?: { name: string; widgets: Widget[]; layout: LayoutItem[] }; error?: string }
      if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed')
      get().loadDashboard(data.dashboard!)
    } finally {
      set({ isGenerating: false })
    }
  },
}))
