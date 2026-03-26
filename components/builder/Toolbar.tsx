'use client'
import { useState, useEffect } from 'react'
import { Save, Share2, Eye, Trash2, Loader2, Sun, Moon, ArrowUpRight, Database } from 'lucide-react'
import { useAuth, useClerk } from '@clerk/nextjs'
import { useDashboardStore } from '@/store/dashboard'
import type { Widget } from '@/types/dashboard'
import type { LayoutItem } from 'react-grid-layout'
import { toast } from 'sonner'
import { shareUrl } from '@/lib/utils'
import Link from 'next/link'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'
import { UserMenu } from '@/components/nav/UserMenu'
import { GlobalDataSourcePanel } from './GlobalDataSourcePanel'

const PENDING_SAVE_KEY = 'mozaiq_pending_save'

export function Toolbar() {
  const { name, id, isDirty, isSaving, setDashboardName, saveDashboard, clearCanvas, dataSources, widgets, insightsDrawerOpen, setInsightsDrawerOpen } = useDashboardStore()
  const [editingName, setEditingName] = useState(false)
  const [dataPanelOpen, setDataPanelOpen] = useState(false)
  const { theme, toggleTheme } = useBuilderTheme()
  const { isSignedIn } = useAuth()
  const { openSignIn } = useClerk()
  const isDark = theme === 'dark'

  const handleSave = async () => {
    if (!isSignedIn) {
      const state = useDashboardStore.getState()
      if (state.widgets.length > 0) {
        sessionStorage.setItem(PENDING_SAVE_KEY, JSON.stringify({
          name: state.name,
          widgets: state.widgets,
          layout: state.layout,
          dataSources: state.dataSources,
        }))
      }
      openSignIn({ fallbackRedirectUrl: window.location.href })
      return
    }
    try {
      await saveDashboard()
      toast.success('Dashboard saved')
    } catch {
      toast.error('Failed to save — please try again')
    }
  }

  useEffect(() => {
    if (!isSignedIn) return
    const raw = sessionStorage.getItem(PENDING_SAVE_KEY)
    if (!raw) return
    sessionStorage.removeItem(PENDING_SAVE_KEY)
    try {
      const saved = JSON.parse(raw) as { name: string; widgets: Widget[]; layout: LayoutItem[]; dataSources?: [] }
      const { id: currentId } = useDashboardStore.getState()
      if (!currentId) {
        useDashboardStore.setState({ name: saved.name, widgets: saved.widgets, layout: saved.layout, dataSources: saved.dataSources ?? [], isDirty: true })
      }
      saveDashboard()
        .then(() => toast.success('Dashboard saved'))
        .catch(() => toast.error('Failed to save — please try again'))
    } catch { /* invalid JSON, ignore */ }
  }, [isSignedIn, saveDashboard])

  const handleShare = () => {
    if (!id) { toast.error('Save your dashboard first to get a share link'); return }
    navigator.clipboard.writeText(shareUrl(id))
      .then(() => toast.success('Link copied to clipboard'))
      .catch(() => toast.error('Could not copy link'))
  }

  return (
    <>
      <header
        className={`flex h-12 items-center justify-between px-4 ${
          isDark
            ? 'border-b border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] backdrop-blur-[12px]'
            : 'border-b border-gray-200 bg-white'
        }`}
        style={isDark ? { boxShadow: 'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)' } : undefined}
      >
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
          {/* Data Sources button */}
          <button
            onClick={() => setDataPanelOpen((prev) => !prev)}
            className={`relative flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs ${
              dataPanelOpen
                ? isDark
                  ? 'border-cyan-500/50 bg-[rgba(34,211,238,0.08)] text-cyan-400'
                  : 'border-indigo-400 bg-indigo-50 text-indigo-600'
                : isDark
                  ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            Data Sources
            {dataSources.length > 0 && (
              <span className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${isDark ? 'bg-cyan-500/20 text-cyan-400' : 'bg-indigo-100 text-indigo-600'}`}>
                {dataSources.length}
              </span>
            )}
          </button>

          <button onClick={toggleTheme} className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs ${isDark ? 'text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]' : 'text-gray-500 hover:bg-gray-100'}`} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          </button>
          <button onClick={() => clearCanvas()} className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs ${isDark ? 'text-[#4b5563] hover:bg-[rgba(255,255,255,0.05)]' : 'text-gray-500 hover:bg-gray-100'}`}>
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
          <button
            onClick={() => setInsightsDrawerOpen(!insightsDrawerOpen)}
            disabled={widgets.length === 0}
            className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs disabled:opacity-40 ${
              insightsDrawerOpen
                ? isDark
                  ? 'border-cyan-500/50 bg-[rgba(34,211,238,0.08)] text-cyan-400'
                  : 'border-indigo-400 bg-indigo-50 text-indigo-600'
                : isDark
                  ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            ✦ Insights
          </button>
          <button onClick={handleSave} disabled={isSaving} className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs disabled:opacity-50 ${isDark ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save
            {!isSignedIn && <ArrowUpRight className="h-3 w-3 opacity-50" />}
          </button>
          <button onClick={handleShare} className={`flex items-center gap-1.5 rounded border px-3 py-1.5 text-xs ${isDark ? 'border-[rgba(255,255,255,0.1)] text-[#6b7280] hover:bg-[rgba(255,255,255,0.05)]' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          {id && (
            <Link href={`/dashboard/${id}`} target="_blank" className="flex items-center gap-1.5 rounded bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs text-white hover:opacity-90">
              <Eye className="h-3.5 w-3.5" /> Preview
            </Link>
          )}
          <div className="ml-1 border-l border-[rgba(255,255,255,0.06)] pl-3">
            <UserMenu />
          </div>
        </div>
      </header>

      {dataPanelOpen && <GlobalDataSourcePanel />}
    </>
  )
}
