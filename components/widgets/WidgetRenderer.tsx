import { widgetRegistry } from '@/lib/widget-registry'
import type { Widget } from '@/types/dashboard'

interface Props {
  widget: Widget
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  isReadOnly?: boolean
}

export function WidgetRenderer({ widget, isSelected, onSelect, onDelete, isReadOnly }: Props) {
  const entry = widgetRegistry[widget.type]
  if (!entry) return null
  const Component = entry.component
  return (
    <Component
      config={widget.config}
      isSelected={isSelected}
      onSelect={onSelect}
      onDelete={onDelete}
      isReadOnly={isReadOnly}
    />
  )
}
