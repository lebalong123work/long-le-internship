import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BEST_SELLER_TEXT } from '@/constants/bestSeller'
import { queryKeys } from '@/constants/queryKeys'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useWishlist } from '@/hooks/useWishlist'
import * as productService from '@/services/productService'
import { product } from '@/test/fixtures'
import { BestSellerSection } from './BestSellerSection'
import type { Product } from '@/types'

vi.mock('@/services/productService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/productService')>()),
  getBestSellers: vi.fn(),
}))
vi.mock('@/hooks/useWishlist')

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined
  let reject: (error: unknown) => void = () => undefined
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, resolve, reject }
}

const requests = new Map<string, Deferred<Product[]>[]>()

function requestsFor(category: string): Deferred<Product[]>[] {
  return requests.get(category) ?? []
}

function lastRequest(category: string): Deferred<Product[]> {
  const list = requestsFor(category)
  const request = list[list.length - 1]
  if (!request) throw new Error(`no request for ${category}`)
  return request
}

const SETTLE_TASKS = 3

async function settleQueries(): Promise<void> {
  for (let task = 0; task < SETTLE_TASKS; task += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

async function answer(category: string, products: Product[]): Promise<void> {
  await act(async () => {
    lastRequest(category).resolve(products)
    await settleQueries()
  })
}

async function fail(category: string): Promise<void> {
  await act(async () => {
    lastRequest(category).reject(new Error('Server error'))
    await settleQueries()
  })
}

const T_SHIRTS = [
  { ...product('p1'), name: 'Tee One' },
  { ...product('p2'), name: 'Tee Two' },
]
const JACKETS = [{ ...product('j1'), name: 'Jacket One', category: 'jacket' }]

function renderSection() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const user = userEvent.setup()
  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <BestSellerSection />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { ...view, queryClient, user }
}

function panel(): HTMLElement {
  return screen.getByRole('tabpanel')
}

function tab(name: string): HTMLElement {
  return screen.getByRole('tab', { name })
}

function tryAgain(): HTMLElement {
  return within(panel()).getByRole('button', { name: UI_STATE_MESSAGES.retry })
}

function seeMore(): HTMLElement {
  return screen.getByRole('link', { name: BEST_SELLER_TEXT.seeMore })
}

function busyResults(): Element | null {
  return panel().querySelector('[aria-busy="true"]:not(button)')
}

function cardNames(): string[] {
  return within(panel())
    .queryAllByRole('article')
    .map((card) => within(card).getByRole('heading').textContent ?? '')
}

function loadingText(): string {
  return screen.getByRole('status').textContent ?? ''
}

function requestCount(category: string): number {
  return requestsFor(category).length
}

async function failFirstLoad(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await fail('t-shirt')
  await user.click(tryAgain())
}

beforeEach(() => {
  requests.clear()
  vi.mocked(productService.getBestSellers).mockImplementation((category: string) => {
    const request = deferred<Product[]>()
    requests.set(category, [...requestsFor(category), request])
    return request.promise
  })
  vi.mocked(useWishlist).mockReturnValue({
    productIds: [],
    isInWishlist: () => false,
    toggle: vi.fn(),
    isLoaded: true,
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

describe('BestSellerSection headings and tabs', () => {
  it('renders the eyebrow and the Our Best Seller heading as h2', () => {
    renderSection()
    expect(screen.getByText(BEST_SELLER_TEXT.eyebrow)).toHaveClass('uppercase')
    expect(
      screen.getByRole('heading', { level: 2, name: BEST_SELLER_TEXT.title })
    ).toBeInTheDocument()
  })

  it('names the section by its heading', () => {
    renderSection()
    expect(screen.getByRole('region', { name: BEST_SELLER_TEXT.title })).toBeInTheDocument()
  })

  it('centres only the eyebrow and the heading, never the product cards', async () => {
    renderSection()
    await answer('t-shirt', T_SHIRTS)
    const section = screen.getByRole('region', { name: BEST_SELLER_TEXT.title })
    expect(section).not.toHaveClass('text-center')
    expect(screen.getByText(BEST_SELLER_TEXT.eyebrow)).toHaveClass('text-center')
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('text-center')
  })

  it('does not render a page h1', () => {
    renderSection()
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('shows the four category tabs with T-Shirt selected', () => {
    renderSection()
    const tabs = within(
      screen.getByRole('tablist', { name: BEST_SELLER_TEXT.tabsLabel })
    ).getAllByRole('tab')
    expect(tabs.map((element) => element.textContent)).toEqual([
      'T-Shirt',
      'Jacket',
      'Shirt',
      'Jeans',
    ])
    expect(tab('T-Shirt')).toHaveAttribute('aria-selected', 'true')
  })

  it('loads only the selected category at first', () => {
    renderSection()
    expect(productService.getBestSellers).toHaveBeenCalledTimes(1)
    expect(productService.getBestSellers).toHaveBeenCalledWith('t-shirt')
  })

  it('selecting Jacket loads and shows the jacket best sellers', async () => {
    const { user } = renderSection()
    await answer('t-shirt', T_SHIRTS)
    await user.click(tab('Jacket'))
    expect(productService.getBestSellers).toHaveBeenLastCalledWith('jacket')
    await answer('jacket', JACKETS)
    expect(cardNames()).toEqual(['Jacket One'])
    expect(panel()).toHaveAccessibleName('Jacket')
  })

  it('selecting the active tab does not load again', async () => {
    const { user } = renderSection()
    await answer('t-shirt', T_SHIRTS)
    await user.click(tab('T-Shirt'))
    expect(productService.getBestSellers).toHaveBeenCalledTimes(1)
  })
})

describe('BestSellerSection states', () => {
  it('shows 8 skeleton cards and marks the results busy while loading', () => {
    renderSection()
    const busy = busyResults()
    expect(busy).not.toBeNull()
    expect(busy?.firstElementChild?.children).toHaveLength(8)
  })

  it('removes the skeletons and the busy state once loaded', async () => {
    renderSection()
    await answer('t-shirt', T_SHIRTS)
    expect(busyResults()).toBeNull()
  })

  it('renders one product card per product inside the tab panel', async () => {
    renderSection()
    await answer('t-shirt', T_SHIRTS)
    expect(cardNames()).toEqual(['Tee One', 'Tee Two'])
    expect(within(panel()).getAllByRole('listitem')).toHaveLength(2)
  })

  it('shows no cards for a category without products', async () => {
    renderSection()
    await answer('t-shirt', [])
    expect(cardNames()).toEqual([])
    expect(within(panel()).queryByRole('list')).not.toBeInTheDocument()
  })

  it('shows the error state when loading fails', async () => {
    renderSection()
    await fail('t-shirt')
    expect(within(panel()).getByRole('alert')).toHaveTextContent(UI_STATE_MESSAGES.errorDefault)
    expect(tryAgain()).toBeInTheDocument()
  })

  it('Try again loads the category again', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    expect(requestCount('t-shirt')).toBe(2)
    await answer('t-shirt', T_SHIRTS)
    expect(cardNames()).toEqual(['Tee One', 'Tee Two'])
  })

  it('keeps the error state and focus on Try again while retrying', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
    expect(tryAgain()).toHaveFocus()
    expect(busyResults()).toBeNull()
  })

  it('keeps the error state while retrying even when the query reports pending', async () => {
    const { user, queryClient } = renderSection()
    await failFirstLoad(user)
    await act(async () => {
      void queryClient.resetQueries({ queryKey: queryKeys.products.bestSellers('t-shirt') })
    })
    expect(queryClient.getQueryState(queryKeys.products.bestSellers('t-shirt'))?.status).toBe(
      'pending'
    )
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
    expect(busyResults()).toBeNull()
  })

  it('a second Try again click while retrying does not request again', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await user.click(tryAgain())
    await user.keyboard('{Enter}')
    expect(requestCount('t-shirt')).toBe(2)
  })

  it('switching tabs during a retry does not carry the retry to the new tab', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await user.click(tab('Jacket'))
    await fail('jacket')
    expect(tryAgain()).not.toHaveAttribute('aria-busy')
  })

  it('shows the empty message with the cart icon for a category without products', async () => {
    renderSection()
    await answer('t-shirt', [])
    expect(within(panel()).getByText(UI_STATE_MESSAGES.emptyCategory)).toBeInTheDocument()
    expect(panel().querySelector('img[src="/icons/cart.svg"]')).not.toBeNull()
  })

  it('shows no empty state when the category has products', async () => {
    renderSection()
    await answer('t-shirt', T_SHIRTS)
    expect(within(panel()).queryByText(UI_STATE_MESSAGES.emptyCategory)).not.toBeInTheDocument()
  })
})

describe('BestSellerSection See More', () => {
  it('See More links to the shop page of the active category', () => {
    renderSection()
    expect(seeMore()).toHaveAttribute('href', '/shop?category=t-shirt')
  })

  it('See More follows the selected tab', async () => {
    const { user } = renderSection()
    await user.click(tab('Jeans'))
    expect(seeMore()).toHaveAttribute('href', '/shop?category=jeans')
  })

  it('See More stays visible in the empty state', async () => {
    renderSection()
    await answer('t-shirt', [])
    expect(seeMore()).toBeVisible()
  })

  it('See More stays visible in the error state', async () => {
    renderSection()
    await fail('t-shirt')
    expect(seeMore()).toBeVisible()
  })
})

describe('BestSellerSection requests', () => {
  it('the current tab shows its own answer when answers arrive in order', async () => {
    const { user } = renderSection()
    await user.click(tab('Jacket'))
    await answer('t-shirt', T_SHIRTS)
    await answer('jacket', JACKETS)
    expect(cardNames()).toEqual(['Jacket One'])
  })

  it('a late answer for the previous tab never replaces the current tab', async () => {
    const { user } = renderSection()
    await user.click(tab('Jacket'))
    await answer('jacket', JACKETS)
    await answer('t-shirt', T_SHIRTS)
    expect(cardNames()).toEqual(['Jacket One'])
  })

  it('switching back to a loaded tab shows its cards without a skeleton', async () => {
    const { user } = renderSection()
    await answer('t-shirt', T_SHIRTS)
    await user.click(tab('Jacket'))
    await answer('jacket', JACKETS)
    await user.click(tab('T-Shirt'))
    expect(cardNames()).toEqual(['Tee One', 'Tee Two'])
    expect(busyResults()).toBeNull()
  })

  it('a tab never loaded before shows the skeleton', async () => {
    const { user } = renderSection()
    await answer('t-shirt', T_SHIRTS)
    await user.click(tab('Shirt'))
    expect(busyResults()).not.toBeNull()
  })

  it('unmounting while loading logs no error', async () => {
    const consoleError = vi.spyOn(console, 'error')
    const { unmount } = renderSection()
    unmount()
    await act(async () => {
      lastRequest('t-shirt').resolve(T_SHIRTS)
      await settleQueries()
    })
    expect(consoleError).not.toHaveBeenCalled()
  })
})

describe('BestSellerSection focus', () => {
  it('after a successful Try again focus moves to the tab panel', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await answer('t-shirt', T_SHIRTS)
    await waitFor(() => expect(panel()).toHaveFocus())
  })

  it('after a Try again that returns no products focus moves to the tab panel', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await answer('t-shirt', [])
    await waitFor(() => expect(panel()).toHaveFocus())
    expect(within(panel()).getByText(UI_STATE_MESSAGES.emptyCategory)).toBeInTheDocument()
  })

  it('after a failed Try again focus stays on Try again', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await fail('t-shirt')
    expect(tryAgain()).toHaveFocus()
    expect(tryAgain()).not.toHaveAttribute('aria-busy')
  })

  it('selecting a tab keeps focus on the tab', async () => {
    const { user } = renderSection()
    await user.click(tab('Jacket'))
    await answer('jacket', JACKETS)
    expect(tab('Jacket')).toHaveFocus()
  })

  it('a Try again that finishes after a tab change does not move focus', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await user.click(tab('Jacket'))
    await answer('t-shirt', T_SHIRTS)
    expect(tab('Jacket')).toHaveFocus()
  })

  it('Enter on a focused category tab loads that category', async () => {
    const { user } = renderSection()
    tab('T-Shirt').focus()
    await user.keyboard('{ArrowRight}{Enter}')
    expect(tab('Jacket')).toHaveAttribute('aria-selected', 'true')
    expect(productService.getBestSellers).toHaveBeenLastCalledWith('jacket')
  })

  it('Space on a focused category tab loads that category', async () => {
    const { user } = renderSection()
    tab('T-Shirt').focus()
    await user.keyboard('{End} ')
    expect(tab('Jeans')).toHaveAttribute('aria-selected', 'true')
    expect(productService.getBestSellers).toHaveBeenLastCalledWith('jeans')
  })

  it('arrow keys alone do not load another category', async () => {
    const { user } = renderSection()
    tab('T-Shirt').focus()
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowLeft}')
    expect(productService.getBestSellers).toHaveBeenCalledTimes(1)
    expect(tab('T-Shirt')).toHaveAttribute('aria-selected', 'true')
  })

  it('the tab panel is the next Tab stop after the selected tab', async () => {
    const { user } = renderSection()
    tab('T-Shirt').focus()
    await user.tab()
    expect(panel()).toHaveFocus()
  })

  it('after a successful Try again the panel is focused with focusVisible and the script ring mark', async () => {
    const { user } = renderSection()
    const focus = vi.spyOn(panel(), 'focus')
    await failFirstLoad(user)
    await answer('t-shirt', T_SHIRTS)
    await waitFor(() => expect(focus).toHaveBeenCalledWith({ focusVisible: true }))
    expect(panel()).toHaveAttribute('data-script-focus', 'true')
  })

  it('Tab from the selected tab skips the other category tabs', async () => {
    const { user } = renderSection()
    tab('T-Shirt').focus()
    await user.tab()
    expect(tab('Jacket')).not.toHaveFocus()
    await user.tab({ shift: true })
    expect(tab('T-Shirt')).toHaveFocus()
  })
})

