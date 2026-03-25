'use client'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
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
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
      isDark
        ? 'border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.04)]'
        : 'border-indigo-200 bg-indigo-50'
    }`}>
      <Sparkles className="h-4 w-4 flex-shrink-0 text-cyan-400" />
      <input
        className={`flex-1 bg-transparent text-sm outline-none ${
          isDark
            ? 'text-[#9ca3af] placeholder:text-[#374151]'
            : 'text-gray-600 placeholder:text-gray-400'
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
        className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-cyan-400 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50 hover:opacity-90"
      >
        {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {isGenerating ? 'Generating...' : 'Generate →'}
      </button>
    </div>
  )
}
