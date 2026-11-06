import { act, renderHook } from '@testing-library/react'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerPendingActionHandler, usePendingActionStore } from '@/stores/pendingActionStore'
import { useAuthModal } from './useAuthModal'
import { useDropPendingActionOnClose, useRequestLogin } from './usePendingAction'
import type { ReactNode } from 'react'
import type { PendingAction } from '@/types'

const addToCart: PendingAction = {
  type: 'addToCart',
  payload: { productId: 'p1', color: 'Black', size: 'M', quantity: 1 },
}

function wrapperAt(path: string) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  }
}

function useHarness() {
  useDropPendingActionOnClose()
  return {
    requestLogin: useRequestLogin(),
    modal: useAuthModal(),
    location: useLocation(),
    navigate: useNavigate(),
  }
}

beforeEach(() => {
  usePendingActionStore.setState({ action: null })
})

describe('useRequestLogin', () => {
  it('stores the action and opens the login modal', () => {
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperAt('/shop/p1') })

    act(() => result.current.requestLogin(addToCart))

    expect(usePendingActionStore.getState().action).toEqual(addToCart)
    expect(result.current.location.pathname).toBe('/shop/p1')
    expect(new URLSearchParams(result.current.location.search).get('auth')).toBe('login')
  })
})

describe('useDropPendingActionOnClose', () => {
  it('keeps the action while the modal opens and stays open', () => {
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperAt('/shop/p1') })

    act(() => result.current.requestLogin(addToCart))
    act(() => result.current.modal.open('register'))

    expect(usePendingActionStore.getState().action).toEqual(addToCart)
  })

  it('drops the action when the modal is closed without login; handler never runs', () => {
    const handler = vi.fn()
    const unregister = registerPendingActionHandler('addToCart', handler)
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperAt('/shop/p1') })

    act(() => result.current.requestLogin(addToCart))
    act(() => result.current.modal.close())

    expect(result.current.modal.mode).toBeNull()
    expect(usePendingActionStore.getState().action).toBeNull()
    expect(handler).not.toHaveBeenCalled()
    unregister()
  })

  it('drops the action when the modal is closed with the browser Back button', () => {
    const { result } = renderHook(() => useHarness(), { wrapper: wrapperAt('/shop/p1') })

    act(() => result.current.requestLogin(addToCart))
    act(() => result.current.navigate(-1))

    expect(result.current.modal.mode).toBeNull()
    expect(usePendingActionStore.getState().action).toBeNull()
  })

  it('does not drop an action while the modal stays closed', () => {
    const { result, rerender } = renderHook(() => useHarness(), { wrapper: wrapperAt('/') })

    act(() => usePendingActionStore.getState().setAction(addToCart))
    rerender()

    expect(result.current.modal.mode).toBeNull()
    expect(usePendingActionStore.getState().action).toEqual(addToCart)
  })
})
