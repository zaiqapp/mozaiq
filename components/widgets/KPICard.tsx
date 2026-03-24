'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { WidgetProps, KPIConfig } from '@/types/dashboard'
import { cn } from '@/lib/utils'

export default function KPICard({ config }: WidgetProps) {
  const c = config as KPIConfig
  const isPositive = c.change >= 0

  return (
    <div className="flex h-full flex-col justify-between p-4">
      <p className="text-sm font-medium text-gray-500">{c.title}</p>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {c.prefix}{c.value}{c.suffix}
        </p>
        <div className={cn(
          'mt-1 flex items-center gap-1 text-xs font-medium',
          isPositive ? 'text-emerald-600' : 'text-red-500'
        )}>
          {isPositive
            ? <TrendingUp className="h-3.5 w-3.5" />
            : <TrendingDown className="h-3.5 w-3.5" />}
          <span>{isPositive ? '+' : ''}{c.change}% {c.changeLabel}</span>
        </div>
      </div>
    </div>
  )
}
