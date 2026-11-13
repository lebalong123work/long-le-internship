import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { useToastStore } from '@/stores/toastStore'
import { useToast } from './useToast'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('success / info / error add a toast of that type', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.success(TOAST_MESSAGES.cart.added)
      result.current.info(TOAST_MESSAGES.auth.loggedOut)
      result.current.error(TOAST_MESSAGES.order.failed)
    })

    expect(useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))).toEqual(
      [
        { type: 'success', message: 'Added to cart' },
        { type: 'info', message: 'You have been logged out' },
        { type: 'error', message: 'Order failed, please try again' },
      ]
    )
  })

  it('success disappears after 5 s, error after 7 s', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.success('ok')
      result.current.error('fail')
    })
    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(useToastStore.getState().toasts.map((t) => t.message)).toEqual(['fail'])

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('returns the same object across re-renders and queue changes', () => {
    const { result, rerender } = renderHook(() => useToast())
    const first = result.current

    act(() => {
      result.current.info('x')
    })
    rerender()

    expect(result.current).toBe(first)
  })

  it('builds the welcome text with the user name', () => {
    expect(TOAST_MESSAGES.auth.welcomeBack('Long')).toBe('Welcome back, Long')
  })
})
