import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PAGINATION_TEXT } from '@/constants/pagination'
import { queryKeys } from '@/constants/queryKeys'
import { ROUTES } from '@/constants/routes'
import { SEARCH_ICON_SRC, SEARCH_RESULTS_TEXT } from '@/constants/search'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ApiError } from '@/services/apiClient'
import * as searchService from '@/services/searchService'
import { useAuthStore } from '@/stores/authStore'
import { product } from '@/test/fixtures'
import Search from './index'
import type { PaginatedList, Product } from '@/types'

vi.mock('@/services/searchService', async (importOriginal) => {
  const actual = await importOriginal<typeof searchService>()
  return { ...actual, searchProducts: vi.fn() }
})

const SERVER_ERROR = new ApiError(500, 'Server error')
const HOME_TEXT = 'Home page'

function named(id: string, name: string): Product {
  return { ...product(id), name }
}

const TEE = named('p1', 'Tee One')
const POLO = named('p2', 'Polo Two')
const SHIRT = named('p9', 'Shirt Nine')

function listOf(
  products: Product[],
  { page = 1, totalPages = 1, total = products.length } = {}
): PaginatedList<Product> {
  return { data: products, total, page, perPage: 8, totalPages }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function serve(...lists: PaginatedList<Product>[]): void {
  const mock = vi.mocked(searchService.searchProducts)
  for (const list of lists) mock.mockResolvedValueOnce(list)
}

function renderPage(path: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter(
    [
      { path: ROUTES.SEARCH, element: <Search /> },
      { path: ROUTES.HOME, element: <p>{HOME_TEXT}</p> },
    ],
    { initialEntries: [path] }
  )
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return { router, queryClient }
}

function heading(query: string): HTMLElement {
  return screen.getByRole('heading', { level: 1, name: SEARCH_RESULTS_TEXT.heading(query) })
}

function cardNames(): string[] {
  return screen.getAllByRole('heading', { level: 3 }).map((title) => title.textContent ?? '')
}

function gridOf(name: string): HTMLElement | null {
  return screen.getByRole('heading', { level: 3, name }).closest('ul')
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('Search results — query', () => {
  it('S1 stays on the page for a non-blank query', async () => {
    serve(listOf([TEE]))
    const { router } = renderPage('/search?q=shirt')
    await screen.findByRole('heading', { level: 3, name: TEE.name })
    expect(router.state.location.pathname).toBe(ROUTES.SEARCH)
  })

  it.each(['/search', '/search?q=', '/search?q=%20%20'])(
    'S1 redirects %s to Home with replace and no request',
    async (path) => {
      const { router } = renderPage(path)
      expect(await screen.findByText(HOME_TEXT)).toBeInTheDocument()
      expect(router.state.location.pathname).toBe(ROUTES.HOME)
      expect(router.state.historyAction).toBe('REPLACE')
      expect(searchService.searchProducts).not.toHaveBeenCalled()
    }
  )

  it('S2 shows and requests the trimmed query', async () => {
    serve(listOf([TEE]))
    renderPage('/search?q=%20shirt%20')
    expect(heading('shirt')).toBeInTheDocument()
    await screen.findByRole('heading', { level: 3, name: TEE.name })
    expect(searchService.searchProducts).toHaveBeenCalledWith('shirt', 1)
  })

  it('S15 shows markup in the query as plain text', async () => {
    serve(listOf([TEE]))
    renderPage(`/search?q=${encodeURIComponent('<b>x</b>')}`)
    const title = heading('<b>x</b>')
    expect(title.querySelector('b')).toBeNull()
    await screen.findByRole('heading', { level: 3, name: TEE.name })
  })
})

describe('Search results — content', () => {
  it.each<[number, string]>([
    [24, '(24 items)'],
    [1, '(1 item)'],
  ])('S3 shows the count for a total of %i', async (total, text) => {
    serve(listOf([TEE], { total }))
    renderPage('/search?q=shirt')
    expect(await screen.findByText(text)).toBeInTheDocument()
  })

  it('S3 shows no count when nothing matches', async () => {
    serve(listOf([]))
    renderPage('/search?q=xyz')
    await screen.findByText(UI_STATE_MESSAGES.noSearchResults('xyz'))
    expect(screen.queryByText(/^\(\d+ items?\)$/)).not.toBeInTheDocument()
  })

  it('S4 shows the products in the server order under a hidden section heading', async () => {
    serve(listOf([POLO, TEE]))
    renderPage('/search?q=o')
    await screen.findByRole('heading', { level: 3, name: POLO.name })
    expect(cardNames()).toEqual([POLO.name, TEE.name])
    expect(
      screen.getByRole('heading', { level: 2, name: SEARCH_RESULTS_TEXT.gridHeading })
    ).toHaveClass('sr-only')
  })

  it('S5 shows a busy skeleton and the loading status while loading', () => {
    vi.mocked(searchService.searchProducts).mockReturnValue(
      new Promise<PaginatedList<Product>>(() => {})
    )
    renderPage('/search?q=shirt')
    expect(heading('shirt')).toBeInTheDocument()
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(SEARCH_RESULTS_TEXT.loading)
  })

  it('S5 clears the loading status once the results show', async () => {
    serve(listOf([TEE]))
    renderPage('/search?q=shirt')
    await screen.findByRole('heading', { level: 3, name: TEE.name })
    expect(screen.getByRole('status')).toHaveTextContent('')
    expect(document.querySelector('[aria-busy="true"]')).toBeNull()
  })

  it('S6 shows the no-results message, hint and search icon without pagination', async () => {
    serve(listOf([]))
    renderPage('/search?q=xyz')
    expect(await screen.findByText(UI_STATE_MESSAGES.noSearchResults('xyz'))).toBeInTheDocument()
    expect(screen.getByText(UI_STATE_MESSAGES.searchHint)).toBeInTheDocument()
    expect(document.querySelector(`img[src="${SEARCH_ICON_SRC}"]`)).toHaveAttribute('alt', '')
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('S6 shows no empty message when products match', async () => {
    serve(listOf([TEE]))
    renderPage('/search?q=tee')
    await screen.findByRole('heading', { level: 3, name: TEE.name })
    expect(screen.queryByText(UI_STATE_MESSAGES.searchHint)).not.toBeInTheDocument()
  })
})

describe('Search results — errors', () => {
  it('S7 shows the error, retries and shows the results with focus on the heading', async () => {
    vi.mocked(searchService.searchProducts).mockRejectedValueOnce(SERVER_ERROR)
    serve(listOf([TEE]))
    renderPage('/search?q=shirt')
    await userEvent.click(await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry }))
    await screen.findByRole('heading', { level: 3, name: TEE.name })
    await waitFor(() => expect(heading('shirt')).toHaveFocus())
  })

  it('S8 keeps the results when a background refetch fails', async () => {
    serve(listOf([TEE]))
    vi.mocked(searchService.searchProducts).mockRejectedValueOnce(SERVER_ERROR)
    const { queryClient } = renderPage('/search?q=shirt')
    await screen.findByRole('heading', { level: 3, name: TEE.name })
    await act(async () => {
      await queryClient.refetchQueries()
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(queryClient.getQueryState(queryKeys.search.results('shirt', 1))?.status).toBe('error')
    expect(screen.getByRole('heading', { level: 3, name: TEE.name })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: UI_STATE_MESSAGES.retry })).not.toBeInTheDocument()
  })

  it('S8 shows the error when there is no data', async () => {
    vi.mocked(searchService.searchProducts).mockRejectedValueOnce(SERVER_ERROR)
    renderPage('/search?q=shirt')
    expect(await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument()
  })

  it('S14 shows the error for a next page that fails and hides the pagination', async () => {
    serve(listOf([TEE], { totalPages: 2, total: 9 }))
    vi.mocked(searchService.searchProducts).mockRejectedValueOnce(SERVER_ERROR)
    renderPage('/search?q=shirt')
    await userEvent.click(await screen.findByRole('link', { name: PAGINATION_TEXT.next }))
    expect(await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})

describe('Search results — pages', () => {
  it('S9 requests the page from the URL', async () => {
    serve(listOf([SHIRT], { page: 2, totalPages: 3, total: 17 }))
    renderPage('/search?q=shirt&page=2')
    await screen.findByRole('heading', { level: 3, name: SHIRT.name })
    expect(searchService.searchProducts).toHaveBeenCalledWith('shirt', 2)
    expect(screen.getByText(PAGINATION_TEXT.pageOf(2, 3))).toBeInTheDocument()
  })

  it('S9 requests page 1 for an invalid page parameter', async () => {
    serve(listOf([TEE]))
    renderPage('/search?q=shirt&page=x')
    await screen.findByRole('heading', { level: 3, name: TEE.name })
    expect(searchService.searchProducts).toHaveBeenCalledWith('shirt', 1)
  })

  it('S10 keeps the previous results busy and dimmed while the next page loads', async () => {
    const nextPage = deferred<PaginatedList<Product>>()
    serve(listOf([TEE], { totalPages: 2, total: 9 }))
    vi.mocked(searchService.searchProducts).mockReturnValueOnce(nextPage.promise)
    renderPage('/search?q=shirt')
    await userEvent.click(await screen.findByRole('link', { name: PAGINATION_TEXT.next }))
    const grid = gridOf(TEE.name)
    expect(grid).toHaveClass('opacity-50')
    expect(grid?.parentElement).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toHaveTextContent('')
    nextPage.resolve(listOf([SHIRT], { page: 2, totalPages: 2, total: 9 }))
    await screen.findByRole('heading', { level: 3, name: SHIRT.name })
    const shownGrid = gridOf(SHIRT.name)
    expect(shownGrid).not.toHaveClass('opacity-50')
    expect(shownGrid?.parentElement).not.toHaveAttribute('aria-busy')
  })

  it('S11 replaces only the page parameter with the page the server returned', async () => {
    serve(listOf([SHIRT], { page: 3, totalPages: 3, total: 17 }))
    const { router } = renderPage('/search?q=a&page=9')
    await waitFor(() => expect(router.state.location.search).toBe('?q=a&page=3'))
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('S11 removes the page parameter when the server returns page 1', async () => {
    serve(listOf([]))
    const { router } = renderPage('/search?q=a&page=4&ref=x')
    await waitFor(() => expect(router.state.location.search).toBe('?q=a&ref=x'))
    expect(router.state.historyAction).toBe('REPLACE')
  })

  it('S12 focuses the heading after the next page of the same query shows', async () => {
    serve(
      listOf([TEE], { totalPages: 2, total: 9 }),
      listOf([SHIRT], { page: 2, totalPages: 2, total: 9 })
    )
    renderPage('/search?q=shirt')
    await userEvent.click(await screen.findByRole('link', { name: PAGINATION_TEXT.next }))
    await screen.findByRole('heading', { level: 3, name: SHIRT.name })
    await waitFor(() => expect(heading('shirt')).toHaveFocus())
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0 })
  })

  it('S12 leaves focus alone on the first load', async () => {
    serve(listOf([TEE], { totalPages: 2, total: 9 }))
    renderPage('/search?q=shirt')
    await screen.findByRole('heading', { level: 3, name: TEE.name })
    expect(heading('shirt')).not.toHaveFocus()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('S12 leaves focus alone when a new query shows', async () => {
    serve(listOf([SHIRT], { page: 2, totalPages: 2, total: 9 }), listOf([POLO]))
    const { router } = renderPage('/search?q=shirt&page=2')
    await screen.findByRole('heading', { level: 3, name: SHIRT.name })
    await act(() => router.navigate(ROUTES.SEARCH_RESULTS('polo')))
    await screen.findByRole('heading', { level: 3, name: POLO.name })
    expect(heading('polo')).not.toHaveFocus()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('S13 links the pages with the query kept', async () => {
    serve(
      listOf([TEE], { totalPages: 2, total: 9 }),
      listOf([SHIRT], { page: 2, totalPages: 2, total: 9 })
    )
    renderPage('/search?q=shirt')
    const next = await screen.findByRole('link', { name: PAGINATION_TEXT.next })
    expect(next).toHaveAttribute('href', '/search?q=shirt&page=2')
    await userEvent.click(next)
    await screen.findByRole('heading', { level: 3, name: SHIRT.name })
    const nav = within(screen.getByRole('navigation', { name: PAGINATION_TEXT.navLabel }))
    expect(nav.getByRole('link', { name: PAGINATION_TEXT.previous })).toHaveAttribute(
      'href',
      '/search?q=shirt'
    )
  })
})
