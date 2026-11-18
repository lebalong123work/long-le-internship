import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { HEADER_TEXT } from '@/constants/header'
import { ORDER_HISTORY_TEXT } from '@/constants/order'
import { ROUTES } from '@/constants/routes'
import { WISHLIST_TEXT } from '@/constants/wishlist'
import { useAuthStore } from '@/stores/authStore'
import { installDialogStub } from '@/test/dialogStub'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import { routes } from './index'
import type { User } from '@/types'

const customer: User = {
  id: 'u1',
  name: 'Test Customer',
  email: 'user@store.com',
  role: 'customer',
}

const ACCOUNT_PAGES = [
  { path: ROUTES.ACCOUNT.PROFILE, placeholder: 'Profile — placeholder' },
  { path: ROUTES.ACCOUNT.ORDERS, placeholder: ORDER_HISTORY_TEXT.heading },
  { path: ROUTES.ACCOUNT.WISHLIST, placeholder: WISHLIST_TEXT.heading },
]

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return router
}

function queryAccountNav(): HTMLElement | null {
  return screen.queryByRole('navigation', { name: HEADER_TEXT.accountNav })
}

function logIn(): void {
  useAuthStore.setState({ user: customer, token: 'mock-token-u1', isAuthenticated: true })
}

beforeAll(() => {
  installDialogStub()
})

beforeEach(() => {
  installMatchMediaStub(true)
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => {}))
  )
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('account routes — logged in', () => {
  it.each(ACCOUNT_PAGES)('$path renders inside the account layout', ({ path, placeholder }) => {
    logIn()
    renderAt(path)
    const main = within(screen.getByRole('main'))
    expect(main.getByText(placeholder)).toBeInTheDocument()
    expect(main.getByRole('navigation', { name: HEADER_TEXT.accountNav })).toBeInTheDocument()
  })

  it('other protected routes do not get the account layout', () => {
    logIn()
    renderAt(ROUTES.CART)
    expect(queryAccountNav()).not.toBeInTheDocument()
  })
})

describe('account routes — guest', () => {
  it.each(ACCOUNT_PAGES)('$path stays protected and opens login', ({ path }) => {
    const router = renderAt(path)
    const params = new URLSearchParams(router.state.location.search)
    expect(router.state.location.pathname).toBe(ROUTES.HOME)
    expect(params.get('auth')).toBe('login')
    expect(params.get('redirect')).toBe(path)
    expect(queryAccountNav()).not.toBeInTheDocument()
  })
})
