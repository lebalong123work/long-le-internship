import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as wishlistService from '@/services/wishlistService'
import { useAuthStore } from '@/stores/authStore'
import { runPendingAction, usePendingActionStore } from '@/stores/pendingActionStore'
import { useToastStore } from '@/stores/toastStore'
import { useWishlist, useWishlistPendingAction } from './useWishlist'
import type { ReactNode } from 'react'
import type { User } from '@/types'

vi.mock('@/services/wishlistService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const wishlistKey = queryKeys.wishlist('u1')

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/shop/p1']}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
  return { queryClient, wrapper }
}

function useHarness() {
  return { wishlist: useWishlist(), location: useLocation() }
}

async function renderLoaded(ids: string[]) {
  const { queryClient, wrapper } = setup()
  const view = renderHook(() => useHarness(), { wrapper })
  await waitFor(() => expect(view.result.current.wishlist.productIds).toEqual(ids))
  return { queryClient, ...view }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  let reject: (reason: unknown) => void = () => undefined
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function toasts() {
  return useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))
}

function logOut() {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
  usePendingActionStore.setState({ action: null })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('useWishlist query', () => {
  it('useWishlist caches the ids under queryKeys.wishlist(uid)', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p2', 'p1'])
    const { queryClient } = await renderLoaded(['p2', 'p1'])
    expect(wishlistService.getWishlist).toHaveBeenCalledWith('u1')
    expect(queryClient.getQueryData(wishlistKey)).toEqual(['p2', 'p1'])
  })

  it('useWishlist does not call the service for a guest', () => {
    logOut()
    const { wrapper } = setup()
    const { result } = renderHook(() => useWishlist(), { wrapper })
    expect(result.current.productIds).toEqual([])
    expect(wishlistService.getWishlist).not.toHaveBeenCalled()
  })
})

describe('isInWishlist', () => {
  it('isInWishlist is true for a saved product', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    const { result } = await renderLoaded(['p1'])
    expect(result.current.wishlist.isInWishlist('p1')).toBe(true)
  })

  it('isInWishlist is false for a product that is not saved', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    const { result } = await renderLoaded(['p1'])
    expect(result.current.wishlist.isInWishlist('p2')).toBe(false)
  })
})

describe('toggle add', () => {
  it('toggle adds an unsaved product at once and shows "Saved to wishlist"', async () => {
    const saving = deferred<void>()
    vi.mocked(wishlistService.getWishlist)
      .mockResolvedValueOnce(['p1'])
      .mockResolvedValue(['p3', 'p1'])
    vi.mocked(wishlistService.add).mockReturnValue(saving.promise)
    const { queryClient, result } = await renderLoaded(['p1'])

    act(() => result.current.wishlist.toggle('p3'))

    await waitFor(() => expect(queryClient.getQueryData(wishlistKey)).toEqual(['p3', 'p1']))
    expect(result.current.wishlist.isInWishlist('p3')).toBe(true)
    expect(wishlistService.add).toHaveBeenCalledWith('u1', 'p3')
    saving.resolve()
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.wishlist.saved }])
    )
  })

  it('toggle rolls back an add and shows the error toast when saving fails', async () => {
    const saving = deferred<void>()
    const refetch = deferred<string[]>()
    vi.mocked(wishlistService.getWishlist)
      .mockResolvedValueOnce(['p1'])
      .mockReturnValueOnce(refetch.promise)
    vi.mocked(wishlistService.add).mockReturnValue(saving.promise)
    const { queryClient, result } = await renderLoaded(['p1'])

    act(() => result.current.wishlist.toggle('p3'))
    await waitFor(() => expect(queryClient.getQueryData(wishlistKey)).toEqual(['p3', 'p1']))
    saving.reject(new ApiError(500, 'Server error'))

    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
    )
    expect(queryClient.getQueryData(wishlistKey)).toEqual(['p1'])
    refetch.resolve(['p1'])
  })
})

