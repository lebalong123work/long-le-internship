import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ButtonLink } from './ButtonLink'

const TARGET = '/shop'

function renderWithRoutes(variant?: 'primary' | 'light', className?: string) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={
            <ButtonLink to={TARGET} variant={variant} className={className}>
              Shop Now
            </ButtonLink>
          }
        />
        <Route path={TARGET} element={<p>Shop page</p>} />
      </Routes>
    </MemoryRouter>
  )
}

function link(): HTMLElement {
  return screen.getByRole('link', { name: 'Shop Now' })
}

describe('ButtonLink variants', () => {
  it('renders a link with the primary button look by default', () => {
    renderWithRoutes()

    expect(link()).toHaveAttribute('href', TARGET)
    expect(link()).toHaveClass(
      'bg-brand',
      'text-white',
      'shadow-button',
      'h-12',
      'rounded-none',
      'px-[34px]',
      'py-2.5'
    )
  })

  it('is a link, not a button', () => {
    renderWithRoutes()

    expect(link().tagName).toBe('A')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders light with a white background and gradient text', () => {
    renderWithRoutes('light')

    expect(link()).toHaveClass('bg-white', 'shadow-button-light')
    expect(screen.getByText('Shop Now')).toHaveClass('bg-brand', 'bg-clip-text', 'text-transparent')
  })

  it('does not use the primary gradient background for light', () => {
    renderWithRoutes('light')

    expect(link()).not.toHaveClass('bg-brand')
    expect(link()).not.toHaveClass('shadow-button')
  })
})

describe('ButtonLink interaction classes', () => {
  it('uses the focus ring and the link hover rule', () => {
    renderWithRoutes()

    expect(link()).toHaveClass(
      'focus-visible:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-primary',
      'can-hover:hover:opacity-90'
    )
  })

  it('does not use the enabled-only hover or disabled classes', () => {
    renderWithRoutes()

    expect(link()).not.toHaveClass('can-hover:enabled:hover:opacity-90')
    expect(link()).not.toHaveClass('disabled:opacity-50')
    expect(link()).not.toHaveClass('disabled:cursor-not-allowed')
  })
})

describe('ButtonLink navigation', () => {
  it('opens `to` on click', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    await user.click(link())

    expect(screen.getByText('Shop page')).toBeInTheDocument()
  })

  it('does not navigate on Space', async () => {
    const user = userEvent.setup()
    renderWithRoutes()

    link().focus()
    await user.keyboard(' ')

    expect(link()).toBeInTheDocument()
    expect(screen.queryByText('Shop page')).toBeNull()
  })
})

describe('ButtonLink className', () => {
  it('adds the caller className', () => {
    renderWithRoutes('primary', 'w-[180px]')

    expect(link()).toHaveClass('w-[180px]', 'bg-brand')
  })

  it('replaces a conflicting variant class instead of keeping both', () => {
    renderWithRoutes('primary', 'px-0')

    expect(link()).toHaveClass('px-0')
    expect(link()).not.toHaveClass('px-[34px]')
  })
})
