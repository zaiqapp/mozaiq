'use client'
import { useState } from 'react'
import { Save, Share2, Eye, Trash2, Loader2, Sun, Moon } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard'
import { toast } from 'sonner'
import { shareUrl } from '@/lib/utils'
import Link from 'next/link'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export function Toolbar() {
  const { name, id, isDirty, isSaving, setDashboardName, saveDashboard, clearCanvas } = useDashboardStore()
  const [editingName, setEditingName] = useState(false)
  const { theme, toggleTheme } = useBuilderTheme()
  const isDark = theme === 'dark'

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
    <header className={`flex h-12 items-center justify-between px-4 ${
      isDark
        ? 'border-b border-[rgba(255,255,255,0.06)] bg-[#0a0a0f]'
        : 'border-b border-gray-200 bg-white'
    }`}>
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <div className="h-6 w-6 rounded bg-gradient-to-br from-cyan-400 to-indigo-600" />
          <span className={`text-sm font-bold ${isDark ? 'text-[#f9fafb]' : 'text-gray-900'}`}>Mozaiq</span>
        </Link>
        <span className={isDark ? 'text-[rgba(255,255,255,0.15)]' : 'text-gray-300'}>|</span>
        {editingName ? (
          <input
            autoFocus
            className={`rounded border px-2 py-0.5 text-sm outline-none ${
              isDark
                ? 'border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] text-[#f9fafb] focus:border-cyan-500/50'
                : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-400'
            }`}
            value={name}
            onChange={(e) => setDashboardName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingName(false)}
          />
        ) : (
          <span
            className={`cursor-pointer text-sm ${
              isDark ? 'text-[#9ca3af] hover:text-[#f9fafb]' : 'text-gray-500 hover:text-gray-900'
            }`}
            onClick={() => setEditingName(true)}
          >
            {name}
          </span>
        )}
        {isDirty && <span className={`text-xs ${isDark ? 'text-[#4b5563]' : 'text-gray-400'}`}>•</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs ${
            isDark ? 'text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]' : 'text-gray-500 hover:bg-gray-100'
          }`}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
        <button
          onClick={() => clearCanvas()}
          className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs ${
            isDark ? 'text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]' : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <Trash2 className="h-3.5 w-3.5" /> Clear
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs disabled:opacity-50 ${
            isDark
              ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
        <button
          onClick={handleShare}
          className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs ${
            isDark
              ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]'
              : 'border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
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
