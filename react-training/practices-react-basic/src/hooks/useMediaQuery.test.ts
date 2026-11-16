import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DESKTOP_MEDIA_QUERY } from '@/constants/breakpoints'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import { useMediaQuery } from './useMediaQuery'

describe('useMediaQuery', () => {
  it('returns true when the query matches', () => {
    installMatchMediaStub(true)
    const { result } = renderHook(() => useMediaQuery(DESKTOP_MEDIA_QUERY))
    expect(result.current).toBe(true)
  })

  it('returns false when the query does not match', () => {
    installMatchMediaStub(false)
    const { result } = renderHook(() => useMediaQuery(DESKTOP_MEDIA_QUERY))
    expect(result.current).toBe(false)
  })

  it('updates when the media query starts matching', () => {
    const media = installMatchMediaStub(false)
    const { result } = renderHook(() => useMediaQuery(DESKTOP_MEDIA_QUERY))
    act(() => media.setMatches(true))
    expect(result.current).toBe(true)
  })

  it('stops listening after unmount', () => {
    const media = installMatchMediaStub(false)
    const { unmount } = renderHook(() => useMediaQuery(DESKTOP_MEDIA_QUERY))
    expect(media.listenerCount()).toBe(1)
    unmount()
    expect(media.listenerCount()).toBe(0)
  })
})
