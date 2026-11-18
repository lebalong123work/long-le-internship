import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PRODUCT_CARD_TEXT } from '@/constants/productCard'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { WISHLIST_TEXT } from '@/constants/wishlist'
import { ApiError } from '@/services/apiClient'
import * as productService from '@/services/productService'
import * as wishlistService from '@/services/wishlistService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { product } from '@/test/fixtures'
import Wishlist from './index'
import type { Product, User } from '@/types'

vi.mock('@/services/productService')
vi.mock('@/services/wishlistService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const SERVER_ERROR = new ApiError(500, 'Server error')
const TEE: Product = { ...product('p1'), name: 'Tee One' }
const POLO: Product = { ...product('p2'), name: 'Polo Two' }
const PRODUCT_PAGE_TEXT = 'Product page'

const REMOVE_TEE = 'Remove Tee One from wishlist'
const ADD_TEE = /^Add to Cart ?: Tee One$/

let saved: string[]

function serveWishlist(ids: string[]): void {
  saved = ids
  vi.mocked(wishlistService.getWishlist).mockImplementation(() => Promise.resolve([...saved]))
  vi.mocked(wishlistService.remove).mockImplementation((_userId, productId) => {
    saved = saved.filter((id) => id !== productId)
    return Promise.resolve()
  })
  vi.mocked(productService.getByIds).mockImplementation((ids) =>
    Promise.resolve([TEE, POLO].filter((item) => ids.includes(item.id)))
  )
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[ROUTES.ACCOUNT.WISHLIST]}>
        <Routes>
          <Route path={ROUTES.ACCOUNT.WISHLIST} element={<Wishlist />} />
          <Route path="/shop/:productId" element={<p>{PRODUCT_PAGE_TEXT}</p>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { queryClient }
}

function heading(): HTMLElement {
  return screen.getByRole('heading', { level: 1, name: WISHLIST_TEXT.heading })
}

function cardTitles(): string[] {
  return within(screen.getByRole('list'))
    .getAllByRole('heading', { level: 3 })
    .map((title) => title.textContent ?? '')
}

function toastMessages(): string[] {
  return useToastStore.getState().toasts.map((toast) => toast.message)
}

async function showCards(ids: string[]) {
  serveWishlist(ids)
  const view = renderPage()
  await screen.findByRole('button', { name: REMOVE_TEE })
  return view
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
})

afterEach(() => {
  vi.resetAllMocks()
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  useToastStore.setState({ toasts: [] })
})

describe('Wishlist page — states', () => {
  it('P1 P2 shows the heading, a busy skeleton and the loading status while loading', () => {
    vi.mocked(wishlistService.getWishlist).mockReturnValue(new Promise<string[]>(() => {}))
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Wishlist />
        </MemoryRouter>
      </QueryClientProvider>
    )
    expect(heading()).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(WISHLIST_TEXT.loading)
  })

  it('P2 clears the loading status once the cards show', async () => {
    await showCards(['p1'])
    expect(heading()).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('')
  })

  it('P3 retries after an error and focuses the heading when it succeeds', async () => {
    serveWishlist(['p1'])
    vi.mocked(wishlistService.getWishlist).mockRejectedValueOnce(SERVER_ERROR)
    renderPage()
    const retry = await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry })
    expect(heading()).toBeInTheDocument()
    await userEvent.click(retry)
    await screen.findByRole('button', { name: REMOVE_TEE })
    await waitFor(() => expect(heading()).toHaveFocus())
  })

  it('P3 keeps focus on Try again when the retry fails', async () => {
    vi.mocked(wishlistService.getWishlist).mockRejectedValue(SERVER_ERROR)
    renderPage()
    const retry = await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry })
    await userEvent.click(retry)
    await waitFor(() => expect(wishlistService.getWishlist).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(retry).not.toHaveAttribute('aria-busy'))
    expect(screen.getByRole('button', { name: UI_STATE_MESSAGES.retry })).toHaveFocus()
  })

  it('P4 shows No saved items with Start Shopping to Home', async () => {
    serveWishlist([])
    renderPage()
    expect(await screen.findByText(UI_STATE_MESSAGES.emptyWishlist)).toBeInTheDocument()
    expect(heading()).toBeInTheDocument()
    expect(screen.getByRole('link', { name: WISHLIST_TEXT.startShopping })).toHaveAttribute(
      'href',
      ROUTES.HOME
    )
  })

  it('P5 shows one card per saved product, newest first, under a hidden h2', async () => {
    await showCards(['p2', 'p1'])
    expect(cardTitles()).toEqual(['Polo Two', 'Tee One'])
    expect(screen.getByRole('heading', { level: 2, name: WISHLIST_TEXT.gridHeading })).toHaveClass(
      'sr-only'
    )
  })
})

describe('Wishlist page — remove', () => {
  it('P6 Remove deletes the card, shows the toast and focuses the heading', async () => {
    await showCards(['p1', 'p2'])
    await userEvent.click(screen.getByRole('button', { name: REMOVE_TEE }))
    await waitFor(() => expect(cardTitles()).toEqual(['Polo Two']))
    expect(wishlistService.remove).toHaveBeenCalledWith('u1', 'p1')
    await waitFor(() => expect(toastMessages()).toContain(TOAST_MESSAGES.wishlist.removed))
    expect(heading()).toHaveFocus()
  })

  it('P6 brings the card back with an error toast when removing fails', async () => {
    await showCards(['p1', 'p2'])
    vi.mocked(wishlistService.remove).mockRejectedValue(SERVER_ERROR)
    await userEvent.click(screen.getByRole('button', { name: REMOVE_TEE }))
    await waitFor(() => expect(toastMessages()).toContain(TOAST_MESSAGES.wishlist.updateFailed))
    await waitFor(() => expect(cardTitles()).toEqual(['Tee One', 'Polo Two']))
  })

  it('P7 removing with the card heart focuses the heading', async () => {
    await showCards(['p1', 'p2'])
    await userEvent.click(
      screen.getByRole('button', { name: PRODUCT_CARD_TEXT.saveToWishlist('Tee One') })
    )
    await waitFor(() => expect(cardTitles()).toEqual(['Polo Two']))
    expect(heading()).toHaveFocus()
  })

  it('P7 leaves focus alone when it is on another element', async () => {
    const { queryClient } = await showCards(['p1', 'p2'])
    const polo = screen.getByRole('link', { name: /^Add to Cart ?: Polo Two$/ })
    polo.focus()
    act(() => queryClient.setQueryData(queryKeys.wishlist('u1'), ['p2']))
    await waitFor(() => expect(cardTitles()).toEqual(['Polo Two']))
    expect(polo).toHaveFocus()
  })
})

describe('Wishlist page — Add to Cart and names', () => {
  it('P8 Add to Cart opens the product page without a cart request', async () => {
    await showCards(['p1'])
    const link = screen.getByRole('link', { name: ADD_TEE })
    expect(link).toHaveAttribute('href', ROUTES.PRODUCT('p1'))
    await userEvent.click(link)
    expect(await screen.findByText(PRODUCT_PAGE_TEXT)).toBeInTheDocument()
    expect(wishlistService.remove).not.toHaveBeenCalled()
  })

  it('P9 names Add to Cart with the visible text first', async () => {
    await showCards(['p1'])
    const link = screen.getByRole('link', { name: ADD_TEE })
    expect(link).toHaveTextContent(/^Add to Cart/)
  })

  it('P9 names Remove with the visible text first', async () => {
    await showCards(['p1'])
    const button = screen.getByRole('button', { name: REMOVE_TEE })
    expect(button).toHaveTextContent(/^Remove/)
  })
})
