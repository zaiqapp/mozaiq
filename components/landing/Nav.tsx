'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SignInButton, UserMenu } from '@clerk/nextjs'

interface NavProps {
  userId: string | null
}

export function Nav({ userId }: NavProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        isScrolled
          ? 'border-b border-white/[0.08] bg-[rgba(255,255,255,0.07)] backdrop-blur-[20px]'
          : 'border-b border-transparent bg-transparent'
      }`}
      style={
        isScrolled
          ? {
              boxShadow:
                'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
            }
          : undefined
      }
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
        <span className="text-sm font-bold text-white">Mozaiq</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6">
        {!isScrolled && (
          <>
            <a href="#" className="text-sm text-[#4b5563] transition hover:text-white">
              Docs
            </a>
            <a
              href="https://github.com/zaiqapp/mozaiq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#4b5563] transition hover:text-white"
            >
              GitHub
            </a>
          </>
        )}

        {!isScrolled && userId && (
          <>
            <Link
              href="/my-dashboards"
              className="text-sm text-[#4b5563] transition hover:text-white"
            >
              My Dashboards
            </Link>
            <UserMenu />
          </>
        )}

        {!isScrolled && !userId && (
          <>
            <SignInButton mode="modal">
              <button className="text-sm text-[#4b5563] transition hover:text-white">
                Sign In
              </button>
            </SignInButton>
            <Link
              href="/builder"
              className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Start free →
            </Link>
          </>
        )}

        {isScrolled && (
          <Link
            href="/builder"
            className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Start Building →
          </Link>
        )}
      </div>
    </nav>
  )
}
