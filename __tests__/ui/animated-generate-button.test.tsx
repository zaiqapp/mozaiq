import { render, screen, fireEvent } from '@testing-library/react'
import { AnimatedGenerateButton } from '@/components/ui/animated-generate-button'

describe('AnimatedGenerateButton', () => {
  it('shows labelIdle when not generating', () => {
    render(
      <AnimatedGenerateButton
        generating={false}
        labelIdle="Generate"
        labelActive="Building"
        highlightHueDeg={195}
        onClick={() => {}}
      />
    )
    expect(screen.getByText('Generate')).toBeTruthy()
  })

  it('shows labelActive when generating', () => {
    render(
      <AnimatedGenerateButton
        generating={true}
        labelIdle="Generate"
        labelActive="Building"
        highlightHueDeg={195}
        onClick={() => {}}
      />
    )
    expect(screen.getByText('Building')).toBeTruthy()
  })

  it('calls onClick when clicked and not generating', () => {
    const onClick = jest.fn()
    render(
      <AnimatedGenerateButton
        generating={false}
        labelIdle="Generate"
        labelActive="Building"
        highlightHueDeg={195}
        onClick={onClick}
      />
    )
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when generating=true', () => {
    render(
      <AnimatedGenerateButton
        generating={true}
        labelIdle="Generate"
        labelActive="Building"
        highlightHueDeg={195}
        onClick={() => {}}
      />
    )
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
