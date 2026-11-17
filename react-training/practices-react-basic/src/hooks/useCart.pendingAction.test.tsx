import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { runPendingAction, usePendingActionStore } from '@/stores/pendingActionStore'
import { useToastStore } from '@/stores/toastStore'
import { useAddToCartPendingAction } from './useCart'
import type { ReactNode } from 'react'
import type { AddToCartDto, Cart, User } from '@/types'

vi.mock('@/services/cartService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const payload: AddToCartDto = { productId: 'p1', color: 'Blue', size: 'S', quantity: 2 }
const serverCart: Cart = {
  id: 'c1',
  userId: 'u1',
  items: [{ id: 'p1__Blue__S', ...payload }],
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  const view = renderHook(() => useAddToCartPendingAction(), { wrapper })
  return { queryClient, ...view }
}

function toasts() {
  return useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))
}

function savePendingAdd() {
  usePendingActionStore.setState({ action: { type: 'addToCart', payload } })
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  useToastStore.setState({ toasts: [] })
  usePendingActionStore.setState({ action: null })
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('useAddToCartPendingAction', () => {
  it('adds the pending item once the handler is mounted', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { unmount } = setup()
    savePendingAdd()

    act(() => runPendingAction(user))

    await waitFor(() => expect(cartService.addItem).toHaveBeenCalledTimes(1))
    unmount()
  })

  it('uses the logged-in user from runPendingAction while the session store is still guest', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { unmount } = setup()
    savePendingAdd()

    act(() => runPendingAction(user))

    await waitFor(() => expect(cartService.addItem).toHaveBeenCalledWith('u1', payload))
    unmount()
  })

  it('runs the pending add only once', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { unmount } = setup()
    savePendingAdd()

    act(() => runPendingAction(user))
    act(() => runPendingAction(user))

    await waitFor(() => expect(toasts()).toHaveLength(1))
    expect(cartService.addItem).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('shows the network message when the add fails without a connection', async () => {
    vi.mocked(cartService.addItem).mockRejectedValue(new ApiError(0, 'Network error'))
    const { unmount } = setup()
    savePendingAdd()

    act(() => runPendingAction(user))

    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.network.error }])
    )
    unmount()
  })

  it('shows the cart failure message when the server fails', async () => {
    vi.mocked(cartService.addItem).mockRejectedValue(new ApiError(500, 'Server error'))
    const { unmount } = setup()
    savePendingAdd()

    act(() => runPendingAction(user))

    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
    )
    unmount()
  })

  it('shows "Added to cart" once and caches the server cart for the user', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    vi.mocked(cartService.getCart).mockResolvedValue(serverCart)
    const { queryClient, unmount } = setup()
    savePendingAdd()

    act(() => runPendingAction(user))

    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.cart.added }])
    )
    expect(queryClient.getQueryData(queryKeys.cart('u1'))).toEqual(serverCart)
    unmount()
  })

  it('waits for a cart read already running before adding, so only one cart is read', async () => {
    let finishRead: (cart: Cart) => void = () => undefined
    vi.mocked(cartService.getCart).mockReturnValue(
      new Promise<Cart>((resolve) => {
        finishRead = resolve
      })
    )
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { queryClient, unmount } = setup()
    void queryClient.fetchQuery({
      queryKey: queryKeys.cart('u1'),
      queryFn: () => cartService.getCart('u1'),
    })
    savePendingAdd()

    act(() => runPendingAction(user))
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(cartService.addItem).not.toHaveBeenCalled()

    await act(async () => finishRead({ id: 'c1', userId: 'u1', items: [] }))
    await waitFor(() => expect(cartService.addItem).toHaveBeenCalledTimes(1))
    expect(cartService.getCart).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('does not read the cart again when it is already cached', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { queryClient, unmount } = setup()
    queryClient.setQueryData(queryKeys.cart('u1'), { id: 'c1', userId: 'u1', items: [] })
    savePendingAdd()

    act(() => runPendingAction(user))

    await waitFor(() => expect(cartService.addItem).toHaveBeenCalledTimes(1))
    expect(cartService.getCart).not.toHaveBeenCalled()
    unmount()
  })

  it('removes the handler on unmount', () => {
    const { unmount } = setup()
    unmount()
    savePendingAdd()

    act(() => runPendingAction(user))

    expect(cartService.addItem).not.toHaveBeenCalled()
  })
})
