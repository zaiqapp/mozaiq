'use client'
import { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

interface BuilderThemeContextValue {
  theme: Theme
  toggleTheme: () => void
}

const BuilderThemeContext = createContext<BuilderThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
})

export function BuilderThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')

  useEffect(() => {
    const saved = localStorage.getItem('builder-theme') as Theme | null
    if (saved === 'light' || saved === 'dark') setTheme(saved)
  }, [])

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      localStorage.setItem('builder-theme', next)
      return next
    })
  }

  return (
    <BuilderThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </BuilderThemeContext.Provider>
  )
}

export function useBuilderTheme(): BuilderThemeContextValue {
  return useContext(BuilderThemeContext)
}
