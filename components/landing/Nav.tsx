'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { SignInButton } from '@clerk/nextjs'
import { UserMenu } from '@/components/nav/UserMenu'
import { cn } from '@/lib/utils'

interface NavProps {
  userId: string | null
}

const menuItems = [
  { name: 'Docs', href: '#' },
  { name: 'GitHub', href: 'https://github.com/zaiqapp/mozaiq' },
]

export function Nav({ userId }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header>
      <nav
        data-state={menuOpen ? 'active' : undefined}
        className="fixed z-50 w-full px-2 group"
      >
        <div
          className={cn(
            'mx-auto mt-2 rounded-2xl border border-transparent px-6 transition-all duration-300',
            isScrolled
              ? 'max-w-4xl border-white/[0.10] bg-[rgba(8,8,16,0.6)] px-5 backdrop-blur-[20px]'
              : 'max-w-7xl',
          )}
          style={
            isScrolled
              ? {
                  boxShadow:
                    'inset 2px 2px 1px rgba(255,255,255,0.06), inset -1px -1px 1px rgba(255,255,255,0.03)',
                }
              : undefined
          }
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            {/* Logo + mobile toggle */}
            <div className="flex w-full items-center justify-between lg:w-auto">
              <Link href="/" aria-label="home" className="flex items-center gap-2">
                <div className="h-4 w-4 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
                <span className="text-sm font-bold text-white">Mozaiq</span>
              </Link>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? 'Close Menu' : 'Open Menu'}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu
                  className={cn(
                    'm-auto size-6 transition-all duration-200',
                    menuOpen ? 'scale-0 opacity-0 -rotate-180' : 'scale-100 opacity-100 rotate-0',
                  )}
                />
                <X
                  className={cn(
                    'absolute inset-0 m-auto size-6 transition-all duration-200',
                    menuOpen ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 rotate-180',
                  )}
                />
              </button>
            </div>

            {/* Desktop center links */}
            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-[#4b5563] transition hover:text-white"
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop right auth + mobile drawer */}
            <div
              className={cn(
                'w-full flex-wrap items-center justify-end gap-4 rounded-2xl lg:m-0 lg:flex lg:w-fit lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none',
                menuOpen
                  ? 'mb-4 flex flex-col space-y-4 rounded-2xl border border-white/[0.08] bg-[rgba(8,8,16,0.8)] p-5 backdrop-blur-[12px]'
                  : 'hidden lg:flex',
              )}
            >
              {/* Mobile nav links */}
              <div className="w-full lg:hidden">
                <ul className="space-y-4 text-sm">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-[#4b5563] transition hover:text-white"
                        onClick={() => setMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Auth buttons */}
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:gap-3 lg:w-fit">
                {userId ? (
                  <>
                    <Link
                      href="/my-dashboards"
                      className={cn(
                        'text-sm text-[#4b5563] transition hover:text-white',
                        isScrolled && 'lg:hidden',
                      )}
                    >
                      My Dashboards
                    </Link>
                    <UserMenu />
                  </>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <button
                        className={cn(
                          'text-sm text-[#4b5563] transition hover:text-white',
                          isScrolled && 'lg:hidden',
                        )}
                      >
                        Sign In
                      </button>
                    </SignInButton>
                    <Link
                      href="/builder"
                      className="rounded-lg bg-gradient-to-r from-cyan-400 to-indigo-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      {isScrolled ? 'Start Building →' : 'Start free →'}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
