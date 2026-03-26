import Link from 'next/link'
import { auth } from '@clerk/nextjs/server'
import { UserMenu } from '@/components/nav/UserMenu'
import { SignInButton } from '@clerk/nextjs'

export async function TopNav() {
  const { userId } = await auth()

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.13] bg-[rgba(255,255,255,0.07)] backdrop-blur-[20px]" style={{ boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)' }}>
      <div className="flex h-12 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
          <span className="text-sm font-bold text-white">Mozaiq</span>
        </Link>
        <div className="flex items-center gap-4">
          {userId ? (
            <>
              <Link
                href="/my-dashboards"
                className="text-sm text-[#6b7280] hover:text-white transition-colors"
              >
                My Dashboards
              </Link>
              <UserMenu />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="rounded-md bg-indigo-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
                Sign In
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  )
}
