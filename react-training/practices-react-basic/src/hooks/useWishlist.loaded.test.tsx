import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { ApiError } from '@/services/apiClient'
import * as wishlistService from '@/services/wishlistService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useWishlist } from './useWishlist'
import type { ReactNode } from 'react'
import type { User } from '@/types'

vi.mock('@/services/wishlistService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const wishlistKey = queryKeys.wishlist('u1')

function renderWishlist() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
  return { queryClient, ...renderHook(() => useWishlist(), { wrapper }) }
}

async function renderLoaded() {
  vi.mocked(wishlistService.getWishlist).mockResolvedValueOnce(['p1'])
  const view = renderWishlist()
  await waitFor(() => expect(view.result.current.productIds).toEqual(['p1']))
  return view
}

function refetch(queryClient: QueryClient): Promise<void> {
  return act(() => queryClient.refetchQueries({ queryKey: wishlistKey }))
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('useWishlist isLoaded — first load', () => {
  it('reports loaded once the saved list arrives', async () => {
    const { result } = await renderLoaded()
    expect(result.current.isLoaded).toBe(true)
  })

  it('reports not loaded while the first load runs', () => {
    vi.mocked(wishlistService.getWishlist).mockReturnValue(new Promise(() => undefined))
    const { result } = renderWishlist()
    expect(result.current.isLoaded).toBe(false)
  })
})

describe('useWishlist isLoaded — failures', () => {
  it('stays loaded when a background refetch fails', async () => {
    const { queryClient, result } = await renderLoaded()
    vi.mocked(wishlistService.getWishlist).mockRejectedValueOnce(new ApiError(500, 'Server error'))
    await refetch(queryClient)
    expect(queryClient.getQueryState(wishlistKey)?.status).toBe('error')
    expect(result.current.isLoaded).toBe(true)
    expect(result.current.productIds).toEqual(['p1'])
  })

  it('reports not loaded and ignores toggle after the initial load fails', async () => {
    vi.mocked(wishlistService.getWishlist).mockRejectedValueOnce(new ApiError(500, 'Server error'))
    const { queryClient, result } = renderWishlist()
    await waitFor(() => expect(queryClient.getQueryState(wishlistKey)?.status).toBe('error'))
    expect(result.current.isLoaded).toBe(false)
    act(() => result.current.toggle('p1'))
    expect(wishlistService.add).not.toHaveBeenCalled()
    expect(wishlistService.remove).not.toHaveBeenCalled()
    expect(useToastStore.getState().toasts).toEqual([])
  })
})

describe('useWishlist isLoaded — follows data presence', () => {
  it('stays loaded during a background refetch', async () => {
    const { queryClient, result } = await renderLoaded()
    vi.mocked(wishlistService.getWishlist).mockReturnValueOnce(new Promise(() => undefined))
    act(() => {
      void queryClient.refetchQueries({ queryKey: wishlistKey })
    })
    await waitFor(() =>
      expect(queryClient.getQueryState(wishlistKey)?.fetchStatus).toBe('fetching')
    )
    expect(result.current.isLoaded).toBe(true)
  })

  it('reports loaded for a guest who has no saved list', () => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
    const { result } = renderWishlist()
    expect(result.current.productIds).toEqual([])
    expect(result.current.isLoaded).toBe(true)
  })
})
