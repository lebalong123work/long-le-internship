import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

function renderBagButton(isLoading = false) {
  return render(
    <Button variant="icon-gradient" aria-label="Add to bag" isLoading={isLoading}>
      <img src="/icons/bag.svg" alt="" data-testid="bag-icon" />
    </Button>
  )
}

function spinnerIn(button: HTMLElement): Element | null {
  return button.querySelector('.animate-spin')
}

describe('Button variants', () => {
  it('uses the primary style when no variant is given', () => {
    render(<Button>See More</Button>)

    expect(screen.getByRole('button', { name: 'See More' })).toHaveClass(
      'bg-brand',
      'text-white',
      'shadow-button',
      'h-12',
      'rounded-none',
      'px-[34px]',
      'py-2.5'
    )
  })

  it('does not use the primary gradient for the light variant', () => {
    render(<Button variant="light">Shop Now</Button>)

    const button = screen.getByRole('button', { name: 'Shop Now' })
    expect(button).not.toHaveClass('bg-brand')
    expect(button).not.toHaveClass('shadow-button')
  })

  it('renders light with a white background and gradient text', () => {
    render(<Button variant="light">Shop Now</Button>)

    const button = screen.getByRole('button', { name: 'Shop Now' })
    expect(button).toHaveClass('bg-white', 'shadow-button-light')
    expect(screen.getByText('Shop Now')).toHaveClass('bg-brand', 'bg-clip-text', 'text-transparent')
  })

  it('does not wrap primary content in gradient text', () => {
    render(<Button>See More</Button>)

    expect(screen.getByRole('button', { name: 'See More' }).querySelector('.bg-clip-text')).toBe(
      null
    )
  })

  it('renders icon-gradient as a 48 × 48 gradient square with the button shadow', () => {
    renderBagButton()

    const button = screen.getByRole('button', { name: 'Add to bag' })
    expect(button).toHaveClass('size-12', 'bg-brand', 'text-white', 'shadow-button')
  })

  it('does not add the text padding to icon-gradient', () => {
    renderBagButton()

    const button = screen.getByRole('button', { name: 'Add to bag' })
    expect(button).not.toHaveClass('px-[34px]')
    expect(button).not.toHaveClass('py-2.5')
  })
})

describe('Button type', () => {
  it('defaults to type button', () => {
    render(<Button>See More</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('keeps type submit when given', () => {
    render(<Button type="submit">Log In</Button>)

    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })
})

describe('Button click and disabled', () => {
  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>See More</Button>)

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const onClick = vi.fn()
    render(
      <Button onClick={onClick} disabled>
        See More
      </Button>
    )

    await userEvent.click(screen.getByRole('button'))

    expect(onClick).not.toHaveBeenCalled()
  })

  it('is disabled with 50% opacity when disabled', () => {
    render(<Button disabled>See More</Button>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('disabled:opacity-50', 'can-hover:enabled:hover:opacity-90')
  })

  it('is enabled when disabled is not set', () => {
    render(<Button>See More</Button>)

    expect(screen.getByRole('button')).toBeEnabled()
  })
})

describe('Button loading', () => {
  it('shows a spinner, sets aria-busy and blocks clicks while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button isLoading onClick={onClick}>
        Log In
      </Button>
    )

    const button = screen.getByRole('button', { name: 'Log In' })
    await userEvent.click(button)

    expect(spinnerIn(button)).not.toBe(null)
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(button).toBeDisabled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('shows no spinner and no aria-busy when not loading', () => {
    render(<Button>Log In</Button>)

    const button = screen.getByRole('button', { name: 'Log In' })
    expect(spinnerIn(button)).toBe(null)
    expect(button).not.toHaveAttribute('aria-busy')
  })

  it('replaces the icon with the spinner while loading', () => {
    renderBagButton(true)

    const button = screen.getByRole('button', { name: 'Add to bag' })
    expect(spinnerIn(button)).not.toBe(null)
    expect(screen.queryByTestId('bag-icon')).toBe(null)
  })

  it('keeps the icon when not loading', () => {
    renderBagButton()

    const button = screen.getByRole('button', { name: 'Add to bag' })
    expect(screen.getByTestId('bag-icon')).toBeInTheDocument()
    expect(spinnerIn(button)).toBe(null)
  })
})

describe('Button className', () => {
  it('adds a caller width class', () => {
    render(<Button className="w-[180px]">Checkout</Button>)

    expect(screen.getByRole('button')).toHaveClass('w-[180px]', 'bg-brand')
  })

  it('replaces a conflicting variant class instead of keeping both', () => {
    render(<Button className="h-10">Checkout</Button>)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-10')
    expect(button).not.toHaveClass('h-12')
  })
})

describe('Button focus', () => {
  it('has a 2px primary focus-visible ring', () => {
    render(<Button>See More</Button>)

    expect(screen.getByRole('button')).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-primary'
    )
  })

  it('has no ring class on plain focus', () => {
    render(<Button>See More</Button>)

    expect(screen.getByRole('button').className).not.toMatch(/(^|\s)focus:/)
  })
})
