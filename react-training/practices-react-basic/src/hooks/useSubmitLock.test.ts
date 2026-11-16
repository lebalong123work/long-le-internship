import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSubmitLock } from './useSubmitLock'

describe('useSubmitLock', () => {
  it('acquire succeeds when the lock is free', () => {
    const { result } = renderHook(() => useSubmitLock())
    expect(result.current.acquire()).toBe(true)
  })

  it('acquire succeeds again after release', () => {
    const { result } = renderHook(() => useSubmitLock())
    result.current.acquire()
    result.current.release()
    expect(result.current.acquire()).toBe(true)
  })

  it('a second acquire before release fails', () => {
    const { result } = renderHook(() => useSubmitLock())
    result.current.acquire()
    expect(result.current.acquire()).toBe(false)
  })

  it('a lock held by one hook instance does not block another', () => {
    const first = renderHook(() => useSubmitLock())
    const second = renderHook(() => useSubmitLock())
    first.result.current.acquire()
    expect(second.result.current.acquire()).toBe(true)
  })
})
