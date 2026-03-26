import { render, screen } from '@testing-library/react'
import { PricingCard } from '@/components/ui/pricing-card'

describe('PricingCard', () => {
  it('renders plan name, price, and list items', () => {
    render(
      <PricingCard.Card>
        <PricingCard.Header>
          <PricingCard.Plan>
            <PricingCard.PlanName>Pro</PricingCard.PlanName>
          </PricingCard.Plan>
          <PricingCard.Price>
            <PricingCard.MainPrice>$15</PricingCard.MainPrice>
            <PricingCard.Period>/mo</PricingCard.Period>
          </PricingCard.Price>
        </PricingCard.Header>
        <PricingCard.Body>
          <PricingCard.List>
            <PricingCard.ListItem>Unlimited dashboards</PricingCard.ListItem>
          </PricingCard.List>
        </PricingCard.Body>
      </PricingCard.Card>
    )
    expect(screen.getByText('Pro')).toBeTruthy()
    expect(screen.getByText('$15')).toBeTruthy()
    expect(screen.getByText('/mo')).toBeTruthy()
    expect(screen.getByText('Unlimited dashboards')).toBeTruthy()
  })

  it('renders Badge when provided', () => {
    render(
      <PricingCard.Card>
        <PricingCard.Header>
          <PricingCard.Badge>Popular</PricingCard.Badge>
        </PricingCard.Header>
        <PricingCard.Body><PricingCard.List /></PricingCard.Body>
      </PricingCard.Card>
    )
    expect(screen.getByText('Popular')).toBeTruthy()
  })
})
