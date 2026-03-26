import { render, screen, act, fireEvent } from '@testing-library/react'
import { Nav } from '@/components/landing/Nav'

// Mock Clerk components
jest.mock('@clerk/nextjs', () => ({
  SignInButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  UserMenu: () => <div data-testid="user-menu" />,
}))

describe('Nav', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
  })

  it('renders logo text', () => {
    render(<Nav userId={null} />)
    expect(screen.getByText('Mozaiq')).toBeTruthy()
  })

  it('shows Sign In when not authenticated', () => {
    render(<Nav userId={null} />)
    expect(screen.getByText('Sign In')).toBeTruthy()
  })

  it('shows My Dashboards link when authenticated', () => {
    render(<Nav userId="user_123" />)
    expect(screen.getByText('My Dashboards')).toBeTruthy()
  })

  it('hides My Dashboards after scroll', () => {
    render(<Nav userId="user_123" />)
    expect(screen.getByText('My Dashboards')).toBeTruthy()

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
      fireEvent.scroll(window)
    })

    expect(screen.queryByText('My Dashboards')).toBeNull()
  })

  it('shows gradient CTA after scroll', () => {
    render(<Nav userId={null} />)

    act(() => {
      Object.defineProperty(window, 'scrollY', { value: 100, configurable: true })
      fireEvent.scroll(window)
    })

    expect(screen.getByText('Start Building →')).toBeTruthy()
  })
})
