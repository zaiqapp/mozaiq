import { create } from 'zustand'
import { nanoid } from 'nanoid'
import type { LayoutItem } from 'react-grid-layout'
import type {
  DashboardState, Widget, WidgetType, WidgetConfig, TemplateKey,
} from '@/types/dashboard'
import { widgetRegistry } from '@/lib/widget-registry'
import { templates } from '@/lib/templates'

interface DashboardStore extends DashboardState {
  addWidget: (type: WidgetType) => void
  removeWidget: (id: string) => void
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void
  setLayout: (layout: LayoutItem[]) => void
  selectWidget: (id: string | null) => void
  setDashboardName: (name: string) => void
  loadTemplate: (template: TemplateKey) => void
  loadDashboard: (dashboard: { name: string; widgets: Widget[]; layout: LayoutItem[] }) => void
  clearCanvas: () => void
  saveDashboard: () => Promise<string>
  generateDashboard: (prompt: string) => Promise<void>
}

const initialState: DashboardState = {
  name: 'Untitled Dashboard',
  widgets: [],
  layout: [],
  isDirty: false,
  isSaving: false,
  isGenerating: false,
  selectedWidgetId: null,
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
    set({ ...t, id: undefined, isDirty: false, selectedWidgetId: null })
  },

  loadDashboard: (dashboard) => {
    set({ ...dashboard, isDirty: false, selectedWidgetId: null })
  },

  clearCanvas: () => {
    set({ widgets: [], layout: [], selectedWidgetId: null, isDirty: true })
  },

  saveDashboard: async () => {
    const { id, name, widgets, layout } = get()
    set({ isSaving: true })
    try {
      const url = id ? `/api/dashboards/${id}` : '/api/dashboards'
      const method = id ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, widgets, layout }),
      })
      if (!res.ok) throw new Error('Save failed')
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
