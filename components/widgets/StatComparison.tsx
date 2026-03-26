'use client'

import type { WidgetProps, StatComparisonConfig } from '@/types/dashboard'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

const MOCK_PRIMARY = 2400
const MOCK_SECONDARY = 1980

export default function StatComparison({ config }: WidgetProps) {
  const c = config as StatComparisonConfig
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const primary = typeof c.primary === 'number' ? c.primary : MOCK_PRIMARY
  const secondary = typeof c.secondary === 'number' ? c.secondary : MOCK_SECONDARY
  const delta = primary !== 0 ? ((secondary - primary) / Math.abs(primary)) * 100 : null
  const isPositive = delta !== null && delta >= 0
  const isGood = c.deltaPositiveIsGood !== false ? isPositive : !isPositive

  const fmt = (n: number) =>
    `${c.prefix ?? ''}${n.toLocaleString()}${c.suffix ?? ''}`

  const borderColor = isDark ? 'border-[rgba(255,255,255,0.08)]' : 'border-gray-200'
  const mutedText = isDark ? 'text-[#4b5563]' : 'text-gray-500'
  const boldText = isDark ? 'text-white' : 'text-gray-900'

  return (
    <div className="w-full h-full flex flex-col justify-center p-4 gap-3">
      {c.title && (
        <p className={`text-xs font-medium ${mutedText}`}>{c.title}</p>
      )}
      <div className={`flex rounded-lg border ${borderColor} overflow-hidden`}>
        <div className="flex-1 p-3 text-center">
          <div className={`text-[11px] mb-1 ${mutedText}`}>
            {c.primaryLabel ?? 'Primary'}
          </div>
          <div className={`text-2xl font-bold ${boldText}`}>{fmt(primary)}</div>
        </div>
        <div className={`w-px ${isDark ? 'bg-[rgba(255,255,255,0.08)]' : 'bg-gray-200'}`} />
        <div className="flex-1 p-3 text-center">
          <div className={`text-[11px] mb-1 ${mutedText}`}>
            {c.secondaryLabel ?? 'Secondary'}
          </div>
          <div className={`text-2xl font-bold ${boldText}`}>{fmt(secondary)}</div>
        </div>
      </div>
      {delta !== null && (
        <p className={`text-center text-sm font-medium ${isGood ? 'text-emerald-500' : 'text-red-500'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
        </p>
      )}
    </div>
  )
}
