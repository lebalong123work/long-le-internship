import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { product } from '@/test/fixtures'
import { CartItemRow } from './CartItemRow'
import type { CartItem, Product } from '@/types'

const P1: Product = { ...product('p1'), stock: 1234 }

function cartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'p1__Black__S',
    productId: 'p1',
    color: 'Black',
    size: 'S',
    quantity: 2,
    ...overrides,
  }
}

function renderRow(item: CartItem, rowProduct: Product | null = P1) {
  const onQuantityChange = vi.fn()
  const onRemove = vi.fn()
  const { container } = render(
    <MemoryRouter>
      <ul>
        <CartItemRow
          line={{ item, product: rowProduct }}
          onQuantityChange={onQuantityChange}
          onRemove={onRemove}
        />
      </ul>
    </MemoryRouter>
  )
  return { container, onQuantityChange, onRemove }
}

describe('CartItemRow', () => {
  it('links the product name to the product detail page', () => {
    renderRow(cartItem())
    expect(screen.getByRole('link', { name: 'Smart T-Shirt' })).toHaveAttribute('href', '/shop/p1')
  })

  it('shows the first product image as a decorative thumbnail', () => {
    const { container } = renderRow(cartItem())
    const image = container.querySelector('li img[width="80"]')
    expect(image).toHaveAttribute('src', '/images/products/p1.jpg')
    expect(image).toHaveAttribute('alt', '')
  })

  it('falls back to the card thumbnail when the product has no images', () => {
    const { container } = renderRow(cartItem(), { ...P1, images: [], thumbnail: '/card.jpg' })
    expect(container.querySelector('li img[width="80"]')).toHaveAttribute('src', '/card.jpg')
  })

  it('shows a placeholder box when the product has no image at all', () => {
    const { container } = renderRow(cartItem(), { ...P1, images: [], thumbnail: ' ' })
    expect(container.querySelector('li img[width="80"]')).toBeNull()
    expect(container.querySelector('li div[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('shows the selected color and size from the cart item', () => {
    renderRow(cartItem({ color: 'Blue', size: 'M' }))
    expect(screen.getByText('Color : Blue · Size : M')).toBeInTheDocument()
  })

  it('shows no variant line when the item has no color and no size', () => {
    renderRow(cartItem({ color: '', size: '' }))
    expect(screen.queryByText(/Color :|Size :/)).toBeNull()
  })

  it('shows the long price and the stock with their labels', () => {
    renderRow(cartItem())
    expect(screen.getByText('$40 USD')).toBeInTheDocument()
    expect(screen.getByText('Price')).toBeInTheDocument()
    expect(screen.getByText('1234')).toBeInTheDocument()
    expect(screen.getByText('In Stock')).toBeInTheDocument()
  })

  it('asks for one more when plus is clicked', async () => {
    const { onQuantityChange } = renderRow(cartItem({ quantity: 2 }))
    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
    expect(onQuantityChange).toHaveBeenCalledTimes(1)
    expect(onQuantityChange).toHaveBeenCalledWith(3)
  })

  it('asks for one less when minus is clicked', async () => {
    const { onQuantityChange } = renderRow(cartItem({ quantity: 2 }))
    await userEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }))
    expect(onQuantityChange).toHaveBeenCalledTimes(1)
    expect(onQuantityChange).toHaveBeenCalledWith(1)
  })

  it('disables minus at 1 and plus at the stock limit', () => {
    renderRow(cartItem({ quantity: 1 }), { ...P1, stock: 1 })
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled()
  })

  it('U5 plus at the stock limit is disabled and sends nothing when clicked', async () => {
    const { onQuantityChange } = renderRow(cartItem({ quantity: 3 }), { ...P1, stock: 3 })
    const plus = screen.getByRole('button', { name: 'Increase quantity' })
    expect(plus).toBeDisabled()
    await userEvent.click(plus)
    expect(onQuantityChange).not.toHaveBeenCalled()
  })

  it('clamps a quantity above the stock when it is changed', async () => {
    const { onQuantityChange } = renderRow(cartItem({ quantity: 9 }), { ...P1, stock: 5 })
    await userEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }))
    expect(onQuantityChange).toHaveBeenCalledWith(5)
  })

  it('shows Out of Stock and disables both quantity buttons at stock 0', async () => {
    const { onQuantityChange } = renderRow(cartItem(), { ...P1, stock: 0 })
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    expect(screen.queryByText('In Stock')).toBeNull()
    await userEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }))
    await userEvent.click(screen.getByRole('button', { name: 'Increase quantity' }))
    expect(onQuantityChange).not.toHaveBeenCalled()
  })

  it('removes the line once with a name that has product, color and size', async () => {
    const { onRemove } = renderRow(cartItem())
    expect(
      screen.getByRole('group', { name: 'Quantity of Smart T-Shirt, Black, S' })
    ).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove Smart T-Shirt, Black, S from cart' })
    )
    expect(onRemove).toHaveBeenCalledTimes(1)
  })

  it('shows an unavailable line with its stored variant and quantity only', () => {
    const { container } = renderRow(cartItem({ quantity: 2 }), null)
    expect(screen.getByText('Product unavailable')).toBeInTheDocument()
    expect(screen.getByText('Color : Black · Size : S')).toBeInTheDocument()
    expect(screen.getByText('Quantity : 2')).toBeInTheDocument()
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.queryByRole('group')).toBeNull()
    expect(screen.queryByText('Price')).toBeNull()
    expect(screen.queryByText(/In Stock|Out of Stock/)).toBeNull()
    expect(container.querySelector('li img[width="80"]')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('lets the customer remove an unavailable line', async () => {
    const { onRemove } = renderRow(cartItem(), null)
    await userEvent.click(
      screen.getByRole('button', { name: 'Remove unavailable product, Black, S from cart' })
    )
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})
