'use client'
import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useDashboardStore } from '@/store/dashboard'
import { toast } from 'sonner'
import { useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

export function AIGeneratorBar() {
  const [prompt, setPrompt] = useState('')
  const { isGenerating, generateDashboard } = useDashboardStore()
  const { theme } = useBuilderTheme()
  const isDark = theme === 'dark'

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    try {
      await generateDashboard(prompt)
      toast.success('Dashboard generated')
      setPrompt('')
    } catch {
      toast.error('Generation failed — please try again')
    }
  }

  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
        isDark
          ? 'border-[rgba(255,255,255,0.13)] bg-[rgba(255,255,255,0.07)] backdrop-blur-[12px]'
          : 'border-indigo-200 bg-indigo-50'
      }`}
      style={
        isDark
          ? {
              boxShadow:
                'inset 2px 2px 1px rgba(255,255,255,0.08), inset -1px -1px 1px rgba(255,255,255,0.04)',
            }
          : undefined
      }
    >
      <Sparkles className="h-4 w-4 flex-shrink-0 text-cyan-400" />
      <input
        className={`flex-1 rounded-md border px-2 py-1 text-sm outline-none ${
          isDark
            ? 'border-[rgba(255,255,255,0.09)] bg-[rgba(255,255,255,0.04)] text-[#9ca3af] placeholder:text-[#374151]'
            : 'border-indigo-200 bg-white text-gray-600 placeholder:text-gray-400'
        }`}
        placeholder='e.g. "An analytics dashboard for a SaaS startup tracking MRR, churn, and active users"'
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
        disabled={isGenerating}
      />
      <button
        onClick={handleGenerate}
        disabled={!prompt.trim() || isGenerating}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50 hover:opacity-90 ${
          isDark
            ? 'bg-gradient-to-r from-cyan-400 to-indigo-600 text-white'
            : 'bg-gradient-to-r from-cyan-400 to-indigo-600 text-white'
        }`}
      >
        {isGenerating ? 'Generating...' : 'Generate →'}
      </button>
    </div>
  )
}
