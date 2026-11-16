import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useCarouselIndex } from './useCarouselIndex'

function renderCarousel(count: number) {
  return renderHook(({ total }) => useCarouselIndex(total), { initialProps: { total: count } })
}

describe('useCarouselIndex next', () => {
  it('next moves to the following slide', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(1)
  })

  it('next on the last slide goes back to the first', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.goTo(2))
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(0)
  })
})

describe('useCarouselIndex prev', () => {
  it('prev moves to the previous slide', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.goTo(2))
    act(() => result.current.prev())
    expect(result.current.activeIndex).toBe(1)
  })

  it('prev on the first slide goes to the last', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.prev())
    expect(result.current.activeIndex).toBe(2)
  })
})

describe('useCarouselIndex goTo', () => {
  it('goTo selects the given slide', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.goTo(2))
    expect(result.current.activeIndex).toBe(2)
  })

  it('goTo ignores an index past the last slide', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.goTo(1))
    act(() => result.current.goTo(3))
    expect(result.current.activeIndex).toBe(1)
  })

  it('goTo ignores a negative index', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.goTo(1))
    act(() => result.current.goTo(-1))
    expect(result.current.activeIndex).toBe(1)
  })

  it('goTo ignores a decimal index', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.goTo(1))
    act(() => result.current.goTo(1.5))
    expect(result.current.activeIndex).toBe(1)
  })

  it('goTo ignores NaN and Infinity', () => {
    const { result } = renderCarousel(3)
    act(() => result.current.goTo(1))
    act(() => result.current.goTo(Number.NaN))
    act(() => result.current.goTo(Number.POSITIVE_INFINITY))
    act(() => result.current.goTo(Number.NEGATIVE_INFINITY))
    expect(result.current.activeIndex).toBe(1)
  })
})

describe('useCarouselIndex count', () => {
  it('next and prev stay on the only slide with a count of 1', () => {
    const { result } = renderCarousel(1)
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(0)
    act(() => result.current.prev())
    expect(result.current.activeIndex).toBe(0)
  })

  it('next and prev do nothing with a count of 0', () => {
    const { result } = renderCarousel(0)
    act(() => result.current.next())
    act(() => result.current.prev())
    act(() => result.current.goTo(0))
    expect(result.current.activeIndex).toBe(0)
  })

  it('treats a negative, NaN or Infinity count as no slides', () => {
    for (const count of [-2, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const { result } = renderCarousel(count)
      act(() => result.current.next())
      act(() => result.current.goTo(1))
      expect(result.current.activeIndex).toBe(0)
    }
  })

  it('rounds a decimal count down', () => {
    const { result } = renderCarousel(2.7)
    act(() => result.current.goTo(2))
    expect(result.current.activeIndex).toBe(0)
    act(() => result.current.prev())
    expect(result.current.activeIndex).toBe(1)
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(0)
  })
})

describe('useCarouselIndex count changes', () => {
  it('keeps the selected slide when the count grows', () => {
    const { result, rerender } = renderCarousel(2)
    act(() => result.current.goTo(1))
    rerender({ total: 3 })
    expect(result.current.activeIndex).toBe(1)
  })

  it('moves to the last slide when the count shrinks below the selected one', () => {
    const { result, rerender } = renderCarousel(3)
    act(() => result.current.goTo(2))
    rerender({ total: 2 })
    expect(result.current.activeIndex).toBe(1)
    act(() => result.current.next())
    expect(result.current.activeIndex).toBe(0)
  })
})
