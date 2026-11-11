import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { ApiError } from '@/services/apiClient'
import * as searchService from '@/services/searchService'
import { useToastStore } from '@/stores/toastStore'
import { product } from '@/test/fixtures'
import { SEARCH_DEBOUNCE_MS, useSearchResults, useSearchSuggestions } from './useSearch'
import type { ReactNode } from 'react'
import type { PaginatedList, Product, Suggestion } from '@/types'

vi.mock('@/services/searchService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/searchService')>()),
  searchProducts: vi.fn(),
  searchSuggestions: vi.fn(),
}))

function resultsPage(data: Product[], page: number): PaginatedList<Product> {
  return { data, total: 16, page, perPage: 8, totalPages: 2 }
}

const suggestions: Suggestion[] = [
  { type: 'category', category: { id: 'c1', name: 'T-Shirt', slug: 't-shirt' } },
  { type: 'product', product: product('p1') },
]

function setup() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, wrapper }
}

function waitForDebounce(ms = SEARCH_DEBOUNCE_MS): void {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function toastCount(): number {
  return useToastStore.getState().toasts.length
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.useRealTimers()
  vi.resetAllMocks()
})

describe('useSearchSuggestions', () => {
  function renderSuggestions(initialQuery: string) {
    const { queryClient, wrapper } = setup()
    const hook = renderHook(({ query }) => useSearchSuggestions(query), {
      wrapper,
      initialProps: { query: initialQuery },
    })
    return { queryClient, ...hook }
  }

  it('fetches once with the last value 300 ms after typing stops', async () => {
    vi.mocked(searchService.searchSuggestions).mockResolvedValue(suggestions)
    const { result, rerender } = renderSuggestions('')
    rerender({ query: 'sh' })
    rerender({ query: 'shi' })
    waitForDebounce()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchService.searchSuggestions).toHaveBeenCalledTimes(1)
    expect(searchService.searchSuggestions).toHaveBeenCalledWith('shi')
    expect(result.current.data).toEqual(suggestions)
  })

  it('does not fetch while the query keeps changing within 300 ms', () => {
    const { result, rerender } = renderSuggestions('')
    rerender({ query: 's' })
    waitForDebounce(SEARCH_DEBOUNCE_MS - 100)
    rerender({ query: 'sh' })
    waitForDebounce(SEARCH_DEBOUNCE_MS - 100)
    rerender({ query: 'shi' })
    waitForDebounce(SEARCH_DEBOUNCE_MS - 100)
    expect(searchService.searchSuggestions).not.toHaveBeenCalled()
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('caches suggestions under the trimmed query key', async () => {
    vi.mocked(searchService.searchSuggestions).mockResolvedValue(suggestions)
    const { queryClient, result } = renderSuggestions('  shirt  ')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchService.searchSuggestions).toHaveBeenCalledWith('shirt')
    expect(queryClient.getQueryData(queryKeys.search.suggestions('shirt'))).toEqual(suggestions)
  })

  it('does not refetch when only surrounding spaces change', async () => {
    vi.mocked(searchService.searchSuggestions).mockResolvedValue(suggestions)
    const { result, rerender } = renderSuggestions('shirt')
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    rerender({ query: ' shirt ' })
    waitForDebounce()
    expect(result.current.data).toEqual(suggestions)
    expect(searchService.searchSuggestions).toHaveBeenCalledTimes(1)
  })

  it('starts fetching once a blank query gets text', async () => {
    vi.mocked(searchService.searchSuggestions).mockResolvedValue(suggestions)
    const { result, rerender } = renderSuggestions('')
    rerender({ query: 'shirt' })
    waitForDebounce()
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchService.searchSuggestions).toHaveBeenCalledWith('shirt')
  })

  it('does not fetch or cache a whitespace-only query', () => {
    const { queryClient, result } = renderSuggestions('   ')
    waitForDebounce()
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(searchService.searchSuggestions).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(queryKeys.search.suggestions(''))).toBeUndefined()
  })

  it('returns the service error as the query error', async () => {
    const error = new ApiError(500, 'Server error')
    vi.mocked(searchService.searchSuggestions).mockRejectedValue(error)
    const { result } = renderSuggestions('shirt')
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(error)
  })

  it('does not show a toast when suggestions fail', async () => {
    vi.mocked(searchService.searchSuggestions).mockRejectedValue(new ApiError(0, 'Network error'))
    const { result } = renderSuggestions('shirt')
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toastCount()).toBe(0)
  })
})

