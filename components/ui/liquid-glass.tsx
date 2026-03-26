interface GlassEffectProps {
  children: React.ReactNode
  className?: string
}

export function GlassEffect({ children, className = '' }: GlassEffectProps) {
  return (
    <div
      className={`inline-block rounded-lg border border-[rgba(255,255,255,0.09)] bg-white/[0.04] px-6 py-3 backdrop-blur-[8px] ${className}`}
      style={{
        boxShadow:
          'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
      }}
    >
      {children}
    </div>
  )
}
