import { render, screen, act } from '@testing-library/react'
import { BuilderThemeProvider, useBuilderTheme } from '@/components/builder/BuilderThemeProvider'

function TestConsumer() {
  const { theme, toggleTheme } = useBuilderTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  )
}

describe('BuilderThemeProvider', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to dark', () => {
    render(<BuilderThemeProvider><TestConsumer /></BuilderThemeProvider>)
    expect(screen.getByTestId('theme').textContent).toBe('dark')
  })

  it('toggles theme and persists to localStorage', () => {
    render(<BuilderThemeProvider><TestConsumer /></BuilderThemeProvider>)
    act(() => screen.getByRole('button').click())
    expect(screen.getByTestId('theme').textContent).toBe('light')
    expect(localStorage.getItem('builder-theme')).toBe('light')
  })

  it('hydrates from localStorage on mount', () => {
    localStorage.setItem('builder-theme', 'light')
    render(<BuilderThemeProvider><TestConsumer /></BuilderThemeProvider>)
    act(() => {}) // flush effects
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('returns light default when used outside provider', () => {
    render(<TestConsumer />)
    expect(screen.getByTestId('theme').textContent).toBe('light')
  })
})
