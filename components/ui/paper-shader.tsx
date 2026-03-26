'use client'

import { GrainGradient } from '@paper-design/shaders-react'

export function PaperShader() {
  return (
    <GrainGradient
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      colorBack="#080810"
      colors={['hsl(190,100%,45%)', 'hsl(245,80%,60%)', 'hsl(220,30%,15%)']}
      noise={0.2}
      softness={0.7}
      shape="blob"
      speed={0}
    />
  )
}
