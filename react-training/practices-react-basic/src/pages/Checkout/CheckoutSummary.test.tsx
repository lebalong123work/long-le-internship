import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { product } from '@/test/fixtures'
import { CheckoutSummary } from './CheckoutSummary'
import { hasStockIssue } from './stockIssue'
import type { CartLine, CartSummary } from '@/hooks/useCartLines'

const TEE: CartLine = {
  item: { id: 'p1__Black__S', productId: 'p1', color: 'Black', size: 'S', quantity: 2 },
  product: { ...product('p1'), name: 'Tee One', price: 40, stock: 5 },
}
const POLO: CartLine = {
  item: { id: 'p2__Blue__M', productId: 'p2', color: '', size: '', quantity: 1 },
  product: { ...product('p2'), name: 'Polo Two', price: 25.5, stock: 3, images: [], thumbnail: '' },
}
const SUMMARY: CartSummary = { itemCount: 3, subtotal: 105.5, shippingFee: 0, total: 105.5 }

function withStock(line: CartLine, stock: number): CartLine {
  return { ...line, product: line.product && { ...line.product, stock } }
}

function renderSummary(lines: CartLine[], isPlaceOrderBlocked = hasStockIssue(lines)) {
  render(
    <MemoryRouter>
      <form>
        <CheckoutSummary
          lines={lines}
          summary={SUMMARY}
          isPlaceOrderBlocked={isPlaceOrderBlocked}
        />
      </form>
    </MemoryRouter>
  )
  return screen.getByRole('region', { name: 'Order summary' })
}

function placeOrder() {
  return screen.getByRole('button', { name: 'Place Order' })
}

describe('CheckoutSummary', () => {
  it('lists each line with image, variant, quantity and line price', () => {
    const region = renderSummary([TEE, POLO])
    const [tee, polo] = within(region).getAllByRole('listitem')
    expect(within(tee).getByText('Tee One')).toBeInTheDocument()
    expect(within(tee).getByText('Color : Black · Size : S')).toBeInTheDocument()
    expect(within(tee).getByText('Qty 2')).toBeInTheDocument()
    expect(within(tee).getByText('$80 USD')).toBeInTheDocument()
    expect(tee.querySelector('img')).toHaveAttribute('src', '/images/products/p1.jpg')
    expect(within(polo).getByText('$25.50 USD')).toBeInTheDocument()
    expect(polo.querySelector('img')).toBeNull()
  })

  it('shows the subtotal, free shipping and the total', () => {
    const region = renderSummary([TEE, POLO])
    expect(within(region).getByText('Subtotal').nextSibling).toHaveTextContent('$105.50 USD')
    expect(within(region).getByText('Shipping').nextSibling).toHaveTextContent('Free')
    expect(within(region).getByText('Total').nextSibling).toHaveTextContent('$105.50 USD')
  })

  it('marks an out of stock line and a quantity above the stock', () => {
    const morePolos: CartLine = { ...POLO, item: { ...POLO.item, quantity: 4 } }
    const region = renderSummary([withStock(TEE, 0), morePolos])
    expect(within(region).getByText('Out of Stock')).toBeInTheDocument()
    expect(within(region).getByText('Only 3 left')).toBeInTheDocument()
  })

  it('blocks Place Order with a message and a link back to the cart on a stock problem', () => {
    renderSummary([withStock(TEE, 1), POLO])
    expect(screen.getByText('Only 1 left')).toBeInTheDocument()
    expect(placeOrder()).toBeDisabled()
    expect(placeOrder()).toHaveAccessibleDescription(
      'Some products are out of stock. Update your cart to continue.'
    )
    expect(screen.getByRole('link', { name: 'Back to cart' })).toHaveAttribute('href', '/cart')
  })

  it('enables the submit button when the quantity equals the stock', () => {
    renderSummary([withStock(TEE, 2), POLO])
    expect(placeOrder()).toBeEnabled()
    expect(placeOrder()).toHaveAttribute('type', 'submit')
    expect(placeOrder()).not.toHaveAccessibleDescription()
    expect(screen.queryByRole('link', { name: 'Back to cart' })).toBeNull()
    expect(screen.queryByText(/Only \d+ left|Out of Stock/)).toBeNull()
  })
})
