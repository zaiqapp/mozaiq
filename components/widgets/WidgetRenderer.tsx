'use client'
import { widgetRegistry } from '@/lib/widget-registry'
import { widgetFieldRegistry } from '@/lib/widget-field-registry'
import { applyMapping, CHART_TYPES } from '@/lib/apply-mapping'
import { useDataSource } from '@/hooks/useDataSource'
import type { Widget, WidgetConfig } from '@/types/dashboard'

interface Props {
  widget: Widget
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  isReadOnly?: boolean
}

export function WidgetRenderer({ widget, isSelected, onSelect, onDelete, isReadOnly }: Props) {
  const entry = widgetRegistry[widget.type]
  const { rows } = useDataSource(widget)

  if (!entry) return null
  const Component = entry.component

  let patchedConfig: WidgetConfig = widget.config

  if (rows !== null && widget.dataSourceMapping) {
    const mapping = widget.dataSourceMapping
    const fields = widgetFieldRegistry[widget.type] ?? []
    const patch: Record<string, unknown> = {}

    for (const field of fields) {
      const resolved = applyMapping(field.key, field.type, rows, mapping)
      if (resolved !== null) patch[field.key] = resolved
    }

    // Chart widgets: force dataKey to 'value' since applyMapping normalises to { name, value }
    if (CHART_TYPES.has(widget.type) && patch['data']) {
      patch['dataKey'] = 'value'
    }

    // Data table: synthesise columns from mapping using displayName if available
    if (widget.type === 'data-table' && patch['rows']) {
      patch['columns'] = Object.entries(mapping).map(([, axisMapping]) => ({
        key: axisMapping.column,
        label: axisMapping.displayName ?? axisMapping.column,
        sortable: true,
      }))
    }

    if (Object.keys(patch).length > 0) {
      patchedConfig = { ...widget.config, ...patch } as WidgetConfig
    }
  }

  return (
    <Component
      config={patchedConfig}
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      isReadOnly={isReadOnly}
    />
  )
}
