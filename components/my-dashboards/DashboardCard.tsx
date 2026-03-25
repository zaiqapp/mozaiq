'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { shareUrl } from '@/lib/utils'

const WIDGET_COLORS: Record<string, string> = {
  'kpi': '#1d4ed8',
  'line-chart': '#7c3aed',
  'area-chart': '#059669',
  'bar-chart': '#d97706',
  'donut-chart': '#dc2626',
  'funnel-chart': '#0891b2',
  'gauge': '#9333ea',
  'data-table': '#475569',
  'progress-tracker': '#16a34a',
  'activity-feed': '#ea580c',
  'text-note': '#64748b',
}

type Dashboard = {
  id: string
  name: string
  widgetCount: number
  widgetTypes: string[]
  updatedAt: Date
}

function formatRelative(date: Date): string {
  const diff = Date.now() - date.getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return `${Math.floor(days / 30)} months ago`
}

function MiniPreview({ types }: { types: string[] }) {
  const slots = types.slice(0, 4)
  while (slots.length < 4) slots.push('')
  return (
    <div className="grid h-10 w-14 flex-shrink-0 grid-cols-2 gap-0.5 rounded bg-[#07070f] p-1.5">
      {slots.map((t, i) => (
        <div
          key={i}
          className="rounded-sm opacity-80"
          style={{ backgroundColor: t ? WIDGET_COLORS[t] ?? '#334155' : '#1e293b' }}
        />
      ))}
    </div>
  )
}

export function DashboardCard({ dashboard }: { dashboard: Dashboard }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [renameValue, setRenameValue] = useState(dashboard.name)

  const handleShare = () => {
    navigator.clipboard.writeText(shareUrl(dashboard.id))
      .then(() => toast.success('Link copied'))
      .catch(() => toast.error('Could not copy link'))
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${dashboard.name}"? This cannot be undone.`)) return
    const res = await fetch(`/api/dashboards/${dashboard.id}`, { method: 'DELETE' })
    if (res.ok || res.status === 204) {
      toast.success('Dashboard deleted')
      router.refresh()
    } else {
      toast.error('Failed to delete')
    }
  }

  const handleRename = async () => {
    const trimmed = renameValue.trim()
    if (!trimmed || trimmed === dashboard.name) { setRenaming(false); return }
    const res = await fetch(`/api/dashboards/${dashboard.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: trimmed }),
    })
    if (res.ok) {
      setRenaming(false)
      router.refresh()
    } else {
      toast.error('Failed to rename')
    }
  }

  const handleDuplicate = async () => {
    setMenuOpen(false)
    const res = await fetch(`/api/dashboards/${dashboard.id}`)
    if (!res.ok) { toast.error('Failed to duplicate'); return }
    const data = await res.json() as { widgets: unknown; layout: unknown }
    const createRes = await fetch('/api/dashboards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `Copy of ${dashboard.name}`,
        widgets: data.widgets,
        layout: data.layout,
      }),
    })
    if (createRes.ok) {
      toast.success('Dashboard duplicated')
      router.refresh()
    } else {
      toast.error('Failed to duplicate')
    }
  }

  return (
    <li className="flex items-center gap-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0f0f1a] px-4 py-3.5">
      <MiniPreview types={dashboard.widgetTypes} />
      <div className="min-w-0 flex-1">
        {renaming ? (
          <input
            autoFocus
            className="w-full rounded border border-indigo-500/50 bg-[rgba(255,255,255,0.05)] px-1.5 py-0.5 text-sm text-[#f9fafb] outline-none"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setRenaming(false) }}
          />
        ) : (
          <p className="truncate text-sm font-semibold text-[#f9fafb]">{dashboard.name}</p>
        )}
        <p className="mt-0.5 text-xs text-[#6b7280]">
          {dashboard.widgetCount} widget{dashboard.widgetCount !== 1 ? 's' : ''} · Edited {formatRelative(dashboard.updatedAt)}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <Link
          href={`/builder/${dashboard.id}`}
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={handleShare}
          className="rounded-md border border-[rgba(255,255,255,0.08)] px-3 py-1.5 text-xs text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          Share
        </button>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-md border border-[rgba(255,255,255,0.08)] px-2.5 py-1.5 text-xs text-[#9ca3af] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full z-10 mt-1 w-36 overflow-hidden rounded-lg border border-[rgba(255,255,255,0.08)] bg-[#1a1a2e] shadow-xl">
              <button
                onClick={handleDuplicate}
                className="w-full px-3 py-2 text-left text-xs text-[#d1d5db] hover:bg-[rgba(255,255,255,0.06)]"
              >
                Duplicate
              </button>
              <button
                onClick={() => { setMenuOpen(false); setRenaming(true) }}
                className="w-full px-3 py-2 text-left text-xs text-[#d1d5db] hover:bg-[rgba(255,255,255,0.06)]"
              >
                Rename
              </button>
              <button
                onClick={() => { setMenuOpen(false); handleDelete() }}
                className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-[rgba(255,255,255,0.06)]"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}
