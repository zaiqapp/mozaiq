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
    <header className="flex h-12 items-center justify-between border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0f] px-4">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
          <span className="text-sm font-bold text-[#f9fafb]">Mozaiq</span>
        </Link>
        <span className="text-[rgba(255,255,255,0.15)]">|</span>
        {editingName ? (
          <input
            autoFocus
            className="rounded border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-sm text-[#f9fafb] outline-none focus:border-cyan-500/50"
            value={name}
            onChange={(e) => setDashboardName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
          />
        ) : (
          <span
            className="cursor-pointer text-sm text-[#9ca3af] hover:text-[#f9fafb]"
            onClick={() => setEditingName(true)}
          >
            {name}
          </span>
        )}
        {isDirty && <span className="text-xs text-[#4b5563]">•</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => clearCanvas()}
          className="flex items-center gap-1.5 rounded px-3 py-1.5 text-xs text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]"
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 rounded border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded border border-[rgba(255,255,255,0.1)] px-3 py-1.5 text-xs text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]"
        >
          <Share2 className="h-3.5 w-3.5" /> Share
        </button>
        {id && (
          <Link
            href={`/dashboard/${id}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs text-white hover:opacity-90"
          >
            <Eye className="h-3.5 w-3.5" /> Preview
          </Link>
        )}
      </div>
    </header>
  )
}
