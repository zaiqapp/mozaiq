'use client'

import Link from 'next/link'
import { LayoutGroup, motion } from 'motion/react'
import { TextRotate } from '@/components/ui/text-rotate'

const glassBox = {
  className:
    'rounded-xl border border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] backdrop-blur-[8px] transition-colors hover:border-[rgba(255,255,255,0.18)]',
  style: {
    boxShadow:
      'inset 2px 2px 1px rgba(255,255,255,0.06), inset -1px -1px 1px rgba(255,255,255,0.03)',
  },
}

export function Hero() {
  return (
    <section className="relative overflow-hidden py-28 text-center">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div className="pointer-events-none absolute left-[10%] top-[-80px] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute right-[10%] top-[-60px] h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.14)_0%,transparent_70%)] blur-3xl" />

      <div className="hero-fade relative mx-auto max-w-3xl px-6">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/[0.06] px-3 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <span className="text-[10px] font-medium uppercase tracking-[0.05em] text-cyan-300">
            AI-POWERED DASHBOARD BUILDER · OPEN SOURCE
          </span>
        </div>

        <h1
          className="mb-4 text-5xl font-extrabold leading-tight tracking-tight"
          style={{ letterSpacing: '-0.03em' }}
        >
          <LayoutGroup>
            <motion.span className="flex whitespace-pre" layout>
              <motion.span
                className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent"
                layout
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              >
                Dashboards in minutes.{' '}
              </motion.span>
              <TextRotate
                texts={[
                  'Drag.',
                  'Describe.',
                  'Share.',
                ]}
                mainClassName="text-white mb-4 text-5xl font-extrabold leading-tight tracking-tight"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </motion.span>
          </LayoutGroup>
        </h1>

        <p className="mb-8 text-base text-[#4b5563]">
          Drag, drop, and describe. Mozaiq turns your data into shareable
          dashboards — no code required.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link
            href="/builder"
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_24px_rgba(6,182,212,0.3)] transition hover:opacity-90"
          >
            Start Building Free
          </Link>
          <a
            href="https://github.com/zaiqapp/mozaiq"
            target="_blank"
            rel="noopener noreferrer"
            className={`${glassBox.className} px-5 py-2.5`}
            style={glassBox.style}
          >
            <span className="text-sm font-semibold text-white">
              View on GitHub →
            </span>
          </a>
        </div>

        <div
          className={`mx-auto mt-12 max-w-2xl p-8 text-center ${glassBox.className}`}
          style={glassBox.style}
        >
          <p className="text-sm text-[#374151]">
            [ Builder screenshot / demo GIF ]
          </p>
        </div>
      </div>
    </section>
  )
}
