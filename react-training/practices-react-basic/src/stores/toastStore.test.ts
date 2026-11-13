import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_ERRORS } from '@/constants/toast'
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
    ['success', 5000],
    ['info', 5000],
    ['error', 7000],
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

  it('keeps the message exactly as given', () => {
    useToastStore.getState().addToast('info', '  Added to cart  ')

    expect(messages()).toEqual(['  Added to cart  '])
  })

  it('throws for an empty, spaces-only or non-string message and adds nothing', () => {
    const { addToast } = useToastStore.getState()

    expect(() => addToast('info', '')).toThrow(TOAST_ERRORS.invalidMessage)
    expect(() => addToast('info', '   ')).toThrow(TOAST_ERRORS.invalidMessage)
    expect(() => Reflect.apply(addToast, null, ['info', 42])).toThrow(TOAST_ERRORS.invalidMessage)
    expect(useToastStore.getState().toasts).toEqual([])
    expect(vi.getTimerCount()).toBe(0)
  })

  it('pauseToast stops the auto-close of that toast', () => {
    const { addToast, pauseToast } = useToastStore.getState()
    const id = addToast('success', 'msg')

    pauseToast(id, 'focus')
    vi.advanceTimersByTime(60000)

    expect(messages()).toEqual(['msg'])
  })

  it('pauseToast with an unknown id changes nothing', () => {
    const { addToast, pauseToast } = useToastStore.getState()
    addToast('success', 'msg')
    const before = useToastStore.getState().toasts

    pauseToast('unknown', 'focus')

    expect(useToastStore.getState().toasts).toBe(before)
    vi.advanceTimersByTime(5000)
    expect(messages()).toEqual([])
  })

  it('resumeToast closes the toast after the remaining time', () => {
    const { addToast, pauseToast, resumeToast } = useToastStore.getState()
    const id = addToast('success', 'msg')
    vi.advanceTimersByTime(2000)

    pauseToast(id, 'hover')
    vi.advanceTimersByTime(10000)
    resumeToast(id, 'hover')

    vi.advanceTimersByTime(2999)
    expect(messages()).toEqual(['msg'])
    vi.advanceTimersByTime(1)
    expect(messages()).toEqual([])
  })

  it('resumeToast of a toast that is not paused changes nothing', () => {
    const { addToast, resumeToast } = useToastStore.getState()
    const id = addToast('success', 'msg')
    vi.advanceTimersByTime(2000)

    resumeToast(id, 'focus')

    vi.advanceTimersByTime(3000)
    expect(messages()).toEqual([])
  })

  it('stays paused until both focus and hover end', () => {
    const { addToast, pauseToast, resumeToast } = useToastStore.getState()
    const id = addToast('info', 'msg')
    pauseToast(id, 'focus')
    pauseToast(id, 'hover')

    resumeToast(id, 'focus')
    vi.advanceTimersByTime(60000)
    expect(messages()).toEqual(['msg'])

    resumeToast(id, 'hover')
    vi.advanceTimersByTime(5000)
    expect(messages()).toEqual([])
  })

  it('resuming a reason that was not paused keeps the toast paused', () => {
    const { addToast, pauseToast, resumeToast } = useToastStore.getState()
    const id = addToast('info', 'msg')
    pauseToast(id, 'focus')

    resumeToast(id, 'hover')
    vi.advanceTimersByTime(60000)

    expect(messages()).toEqual(['msg'])
  })

  it('the 4th toast drops the oldest toast without focus', () => {
    const { addToast, pauseToast } = useToastStore.getState()
    const first = addToast('info', 'one')
    addToast('info', 'two')
    addToast('info', 'three')
    pauseToast(first, 'focus')

    addToast('info', 'four')

    expect(messages()).toEqual(['one', 'three', 'four'])
  })

  it('a toast paused only by hover can still be dropped', () => {
    const { addToast, pauseToast } = useToastStore.getState()
    const first = addToast('info', 'one')
    addToast('info', 'two')
    addToast('info', 'three')
    pauseToast(first, 'hover')

    addToast('info', 'four')

    expect(messages()).toEqual(['two', 'three', 'four'])
  })

  it('does not persist toasts to localStorage', () => {
    useToastStore.getState().addToast('success', 'Added to cart')

    expect(JSON.stringify({ ...localStorage })).not.toContain('Added to cart')
  })
})
