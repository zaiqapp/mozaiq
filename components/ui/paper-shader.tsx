'use client'

import { MeshGradient } from '@paper-design/shaders-react'

export function PaperShader() {
  return (
    <MeshGradient
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
        width: '100%',
        height: '100%',
      }}
      colors={['#080810', '#061820', '#0d1520', '#080818']}
      speed={0.4}
    />
  )
}
