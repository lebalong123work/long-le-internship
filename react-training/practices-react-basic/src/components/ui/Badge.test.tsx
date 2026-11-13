import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

function renderCartLink(count: number) {
  const name = `Cart, ${count} items`
  return render(
    <a href="/cart" aria-label={name}>
      <img src="/icons/cart.svg" alt="" />
      <Badge count={count} />
    </a>
  )
}

describe('Badge count', () => {
  it('shows the count 3', () => {
    render(<Badge count={3} />)

    expect(screen.getByText('3')).toHaveClass('bg-badge', 'text-white', 'rounded-full', 'h-4')
  })

  it('renders nothing for 0', () => {
    const { container } = render(<Badge count={0} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('shows 99 as 99', () => {
    render(<Badge count={99} />)

    expect(screen.getByText('99')).toBeInTheDocument()
  })

  it('shows 100 as 99+', () => {
    render(<Badge count={100} />)

    expect(screen.getByText('99+')).toBeInTheDocument()
  })
})

describe('Badge accessibility', () => {
  it('is hidden from assistive tech', () => {
    render(<Badge count={3} />)

    expect(screen.getByText('3')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders nothing for a negative count', () => {
    const { container } = render(<Badge count={-1} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for NaN', () => {
    const { container } = render(<Badge count={Number.NaN} />)

    expect(container).toBeEmptyDOMElement()
  })

  it('keeps the parent link name "Cart, 3 items" unchanged', () => {
    renderCartLink(3)

    expect(screen.getByRole('link', { name: 'Cart, 3 items' })).toBeInTheDocument()
  })

  it('does not add "99+" to the parent link name for 120', () => {
    renderCartLink(120)

    const link = screen.getByRole('link')
    expect(link).toHaveAccessibleName('Cart, 120 items')
    expect(screen.getByText('99+')).toBeInTheDocument()
  })
})
