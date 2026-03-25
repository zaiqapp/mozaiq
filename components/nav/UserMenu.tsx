'use client'
import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, LogOut } from 'lucide-react'

export function UserMenu() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (!user) return null

  const email = user.emailAddresses[0]?.emailAddress ?? ''
  const initial = (user.firstName?.[0] ?? email[0] ?? '?').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 text-xs font-bold text-white hover:opacity-90"
        aria-label="User menu"
      >
        {initial}
      </button>

      {open && (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
          role="menu"
          onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false) }}
          className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a2e] shadow-xl"
        >
          <div className="border-b border-[rgba(255,255,255,0.06)] px-3 py-2.5">
            <p className="truncate text-xs font-medium text-[#f9fafb]">{email}</p>
            <p className="text-[10px] text-[#4b5563]">Free plan</p>
          </div>
          <div className="p-1">
            <button
              role="menuitem"
              onClick={() => { setOpen(false); router.push('/my-dashboards') }}
              className="flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-xs text-[#d1d5db] hover:bg-[rgba(255,255,255,0.06)]"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              My Dashboards
            </button>
            <button
              role="menuitem"
              onClick={() => signOut({ redirectUrl: '/' })}
              className="flex w-full items-center gap-2.5 rounded px-2.5 py-1.5 text-xs text-[#6b7280] hover:bg-[rgba(255,255,255,0.06)]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