describe('toggle remove', () => {
  it('toggle removes a saved product at once and shows "Removed from wishlist"', async () => {
    const removing = deferred<void>()
    vi.mocked(wishlistService.getWishlist)
      .mockResolvedValueOnce(['p2', 'p1'])
      .mockResolvedValue(['p2'])
    vi.mocked(wishlistService.remove).mockReturnValue(removing.promise)
    const { queryClient, result } = await renderLoaded(['p2', 'p1'])

    act(() => result.current.wishlist.toggle('p1'))

    await waitFor(() => expect(queryClient.getQueryData(wishlistKey)).toEqual(['p2']))
    expect(wishlistService.remove).toHaveBeenCalledWith('u1', 'p1')
    expect(wishlistService.add).not.toHaveBeenCalled()
    removing.resolve()
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'info', message: TOAST_MESSAGES.wishlist.removed }])
    )
  })

  it('toggle rolls back a remove and shows the error toast when it fails', async () => {
    const removing = deferred<void>()
    const refetch = deferred<string[]>()
    vi.mocked(wishlistService.getWishlist)
      .mockResolvedValueOnce(['p2', 'p1'])
      .mockReturnValueOnce(refetch.promise)
    vi.mocked(wishlistService.remove).mockReturnValue(removing.promise)
    const { queryClient, result } = await renderLoaded(['p2', 'p1'])

    act(() => result.current.wishlist.toggle('p1'))
    await waitFor(() => expect(queryClient.getQueryData(wishlistKey)).toEqual(['p2']))
    removing.reject(new ApiError(500, 'Server error'))

    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
    )
    expect(queryClient.getQueryData(wishlistKey)).toEqual(['p2', 'p1'])
    refetch.resolve(['p2', 'p1'])
  })
})

describe('toggle error text', () => {
  it('toggle shows the network toast for a status 0 error', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    vi.mocked(wishlistService.add).mockRejectedValue(new ApiError(0, 'Network error'))
    const { result } = await renderLoaded(['p1'])

    act(() => result.current.wishlist.toggle('p3'))

    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.network.error }])
    )
  })

  it('toggle shows the update-failed toast for a non-API error', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    vi.mocked(wishlistService.add).mockRejectedValue(new Error('boom'))
    const { result } = await renderLoaded(['p1'])

    act(() => result.current.wishlist.toggle('p3'))

    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
    )
  })
})

describe('toggle as a guest', () => {
  it('toggle as a guest stores a pending toggleWishlist and opens the login modal', () => {
    logOut()
    const { wrapper } = setup()
    const { result } = renderHook(() => useHarness(), { wrapper })

    act(() => result.current.wishlist.toggle('p1'))

    expect(usePendingActionStore.getState().action).toEqual({
      type: 'toggleWishlist',
      productId: 'p1',
    })
    expect(result.current.location.pathname).toBe('/shop/p1')
    expect(new URLSearchParams(result.current.location.search).get('auth')).toBe('login')
  })

  it('toggle as a guest calls no service', () => {
    logOut()
    const { wrapper } = setup()
    const { result } = renderHook(() => useHarness(), { wrapper })

    act(() => result.current.wishlist.toggle('p1'))

    expect(wishlistService.add).not.toHaveBeenCalled()
    expect(wishlistService.remove).not.toHaveBeenCalled()
    expect(toasts()).toEqual([])
  })
})

describe('toggle refetch', () => {
  it('toggle refetches the wishlist after success', async () => {
    vi.mocked(wishlistService.getWishlist)
      .mockResolvedValueOnce(['p1'])
      .mockResolvedValue(['p3', 'p1'])
    vi.mocked(wishlistService.add).mockResolvedValue()
    const { result } = await renderLoaded(['p1'])

    act(() => result.current.wishlist.toggle('p3'))

    await waitFor(() => expect(wishlistService.getWishlist).toHaveBeenCalledTimes(2))
  })

  it('toggle refetches the wishlist after a failure', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    vi.mocked(wishlistService.add).mockRejectedValue(new ApiError(500, 'Server error'))
    const { result } = await renderLoaded(['p1'])

    act(() => result.current.wishlist.toggle('p3'))

    await waitFor(() => expect(wishlistService.getWishlist).toHaveBeenCalledTimes(2))
  })
})

