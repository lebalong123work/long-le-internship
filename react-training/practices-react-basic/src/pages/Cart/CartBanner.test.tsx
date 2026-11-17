import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { CartBanner } from './CartBanner'

function renderBanner() {
  render(
    <MemoryRouter>
      <CartBanner />
    </MemoryRouter>
  )
}

describe('CartBanner', () => {
  it('shows the breadcrumb Home / Cart with Cart as the current page', () => {
    renderBanner()
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(breadcrumb).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(breadcrumb).getByText('Cart')).toHaveAttribute('aria-current', 'page')
  })

  it('shows the page title Cart as the level 1 heading', () => {
    renderBanner()
    expect(screen.getByRole('heading', { level: 1, name: 'Cart' })).toBeInTheDocument()
  })
})
