'use client'
import { useId } from 'react'

interface GlassEffectProps {
  children: React.ReactNode
  className?: string
}

export function GlassEffect({ children, className = '' }: GlassEffectProps) {
  const uid = useId().replace(/:/g, '')
  const filterId = `glass-${uid}`

  return (
    <div className={`relative inline-block ${className}`}>
      <svg
        aria-hidden
        style={{ width: 0, height: 0, position: 'absolute' }}
      >
        <defs>
          <filter
            id={filterId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.65"
              numOctaves="1"
              seed="2"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      <div
        className="rounded-lg border border-white/10 bg-white/[0.04] px-6 py-3 backdrop-blur-[8px]"
        style={{
          filter: `url(#${filterId})`,
          boxShadow:
            'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
        }}
      >
        {children}
      </div>
    </div>
  )
}
