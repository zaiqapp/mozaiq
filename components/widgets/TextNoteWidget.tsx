'use client'
import type { WidgetProps, TextNoteConfig } from '@/types/dashboard'

export default function TextNoteWidget({ config }: WidgetProps) {
  const c = config as TextNoteConfig

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-2 text-sm font-semibold text-gray-700">{c.title}</p>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{c.content || 'Click to add a note...'}</p>
    </div>
  )
}
