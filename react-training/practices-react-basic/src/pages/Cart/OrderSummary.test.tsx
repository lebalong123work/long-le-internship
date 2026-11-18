import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { OrderSummary } from './OrderSummary'
import type { CartSummary } from '@/hooks/useCartLines'

function summaryOf(itemCount: number, total: number): CartSummary {
  return { itemCount, subtotal: total, shippingFee: 0, total }
}

function renderSummary(summary: CartSummary, isCheckoutBlocked = false) {
  render(
    <MemoryRouter>
      <OrderSummary summary={summary} isCheckoutBlocked={isCheckoutBlocked} />
    </MemoryRouter>
  )
}

describe('OrderSummary', () => {
  it('shows the product count as the sum of quantities', () => {
    renderSummary(summaryOf(4, 160))
    expect(screen.getByText('4 Products')).toBeInTheDocument()
  })

  it('uses the singular for one product', () => {
    renderSummary(summaryOf(1, 40))
    expect(screen.getByText('1 Product')).toBeInTheDocument()
  })

  it('shows the total in the long price format', () => {
    renderSummary(summaryOf(4, 160))
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('$160 USD')).toBeInTheDocument()
  })

  it('keeps two decimals for a total with cents', () => {
    renderSummary(summaryOf(1, 39.5))
    expect(screen.getByText('$39.50 USD')).toBeInTheDocument()
  })

  it('links Checkout to the checkout page without a subtotal or shipping row', () => {
    renderSummary(summaryOf(4, 160))
    const region = screen.getByRole('region', { name: 'Order summary' })
    expect(screen.getByRole('link', { name: 'Checkout' })).toHaveAttribute('href', '/checkout')
    expect(screen.queryByRole('button')).toBeNull()
    expect(region).not.toHaveTextContent(/subtotal|shipping/i)
  })

  it('replaces the link with a disabled button and a message when checkout is blocked', () => {
    renderSummary(summaryOf(4, 80), true)
    const button = screen.getByRole('button', { name: 'Checkout' })
    expect(button).toBeDisabled()
    expect(button).toHaveAccessibleDescription(
      'Remove unavailable products to continue to checkout.'
    )
    expect(screen.queryByRole('link')).toBeNull()
  })
})
