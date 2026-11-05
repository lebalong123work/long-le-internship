import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  registerPendingActionHandler,
  runPendingAction,
  usePendingActionStore,
} from './pendingActionStore'
import type { PendingAction, User } from '@/types'

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const addToCart: PendingAction = {
  type: 'addToCart',
  payload: { productId: 'p1', color: 'Black', size: 'M', quantity: 2 },
}
const toggleWishlist: PendingAction = { type: 'toggleWishlist', productId: 'p2' }

const unregisters: Array<() => void> = []

function register(...args: Parameters<typeof registerPendingActionHandler>): () => void {
  const unregister = registerPendingActionHandler(...args)
  unregisters.push(unregister)
  return unregister
}

beforeEach(() => {
  usePendingActionStore.setState({ action: null })
})

afterEach(() => {
  unregisters.splice(0).forEach((unregister) => unregister())
})

describe('pendingActionStore', () => {
  it('setAction stores the action, clearAction removes it', () => {
    usePendingActionStore.getState().setAction(addToCart)
    expect(usePendingActionStore.getState().action).toEqual(addToCart)

    usePendingActionStore.getState().clearAction()
    expect(usePendingActionStore.getState().action).toBeNull()
  })

  it('runs the registered handler once with the action and the user, then clears it', () => {
    const handler = vi.fn()
    register('addToCart', handler)
    usePendingActionStore.getState().setAction(addToCart)

    runPendingAction(user)
    runPendingAction(user)

    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(addToCart, user)
    expect(usePendingActionStore.getState().action).toBeNull()
  })

  it('calls only the handler of the action type', () => {
    const cartHandler = vi.fn()
    const wishlistHandler = vi.fn()
    register('addToCart', cartHandler)
    register('toggleWishlist', wishlistHandler)
    usePendingActionStore.getState().setAction(toggleWishlist)

    runPendingAction(user)

    expect(wishlistHandler).toHaveBeenCalledWith(toggleWishlist, user)
    expect(cartHandler).not.toHaveBeenCalled()
  })

  it('does nothing when no action is pending', () => {
    const handler = vi.fn()
    register('addToCart', handler)

    expect(() => runPendingAction(user)).not.toThrow()
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not throw for an action without a handler and still clears it', () => {
    usePendingActionStore.getState().setAction(toggleWishlist)

    expect(() => runPendingAction(user)).not.toThrow()
    expect(usePendingActionStore.getState().action).toBeNull()
  })

  it('clears the action before the handler runs', () => {
    let actionDuringRun: PendingAction | null = addToCart
    register('addToCart', () => {
      actionDuringRun = usePendingActionStore.getState().action
    })
    usePendingActionStore.getState().setAction(addToCart)

    runPendingAction(user)

    expect(actionDuringRun).toBeNull()
  })

  it('unregister removes the handler', () => {
    const handler = vi.fn()
    const unregister = register('addToCart', handler)
    unregister()
    usePendingActionStore.getState().setAction(addToCart)

    runPendingAction(user)

    expect(handler).not.toHaveBeenCalled()
  })

  it('a new registration replaces the old one; the old unregister keeps the new one', () => {
    const first = vi.fn()
    const second = vi.fn()
    const unregisterFirst = register('addToCart', first)
    register('addToCart', second)
    unregisterFirst()
    usePendingActionStore.getState().setAction(addToCart)

    runPendingAction(user)

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })

  it('is not persisted', () => {
    usePendingActionStore.getState().setAction(addToCart)
    expect(localStorage.length).toBe(0)
  })
})
