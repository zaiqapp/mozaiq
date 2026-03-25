'use client'
import type { WidgetProps, TextNoteConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export default function TextNoteWidget({ config }: WidgetProps) {
  const c = config as TextNoteConfig
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <div className="flex h-full flex-col p-4">
      <p className={`mb-2 text-sm font-semibold ${isDark ? 'text-[#e5e7eb]' : 'text-gray-700'}`}>{c.title}</p>
      <p className={`whitespace-pre-wrap text-sm ${isDark ? 'text-[#9ca3af]' : 'text-gray-500'}`}>{c.content || 'Click to add a note...'}</p>
    </div>
  )
}
