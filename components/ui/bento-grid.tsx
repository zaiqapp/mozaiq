export interface BentoItem {
  title: string
  description?: string
  icon?: React.ReactNode
  status?: string
  tags?: string[]
  colSpan?: 1 | 2 | 3
  hasPersistentHover?: boolean
  featured?: boolean
}

interface BentoGridProps {
  items: BentoItem[]
}

export function BentoGrid({ items }: BentoGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map((item, i) => {
        const spanClass =
          item.colSpan === 3
            ? 'col-span-3'
            : item.colSpan === 2
            ? 'col-span-2'
            : 'col-span-1'

        const bgClass = item.featured
          ? 'border-[rgba(6,182,212,0.14)] bg-[rgba(6,182,212,0.04)]'
          : 'border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)]'

        const hoverClass = item.hasPersistentHover
          ? 'bento-hover border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.06)]'
          : 'hover:border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.06)]'

        return (
          <div
            key={i}
            data-testid={`bento-item-${i}`}
            className={`h-full rounded-xl border p-5 transition-all duration-200 backdrop-blur-[8px]
              [box-shadow:inset_2px_2px_1px_rgba(255,255,255,0.08),inset_-1px_-1px_1px_rgba(255,255,255,0.04)]
              ${spanClass} ${bgClass} ${hoverClass}`}
          >
            {item.icon && (
              <div className="mb-3 text-cyan-400">{item.icon}</div>
            )}
            {item.status && (
              <span className="mb-2 inline-block rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-cyan-300">
                {item.status}
              </span>
            )}
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-cyan-400">
              ✦ {item.title}
            </span>
            {item.description && (
              <p className="text-sm text-[#9ca3af]">{item.description}</p>
            )}
            {item.tags && item.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#6b7280]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
