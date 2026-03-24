'use client'
import type { TemplateKey } from '@/types/dashboard'
import { useDashboardStore } from '@/store/dashboard'

interface Props { templateKey: TemplateKey; name: string; description: string; icon: string }

export function TemplateCard({ templateKey, name, description, icon }: Props) {
  const loadTemplate = useDashboardStore((s) => s.loadTemplate)
  return (
    <button
      onClick={() => loadTemplate(templateKey)}
      className="w-full rounded-lg border border-[#2d3748] bg-[#1a2035] p-3 text-left transition hover:border-indigo-500"
    >
      <div className="mb-1 text-xl">{icon}</div>
      <p className="text-sm font-medium text-white">{name}</p>
      <p className="mt-0.5 text-xs text-gray-400">{description}</p>
    </button>
  )
}
