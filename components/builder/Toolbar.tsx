'use client'
import { useState } from 'react'
import { Save, Share2, Eye, Trash2, Loader2 } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard'
import { toast } from 'sonner'
import { shareUrl } from '@/lib/utils'
import Link from 'next/link'

export function Toolbar() {
  const { name, id, isDirty, isSaving, setDashboardName, saveDashboard, clearCanvas } = useDashboardStore()
  const [editingName, setEditingName] = useState(false)

  const handleSave = async () => {
    try {
      await saveDashboard()
      toast.success('Dashboard saved')
    } catch {
      toast.error('Failed to save — please try again')
    }
  }

  const handleShare = () => {
    if (!id) { toast.error('Save your dashboard first to get a share link'); return }
    navigator.clipboard.writeText(shareUrl(id))
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Could not copy link'))
  }

  return (
    <header className="flex h-12 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <div className="h-6 w-6 rounded bg-indigo-600" />
          <span className="text-sm font-bold text-gray-900">Mozaiq</span>
        </Link>
        <span className="text-gray-300">|</span>
        {editingName ? (
          <input
            autoFocus
            className="rounded border border-indigo-300 px-2 py-0.5 text-sm outline-none"
            value={name}
            onChange={(e) => setDashboardName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
          />
        ) : (
          <span
            className="cursor-pointer text-sm text-gray-700 hover:text-indigo-600"
            onClick={() => setEditingName(true)}
          >
            {name}
          </span>
        )}
        {isDirty && <span className="text-xs text-gray-400">•</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => clearCanvas()}
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
        {id && (
          <Link
            href={`/dashboard/${id}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded bg-indigo-600 px-3 py-1.5 text-xs text-white hover:bg-indigo-700"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </Link>
        )}
      </div>
    </header>
  )
}
