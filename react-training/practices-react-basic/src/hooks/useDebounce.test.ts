import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebounce } from './useDebounce'

const DELAY_MS = 300

function renderDebounce(initial: string) {
  return renderHook(({ value }) => useDebounce(value, DELAY_MS), {
    initialProps: { value: initial },
  })
}

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('useDebounce', () => {
  it('returns the first value at once', () => {
    const { result } = renderDebounce('shirt')
    expect(result.current).toBe('shirt')
  })

  it('updates the value after the delay', () => {
    const { result, rerender } = renderDebounce('s')
    rerender({ value: 'shirt' })

    act(() => vi.advanceTimersByTime(DELAY_MS - 1))
    expect(result.current).toBe('s')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('shirt')
  })

  it('restarts the delay when the value changes', () => {
    const { result, rerender } = renderDebounce('s')
    rerender({ value: 'sh' })
    act(() => vi.advanceTimersByTime(DELAY_MS - 1))
    rerender({ value: 'shirt' })

    act(() => vi.advanceTimersByTime(DELAY_MS - 1))
    expect(result.current).toBe('s')

    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('shirt')
  })
})
