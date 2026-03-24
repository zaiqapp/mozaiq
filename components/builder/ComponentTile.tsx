'use client'
import type { LucideIcon } from 'lucide-react'
import type { WidgetType } from '@/types/dashboard'
import { useDashboardStore } from '@/store/dashboard'

interface Props { type: WidgetType; label: string; icon: LucideIcon }

export function ComponentTile({ type, label, icon: Icon }: Props) {
  const addWidget = useDashboardStore((s) => s.addWidget)
  return (
    <button
      onClick={() => addWidget(type)}
      className="flex flex-col items-center gap-1.5 rounded-lg border border-[#2d3748] bg-[#1a2035] p-3 text-center transition hover:border-indigo-500 hover:bg-[#1f2a42]"
    >
      <Icon className="h-5 w-5 text-indigo-400" />
      <span className="text-[11px] text-gray-300">{label}</span>
    </button>
  )
}
