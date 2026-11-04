import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToastStore } from './toastStore'

function messages(): string[] {
  return useToastStore.getState().toasts.map((toast) => toast.message)
}

describe('toastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('adds a toast with type and message and returns its id', () => {
    const id = useToastStore.getState().addToast('success', 'Added to cart')

    expect(useToastStore.getState().toasts).toEqual([
      { id, type: 'success', message: 'Added to cart' },
    ])
  })

  it('gives every toast a different id', () => {
    const { addToast } = useToastStore.getState()

    expect(addToast('info', 'a')).not.toBe(addToast('info', 'b'))
  })

  it('keeps max 3 toasts — the 4th drops the oldest', () => {
    const { addToast } = useToastStore.getState()
    addToast('info', 'one')
    addToast('info', 'two')
    addToast('info', 'three')
    addToast('info', 'four')

    expect(messages()).toEqual(['two', 'three', 'four'])
  })

  it('clears the timer of a dropped toast', () => {
    const { addToast } = useToastStore.getState()
    addToast('info', 'one')
    expect(vi.getTimerCount()).toBe(1)

    addToast('info', 'two')
    addToast('info', 'three')
    addToast('info', 'four')

    expect(vi.getTimerCount()).toBe(3)
  })

  it.each([
    ['success', 3000],
    ['info', 3000],
    ['error', 5000],
  ] as const)('removes a %s toast after %i ms', (type, ms) => {
    useToastStore.getState().addToast(type, 'msg')

    vi.advanceTimersByTime(ms - 1)
    expect(messages()).toEqual(['msg'])

    vi.advanceTimersByTime(1)
    expect(messages()).toEqual([])
  })

  it('removeToast removes early and stops its timer', () => {
    const { addToast, removeToast } = useToastStore.getState()
    const id = addToast('success', 'Added to cart')

    removeToast(id)

    expect(messages()).toEqual([])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('removeToast with an unknown id changes nothing', () => {
    const { addToast, removeToast } = useToastStore.getState()
    addToast('success', 'Added to cart')
    const before = useToastStore.getState().toasts

    removeToast('unknown')

    expect(useToastStore.getState().toasts).toBe(before)
  })

  it('does not persist toasts to localStorage', () => {
    useToastStore.getState().addToast('success', 'Added to cart')

    expect(JSON.stringify({ ...localStorage })).not.toContain('Added to cart')
  })
})
