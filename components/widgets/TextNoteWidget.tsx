'use client'
import type { WidgetProps, TextNoteConfig } from '@/types/dashboard'

export default function TextNoteWidget({ config }: WidgetProps) {
  const c = config as TextNoteConfig

  return (
    <div className="flex h-full flex-col p-4">
      <p className="mb-2 text-sm font-semibold text-[#e5e7eb]">{c.title}</p>
      <p className="text-sm text-[#9ca3af] whitespace-pre-wrap">{c.content || 'Click to add a note...'}</p>
    </div>
  )
}
