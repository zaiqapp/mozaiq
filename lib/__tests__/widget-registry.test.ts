import { widgetRegistry, WIDGET_TYPES } from '../widget-registry'

describe('widgetRegistry', () => {
  it('has an entry for every WidgetType', () => {
    for (const type of WIDGET_TYPES) {
      expect(widgetRegistry[type]).toBeDefined()
    }
  })

  it('every entry has required fields', () => {
    for (const [, entry] of Object.entries(widgetRegistry)) {
      expect(entry.label).toBeTruthy()
      expect(entry.defaultSize.w).toBeGreaterThan(0)
      expect(entry.defaultSize.h).toBeGreaterThan(0)
      expect(entry.defaultConfig.title).toBeTruthy()
      expect(entry.category).toMatch(/^(metrics|charts|data|misc)$/)
    }
  })
})
