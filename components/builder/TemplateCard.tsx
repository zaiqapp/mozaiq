'use client'
import type { TemplateKey } from '@/types/dashboard'
import { useDashboardStore } from '@/store/dashboard'
import { useBuilderTheme } from './BuilderThemeProvider'

interface Props { templateKey: TemplateKey; name: string; description: string; icon: string }

export function TemplateCard({ templateKey, name, description, icon }: Props) {
  const loadTemplate = useDashboardStore((s) => s.loadTemplate)
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => loadTemplate(templateKey)}
      className={`w-full rounded-lg border p-3 text-left transition ${
        isDark
          ? 'border-[#2d3748] bg-[#1a2035] hover:border-indigo-500'
          : 'border-gray-200 bg-white hover:border-indigo-300'
      }`}
    >
      <div className="mb-1 text-xl">{icon}</div>
      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{name}</p>
      <p className={`mt-0.5 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{description}</p>
    </button>
  )
}
