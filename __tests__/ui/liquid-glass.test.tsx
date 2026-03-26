import { render, screen } from '@testing-library/react'
import { GlassEffect } from '@/components/ui/liquid-glass'

describe('GlassEffect', () => {
  it('renders children', () => {
    render(<GlassEffect><span>hello</span></GlassEffect>)
    expect(screen.getByText('hello')).toBeTruthy()
  })

  it('applies a custom className to the outer wrapper', () => {
    const { container } = render(
      <GlassEffect className="test-class"><span>x</span></GlassEffect>
    )
    expect(container.firstChild).toHaveClass('test-class')
  })
})
