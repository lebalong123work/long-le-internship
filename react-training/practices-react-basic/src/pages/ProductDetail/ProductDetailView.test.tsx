import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RATING_TEXT } from '@/constants/product'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { product } from '@/test/fixtures'
import { ProductDetailView } from './ProductDetailView'
import type { Product } from '@/types'

const PRODUCT: Product = {
  ...product('p1'),
  description: 'Soft cotton tee',
  colors: ['Black', 'Blue', 'Green'],
  sizes: ['S', 'M', 'L', 'XL'],
}

function viewOf(item: Product, focusHeadingOnMount?: boolean): JSX.Element {
  return (
    <MemoryRouter>
      <ProductDetailView product={item} focusHeadingOnMount={focusHeadingOnMount} />
    </MemoryRouter>
  )
}

function renderView(overrides: Partial<Product> = {}, focusHeadingOnMount?: boolean) {
  const item = { ...PRODUCT, ...overrides }
  const view = render(viewOf(item, focusHeadingOnMount))
  return { ...view, item, user: userEvent.setup() }
}

function heading(): HTMLElement {
  return screen.getByRole('heading', { level: 1 })
}

function quantityValue(): string {
  const group = screen.getByRole('group', { name: `Quantity of ${PRODUCT.name}` })
  return group.querySelector('[aria-live]')?.textContent ?? ''
}

function plusButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Increase quantity' })
}

function minusButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Decrease quantity' })
}

function checkedSize(): string | null {
  const group = screen.getByRole('group', { name: PRODUCT_DETAIL_TEXT.size })
  const checked = within(group)
    .getAllByRole('radio')
    .find((radio) => radio instanceof HTMLInputElement && radio.checked)
  return checked?.getAttribute('value') ?? null
}

describe('ProductDetailView', () => {
  it('renders the product name as the page heading', () => {
    renderView()
    expect(heading()).toHaveTextContent(PRODUCT.name)
  })

  it('links Home and Shop and marks the name current', () => {
    renderView()
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(breadcrumb).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(breadcrumb).getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/shop')
    expect(within(breadcrumb).getByText(PRODUCT.name)).toHaveAttribute('aria-current', 'page')
  })

  it('shows the description and the long price $40 USD', () => {
    renderView()
    expect(screen.getByText('Soft cotton tee')).toHaveClass('text-medium-dark')
    expect(screen.getByText('$40 USD')).toBeInTheDocument()
  })

  it('shows the stars, ( 1k ) and the review count for screen readers', () => {
    renderView()
    expect(screen.getByRole('img', { name: RATING_TEXT.rating(5) })).toHaveClass('gap-2')
    expect(screen.getByText('( 1k )')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('1,000 reviews')).toHaveClass('sr-only')
  })

  it('shows In Stock with the count', () => {
    renderView()
    expect(screen.getByText(PRODUCT_DETAIL_TEXT.inStock)).toBeInTheDocument()
    expect(screen.getByText('( 1234 )')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('1234 in stock')).toHaveClass('sr-only')
  })

  it('shows Out of Stock for stock 0', () => {
    renderView({ stock: 0 })
    expect(screen.getByText(PRODUCT_DETAIL_TEXT.outOfStock)).toBeInTheDocument()
    expect(screen.queryByText(PRODUCT_DETAIL_TEXT.inStock)).not.toBeInTheDocument()
  })

  it.each([
    ['S', ['XL', 'S']],
    ['M', ['M', 'L']],
  ])('selects %s by default for %j', (expected, sizes) => {
    renderView({ sizes })
    expect(checkedSize()).toBe(expected)
  })

  it('hides the size group without sizes', () => {
    renderView({ sizes: [] })
    expect(screen.queryByRole('group', { name: PRODUCT_DETAIL_TEXT.size })).not.toBeInTheDocument()
  })

  it('starts with no color and checks a clicked color', async () => {
    const { user } = renderView()
    for (const radio of within(
      screen.getByRole('group', { name: PRODUCT_DETAIL_TEXT.color })
    ).getAllByRole('radio')) {
      expect(radio).not.toBeChecked()
    }
    await user.click(screen.getByRole('radio', { name: 'Blue' }))
    expect(screen.getByRole('radio', { name: 'Blue' })).toBeChecked()
  })

  it('starts at 1 and adds one with +', async () => {
    const { user } = renderView()
    expect(quantityValue()).toBe('1')
    await user.click(plusButton())
    expect(quantityValue()).toBe('2')
  })

  it('shows 0 with both buttons disabled for stock 0', () => {
    renderView({ stock: 0 })
    expect(quantityValue()).toBe('0')
    expect(plusButton()).toBeDisabled()
    expect(minusButton()).toBeDisabled()
  })

  it('disables + at the stock', async () => {
    const { user } = renderView({ stock: 2 })
    await user.click(plusButton())
    expect(quantityValue()).toBe('2')
    expect(plusButton()).toBeDisabled()
  })

  it('clamps the quantity when stock drops on refetch', async () => {
    const { user, rerender } = renderView({ stock: 5 })
    await user.click(plusButton())
    await user.click(plusButton())
    await user.click(plusButton())
    expect(quantityValue()).toBe('4')
    rerender(viewOf({ ...PRODUCT, stock: 2 }))
    expect(quantityValue()).toBe('2')
  })

  it('falls back to the default size when the chosen size disappears', async () => {
    const { user, rerender } = renderView()
    await user.click(screen.getByRole('radio', { name: 'XL' }))
    expect(checkedSize()).toBe('XL')
    rerender(viewOf({ ...PRODUCT, sizes: ['S', 'M'] }))
    expect(checkedSize()).toBe('S')
  })

  it('clears the color when it disappears', async () => {
    const { user, rerender } = renderView()
    await user.click(screen.getByRole('radio', { name: 'Green' }))
    rerender(viewOf({ ...PRODUCT, colors: ['Black', 'Blue'] }))
    for (const radio of within(
      screen.getByRole('group', { name: PRODUCT_DETAIL_TEXT.color })
    ).getAllByRole('radio')) {
      expect(radio).not.toBeChecked()
    }
  })

  it('focuses the heading with a visible ring when asked and focus is on body', () => {
    renderView({}, true)
    expect(heading()).toHaveFocus()
    expect(heading()).toHaveAttribute('data-script-focus', 'true')
  })

  it('leaves focus alone when it is elsewhere', () => {
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()
    renderView({}, true)
    expect(outside).toHaveFocus()
    outside.remove()
  })
})