describe('useSearchResults', () => {
  function renderResults(initialQuery: string, initialPage = 1) {
    const { queryClient, wrapper } = setup()
    const hook = renderHook(({ query, page }) => useSearchResults(query, page), {
      wrapper,
      initialProps: { query: initialQuery, page: initialPage },
    })
    return { queryClient, ...hook }
  }

  it('caches results under the trimmed query and page key', async () => {
    const firstPage = resultsPage([product('p1')], 1)
    vi.mocked(searchService.searchProducts).mockResolvedValue(firstPage)
    const { queryClient, result } = renderResults(' shirt ', 1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchService.searchProducts).toHaveBeenCalledWith('shirt', 1)
    expect(queryClient.getQueryData(queryKeys.search.results('shirt', 1))).toEqual(firstPage)
  })

  it('fetches another page under its own key', async () => {
    const firstPage = resultsPage([product('p1')], 1)
    const secondPage = resultsPage([product('p9')], 2)
    vi.mocked(searchService.searchProducts)
      .mockResolvedValueOnce(firstPage)
      .mockResolvedValueOnce(secondPage)
    const { queryClient, result, rerender } = renderResults('shirt', 1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    rerender({ query: 'shirt', page: 2 })
    await waitFor(() => expect(result.current.data).toEqual(secondPage))
    expect(searchService.searchProducts).toHaveBeenLastCalledWith('shirt', 2)
    expect(queryClient.getQueryData(queryKeys.search.results('shirt', 1))).toEqual(firstPage)
    expect(queryClient.getQueryData(queryKeys.search.results('shirt', 2))).toEqual(secondPage)
  })

  it('starts fetching once the query gets text', async () => {
    vi.mocked(searchService.searchProducts).mockResolvedValue(resultsPage([product('p1')], 1))
    const { result, rerender } = renderResults('')
    rerender({ query: 'shirt', page: 1 })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(searchService.searchProducts).toHaveBeenCalledWith('shirt', 1)
  })

  it('does not fetch or cache a blank query', () => {
    const { queryClient, result } = renderResults('  ')
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
    expect(searchService.searchProducts).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(queryKeys.search.results('', 1))).toBeUndefined()
  })

  it('keeps the previous page while the next page loads', async () => {
    const firstPage = resultsPage([product('p1')], 1)
    vi.mocked(searchService.searchProducts)
      .mockResolvedValueOnce(firstPage)
      .mockReturnValueOnce(new Promise(() => {}))
    const { result, rerender } = renderResults('shirt', 1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    rerender({ query: 'shirt', page: 2 })
    await waitFor(() => expect(result.current.fetchStatus).toBe('fetching'))
    expect(result.current.data).toEqual(firstPage)
    expect(result.current.isPlaceholderData).toBe(true)
  })

  it('does not keep results from a different query', async () => {
    vi.mocked(searchService.searchProducts)
      .mockResolvedValueOnce(resultsPage([product('p1')], 1))
      .mockReturnValueOnce(new Promise(() => {}))
    const { result, rerender } = renderResults('shirt', 1)
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    rerender({ query: 'jacket', page: 1 })
    await waitFor(() => expect(result.current.fetchStatus).toBe('fetching'))
    expect(result.current.data).toBeUndefined()
    expect(result.current.isPlaceholderData).toBe(false)
  })

  it('returns the service error as the query error', async () => {
    const error = new ApiError(500, 'Server error')
    vi.mocked(searchService.searchProducts).mockRejectedValue(error)
    const { result } = renderResults('shirt')
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(error)
  })

  it('does not show a toast when results fail', async () => {
    vi.mocked(searchService.searchProducts).mockRejectedValue(new ApiError(0, 'Network error'))
    const { result } = renderResults('shirt')
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(toastCount()).toBe(0)
  })
})
