import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useUpdateCartQuantity } from './useCart'
import { useGuestCartMerge, useGuestCartMergeRecovery } from './useGuestCartMerge'
import type { ReactNode } from 'react'
import type { Cart, CartOwner, GuestMergeResult, User } from '@/types'

vi.mock('@/services/cartService')

const GUEST_ID = '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c'
const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const USER_OWNER: CartOwner = { kind: 'user', id: 'u1' }
const GUEST_OWNER: CartOwner = { kind: 'guest', id: GUEST_ID }
const accountCart: Cart = { id: 'a', userId: 'u1', items: [] }
const mergedCart: Cart = {
  id: 'a',
  userId: 'u1',
  items: [{ id: 'p1__Black__M', productId: 'p1', color: 'Black', size: 'M', quantity: 2 }],
}

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, wrapper }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function toasts() {
  return useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  useToastStore.setState({ toasts: [] })
  localStorage.setItem('mcs_guest', GUEST_ID)
  vi.mocked(cartService.getCart).mockResolvedValue(accountCart)
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('useGuestCartMerge', () => {
  it('U1 resolves without a request when the browser has no guest id', async () => {
    localStorage.clear()
    const { wrapper } = setup()
    const { result } = renderHook(() => useGuestCartMerge(), { wrapper })

    await act(() => result.current(user))

    expect(cartService.mergeGuestCart).not.toHaveBeenCalled()
    expect(cartService.getCart).not.toHaveBeenCalled()
  })

  it('U2 stores the merged account cart and invalidates the guest and account carts', async () => {
    vi.mocked(cartService.mergeGuestCart).mockResolvedValue({ status: 'merged', cart: mergedCart })
    const { queryClient, wrapper } = setup()
    const invalidate = vi.spyOn(queryClient, 'invalidateQueries')
    const { result } = renderHook(() => useGuestCartMerge(), { wrapper })

    await act(() => result.current(user))

    expect(cartService.mergeGuestCart).toHaveBeenCalledWith(GUEST_ID, 'u1')
    expect(queryClient.getQueryData(queryKeys.cart(USER_OWNER))).toEqual(mergedCart)
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.cart(GUEST_OWNER) })
    expect(invalidate).toHaveBeenCalledWith({ queryKey: queryKeys.cart(USER_OWNER) })
    expect(toasts()).toEqual([])
  })

  it('U3 shows the cart error toast on failure and still resolves', async () => {
    vi.mocked(cartService.mergeGuestCart).mockRejectedValue(new ApiError(500, 'Server error'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useGuestCartMerge(), { wrapper })

    await expect(act(() => result.current(user))).resolves.toBeUndefined()

    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
  })

  it('U4 waits for a running cart mutation before merging', async () => {
    const update = deferred<Cart>()
    vi.mocked(cartService.updateQuantity).mockReturnValue(update.promise)
    vi.mocked(cartService.mergeGuestCart).mockResolvedValue({ status: 'nothing' })
    const { wrapper } = setup()
    const { result } = renderHook(
      () => ({ update: useUpdateCartQuantity(), merge: useGuestCartMerge() }),
      { wrapper }
    )

    act(() => result.current.update.mutate({ itemId: 'x', quantity: 2 }))
    await waitFor(() => expect(cartService.updateQuantity).toHaveBeenCalled())
    let merged: Promise<void> = Promise.resolve()
    act(() => {
      merged = result.current.merge(user)
    })
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(cartService.mergeGuestCart).not.toHaveBeenCalled()

    update.resolve({ id: 'g', guestId: GUEST_ID, items: [] })
    await act(() => merged)
    expect(cartService.mergeGuestCart).toHaveBeenCalledTimes(1)
  })

  it('U5 shows the original-account info toast and writes nothing to the cache', async () => {
    vi.mocked(cartService.mergeGuestCart).mockResolvedValue({ status: 'otherAccount' })
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useGuestCartMerge(), { wrapper })

    await act(() => result.current(user))

    expect(toasts()).toEqual([
      { type: 'info', message: TOAST_MESSAGES.cart.mergeNeedsOriginalAccount },
    ])
    expect(queryClient.getQueryData(queryKeys.cart(USER_OWNER))).toEqual(accountCart)
  })

  it('U6 runs one merge for two calls with the same guest and user at the same time', async () => {
    const pending = deferred<GuestMergeResult>()
    vi.mocked(cartService.mergeGuestCart).mockReturnValue(pending.promise)
    const { wrapper } = setup()
    const { result } = renderHook(() => ({ a: useGuestCartMerge(), b: useGuestCartMerge() }), {
      wrapper,
    })

    let first: Promise<void> = Promise.resolve()
    let second: Promise<void> = Promise.resolve()
    act(() => {
      first = result.current.a(user)
      second = result.current.b(user)
    })
    expect(second).toBe(first)

    pending.resolve({ status: 'nothing' })
    await act(() => first)
    expect(cartService.mergeGuestCart).toHaveBeenCalledTimes(1)
  })
})

describe('useGuestCartMergeRecovery', () => {
  it('V1 runs one merge for a session restored at startup', async () => {
    vi.mocked(cartService.mergeGuestCart).mockResolvedValue({ status: 'nothing' })
    useAuthStore.setState({ user, token: 't', isAuthenticated: true })
    const { wrapper } = setup()

    renderHook(() => useGuestCartMergeRecovery(), { wrapper })

    await waitFor(() => expect(cartService.mergeGuestCart).toHaveBeenCalledWith(GUEST_ID, 'u1'))
  })

  it('V2 does not run again on a rerender', async () => {
    vi.mocked(cartService.mergeGuestCart).mockResolvedValue({ status: 'nothing' })
    useAuthStore.setState({ user, token: 't', isAuthenticated: true })
    const { wrapper } = setup()

    const { rerender } = renderHook(() => useGuestCartMergeRecovery(), { wrapper })
    await waitFor(() => expect(cartService.mergeGuestCart).toHaveBeenCalledTimes(1))
    rerender()
    rerender()
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(cartService.mergeGuestCart).toHaveBeenCalledTimes(1)
  })

  it('V3 does not run for a login made after startup', async () => {
    const { wrapper } = setup()

    renderHook(() => useGuestCartMergeRecovery(), { wrapper })
    act(() => useAuthStore.setState({ user, token: 't', isAuthenticated: true }))
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(cartService.mergeGuestCart).not.toHaveBeenCalled()
  })

  it('V4 does nothing without a restored session', async () => {
    const { wrapper } = setup()

    renderHook(() => useGuestCartMergeRecovery(), { wrapper })
    await new Promise((resolve) => setTimeout(resolve, 20))

    expect(cartService.mergeGuestCart).not.toHaveBeenCalled()
    expect(cartService.getCart).not.toHaveBeenCalled()
  })
})
