import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Breadcrumb } from './Breadcrumb'
import type { BreadcrumbItem } from './Breadcrumb'

const PDP_ITEMS: BreadcrumbItem[] = [
  { label: 'Home', to: '/' },
  { label: 'Shop', to: '/shop' },
  { label: 'Smart T-Shirt', to: '/shop/p1' },
]

function renderBreadcrumb(items: BreadcrumbItem[], variant?: 'dark' | 'light') {
  return render(
    <MemoryRouter>
      <Breadcrumb items={items} variant={variant} />
    </MemoryRouter>
  )
}

function list(): HTMLElement {
  return screen.getByRole('list')
}

describe('Breadcrumb links', () => {
  it('renders earlier items with a path as links', () => {
    renderBreadcrumb(PDP_ITEMS)

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/shop')
  })

  it('renders an earlier item without a path as plain text', () => {
    renderBreadcrumb([{ label: 'Home' }, { label: 'Cart' }])

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Home' })).toBe(null)
  })
})

describe('Breadcrumb current page', () => {
  it('marks the last item as the current page, bold, not a link', () => {
    renderBreadcrumb(PDP_ITEMS)

    const current = screen.getByText('Smart T-Shirt')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(current).toHaveClass('font-bold')
    expect(screen.queryByRole('link', { name: 'Smart T-Shirt' })).toBe(null)
  })

  it('gives earlier items no aria-current', () => {
    renderBreadcrumb(PDP_ITEMS)

    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('link', { name: 'Shop' })).not.toHaveAttribute('aria-current')
  })
})

describe('Breadcrumb structure', () => {
  it('renders a nav named Breadcrumb with an ordered list', () => {
    renderBreadcrumb(PDP_ITEMS)

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(nav.querySelector('ol')).toBe(list())
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('renders nothing for an empty list', () => {
    renderBreadcrumb([])

    expect(screen.queryByRole('navigation')).toBe(null)
  })

  it('shows a hidden separator between items', () => {
    renderBreadcrumb(PDP_ITEMS)

    const separators = screen.getAllByText('/')
    expect(separators).toHaveLength(2)
    separators.forEach((separator) => expect(separator).toHaveAttribute('aria-hidden', 'true'))
  })

  it('shows no separator for a single item', () => {
    renderBreadcrumb([{ label: 'Home' }])

    expect(screen.queryByText('/')).toBe(null)
  })
})

describe('Breadcrumb variants', () => {
  it('uses the dark color by default', () => {
    renderBreadcrumb(PDP_ITEMS)

    expect(list()).toHaveClass('text-dark', 'font-body', 'text-sm', 'gap-6', 'py-[9px]')
  })

  it('uses white, not dark, for the light variant', () => {
    renderBreadcrumb([{ label: 'Home', to: '/' }, { label: 'Cart' }], 'light')

    expect(list()).toHaveClass('text-white')
    expect(list()).not.toHaveClass('text-dark')
  })
})
