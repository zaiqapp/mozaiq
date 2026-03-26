import { render, screen } from '@testing-library/react'
import { BentoGrid, type BentoItem } from '@/components/ui/bento-grid'

const items: BentoItem[] = [
  { title: 'Alpha', description: 'First', colSpan: 2, hasPersistentHover: true },
  { title: 'Beta', description: 'Second', colSpan: 1 },
  { title: 'Gamma', description: 'Third', colSpan: 3 },
]

describe('BentoGrid', () => {
  it('renders all item titles', () => {
    render(<BentoGrid items={items} />)
    expect(screen.getByText(/Alpha/)).toBeTruthy()
    expect(screen.getByText(/Beta/)).toBeTruthy()
    expect(screen.getByText(/Gamma/)).toBeTruthy()
  })

  it('applies col-span-2 class for colSpan=2 item', () => {
    const { container } = render(<BentoGrid items={items} />)
    const alphaTile = container.querySelector('[data-testid="bento-item-0"]')
    expect(alphaTile?.className).toContain('col-span-2')
  })

  it('applies col-span-3 class for colSpan=3 item', () => {
    const { container } = render(<BentoGrid items={items} />)
    const gammaTile = container.querySelector('[data-testid="bento-item-2"]')
    expect(gammaTile?.className).toContain('col-span-3')
  })

  it('applies persistent-hover class when hasPersistentHover=true', () => {
    const { container } = render(<BentoGrid items={items} />)
    const alphaTile = container.querySelector('[data-testid="bento-item-0"]')
    expect(alphaTile?.className).toContain('bento-hover')
  })
})