describe('BestSellerSection loading text and background refetch', () => {
  it('announces Loading products while the first load runs', () => {
    renderSection()
    expect(loadingText()).toBe(BEST_SELLER_TEXT.loading)
  })

  it('clears the loading text once loaded', async () => {
    renderSection()
    await answer('t-shirt', T_SHIRTS)
    expect(loadingText()).toBe('')
  })

  it('does not announce loading during a background refetch', async () => {
    const { queryClient } = renderSection()
    await answer('t-shirt', T_SHIRTS)
    await act(async () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.products.bestSellers('t-shirt') })
    })
    expect(requestCount('t-shirt')).toBe(2)
    expect(loadingText()).toBe('')
  })

  it('a background refetch keeps the cards without skeleton or busy state', async () => {
    const { queryClient } = renderSection()
    await answer('t-shirt', T_SHIRTS)
    await act(async () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.products.bestSellers('t-shirt') })
    })
    expect(cardNames()).toEqual(['Tee One', 'Tee Two'])
    expect(busyResults()).toBeNull()
  })

  it('a failed background refetch keeps the cards and shows no error state', async () => {
    const { queryClient } = renderSection()
    await answer('t-shirt', T_SHIRTS)
    await act(async () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.products.bestSellers('t-shirt') })
    })
    await fail('t-shirt')
    expect(queryClient.getQueryState(queryKeys.products.bestSellers('t-shirt'))?.status).toBe(
      'error'
    )
    expect(cardNames()).toEqual(['Tee One', 'Tee Two'])
    expect(within(panel()).queryByRole('alert')).not.toBeInTheDocument()
  })

  it('a failed background refetch of an empty category keeps the empty state', async () => {
    const { queryClient } = renderSection()
    await answer('t-shirt', [])
    await act(async () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.products.bestSellers('t-shirt') })
    })
    await fail('t-shirt')
    expect(within(panel()).getByText(UI_STATE_MESSAGES.emptyCategory)).toBeInTheDocument()
    expect(within(panel()).queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('BestSellerSection retries in several categories', () => {
  it('retries in two categories run separately with their own busy state', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await user.click(tab('Jacket'))
    await fail('jacket')
    expect(tryAgain()).not.toHaveAttribute('aria-busy')
    await user.click(tryAgain())
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
    await user.click(tab('T-Shirt'))
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
    expect(requestCount('t-shirt')).toBe(2)
    expect(requestCount('jacket')).toBe(2)
  })

  it("finishing one category's retry does not end the other category's retry", async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await user.click(tab('Jacket'))
    await fail('jacket')
    await user.click(tryAgain())
    await user.click(tab('T-Shirt'))
    await fail('jacket')
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
  })

  it('a Try again with focus lost to the page moves focus to the tab panel', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    act(() => {
      tryAgain().blur()
    })
    expect(document.body).toHaveFocus()
    await answer('t-shirt', T_SHIRTS)
    await waitFor(() => expect(panel()).toHaveFocus())
  })

  it('a Try again that finishes after switching away and back does not move focus', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await user.click(tab('Jacket'))
    await user.click(tab('T-Shirt'))
    await answer('t-shirt', T_SHIRTS)
    expect(tab('T-Shirt')).toHaveFocus()
    expect(panel()).not.toHaveFocus()
  })

  it('a Try again that finishes after switching away and back with focus lost does not move focus', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    await user.click(tab('Jacket'))
    await user.click(tab('T-Shirt'))
    act(() => {
      tab('T-Shirt').blur()
    })
    await answer('t-shirt', T_SHIRTS)
    expect(panel()).not.toHaveFocus()
    expect(document.body).toHaveFocus()
  })

  it('a Try again that finishes after focus moved elsewhere does not move focus', async () => {
    const { user } = renderSection()
    await failFirstLoad(user)
    act(() => {
      seeMore().focus()
    })
    await answer('t-shirt', T_SHIRTS)
    expect(seeMore()).toHaveFocus()
  })
})