describe('toggle order', () => {
  it('a second toggle waits for the first to finish', async () => {
    const first = deferred<void>()
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    vi.mocked(wishlistService.add).mockReturnValueOnce(first.promise).mockResolvedValue()
    const { result } = await renderLoaded(['p1'])

    act(() => result.current.wishlist.toggle('p3'))
    act(() => result.current.wishlist.toggle('p4'))

    await waitFor(() => expect(wishlistService.add).toHaveBeenCalledTimes(1))
    expect(wishlistService.add).toHaveBeenCalledWith('u1', 'p3')
    first.resolve()
    await waitFor(() => expect(wishlistService.add).toHaveBeenCalledTimes(2))
    expect(wishlistService.add).toHaveBeenLastCalledWith('u1', 'p4')
  })

  it('a failed toggle does not block the next one', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    vi.mocked(wishlistService.add)
      .mockRejectedValueOnce(new ApiError(500, 'Server error'))
      .mockResolvedValue()
    const { result } = await renderLoaded(['p1'])

    act(() => result.current.wishlist.toggle('p3'))
    act(() => result.current.wishlist.toggle('p4'))

    await waitFor(() => expect(wishlistService.add).toHaveBeenCalledTimes(2))
    expect(wishlistService.add).toHaveBeenLastCalledWith('u1', 'p4')
  })
})

describe('useWishlistPendingAction', () => {
  it('the pending toggleWishlist adds the product for the logged-in user and shows "Saved to wishlist"', async () => {
    logOut()
    vi.mocked(wishlistService.add).mockResolvedValue()
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    const { wrapper } = setup()
    const { unmount } = renderHook(() => useWishlistPendingAction(), { wrapper })
    usePendingActionStore.setState({ action: { type: 'toggleWishlist', productId: 'p1' } })

    act(() => runPendingAction(user))

    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.wishlist.saved }])
    )
    expect(wishlistService.add).toHaveBeenCalledWith('u1', 'p1')
    unmount()
  })

  it('the pending toggleWishlist never removes a product that is already saved', async () => {
    vi.mocked(wishlistService.add).mockResolvedValue()
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(wishlistKey, ['p1'])
    const { unmount } = renderHook(() => useWishlistPendingAction(), { wrapper })
    usePendingActionStore.setState({ action: { type: 'toggleWishlist', productId: 'p1' } })

    act(() => runPendingAction(user))

    await waitFor(() => expect(wishlistService.add).toHaveBeenCalledWith('u1', 'p1'))
    expect(wishlistService.remove).not.toHaveBeenCalled()
    expect(queryClient.getQueryData(wishlistKey)).toEqual(['p1'])
    unmount()
  })

  it('the pending toggleWishlist runs once after login', async () => {
    vi.mocked(wishlistService.add).mockResolvedValue()
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    const { wrapper } = setup()
    const { unmount } = renderHook(() => useWishlistPendingAction(), { wrapper })
    usePendingActionStore.setState({ action: { type: 'toggleWishlist', productId: 'p1' } })

    act(() => runPendingAction(user))
    act(() => runPendingAction(user))

    await waitFor(() => expect(toasts()).toHaveLength(1))
    expect(wishlistService.add).toHaveBeenCalledTimes(1)
    expect(usePendingActionStore.getState().action).toBeNull()
    unmount()
  })

  it('no wishlist handler runs after the hook unmounts', () => {
    const { wrapper } = setup()
    const { unmount } = renderHook(() => useWishlistPendingAction(), { wrapper })
    unmount()
    usePendingActionStore.setState({ action: { type: 'toggleWishlist', productId: 'p1' } })

    act(() => runPendingAction(user))

    expect(wishlistService.add).not.toHaveBeenCalled()
    expect(usePendingActionStore.getState().action).toBeNull()
  })
})
