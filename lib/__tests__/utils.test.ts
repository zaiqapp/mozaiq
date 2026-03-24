import { shareUrl, cn } from '../utils'

describe('shareUrl', () => {
  it('builds share URL from id', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://zaiq.app'
    expect(shareUrl('abc123')).toBe('https://zaiq.app/dashboard/abc123')
  })

  it('falls back to localhost when env not set', () => {
    delete process.env.NEXT_PUBLIC_APP_URL
    expect(shareUrl('abc123')).toBe('http://localhost:3000/dashboard/abc123')
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('handles conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c')
  })
})
