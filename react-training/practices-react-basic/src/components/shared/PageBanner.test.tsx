import { render, screen, within } from '@testing-library/react'
import { createRef } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { PageBanner } from './PageBanner'
import type { Ref } from 'react'

const BREADCRUMB = [
  { label: 'Home', to: '/' },
  { label: 'Cart', to: '/cart' },
  { label: 'Checkout' },
]

function renderBanner(headingRef?: Ref<HTMLHeadingElement>) {
  render(
    <MemoryRouter>
      <PageBanner title="Checkout" breadcrumb={BREADCRUMB} headingRef={headingRef} />
    </MemoryRouter>
  )
}

describe('PageBanner', () => {
  it('shows the breadcrumb with the last item as the current page', () => {
    renderBanner()
    const breadcrumb = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(breadcrumb).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(breadcrumb).getByRole('link', { name: 'Cart' })).toHaveAttribute('href', '/cart')
    expect(within(breadcrumb).getByText('Checkout')).toHaveAttribute('aria-current', 'page')
  })

  it('shows the title as the only level 1 heading, not focusable without a ref', () => {
    renderBanner()
    const heading = screen.getByRole('heading', { level: 1, name: 'Checkout' })
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(heading).not.toHaveAttribute('tabindex')
  })

  it('makes the heading a script focus target when a ref is given', () => {
    const headingRef = createRef<HTMLHeadingElement>()
    renderBanner(headingRef)
    const heading = screen.getByRole('heading', { level: 1, name: 'Checkout' })
    expect(headingRef.current).toBe(heading)
    expect(heading).toHaveAttribute('tabindex', '-1')
  })
})
