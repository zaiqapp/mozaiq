'use client'
import type { LucideIcon } from 'lucide-react'
import type { WidgetType } from '@/types/dashboard'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'

interface Props { type: WidgetType; label: string; icon: LucideIcon }

export function ComponentTile({ type, label, icon: Icon }: Props) {
  const addWidget = useDashboardStore((s) => s.addWidget)
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => addWidget(type)}
      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition ${
        isDark
          ? 'border-[#2d3748] bg-[#1a2035] hover:border-indigo-500 hover:bg-[#1f2a42]'
          : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-gray-100'
      }`}
    >
      <Icon className={`h-5 w-5 ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`} />
      <span className={`text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{label}</span>
    </button>
  )
}
