import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useFirstLoadRetry } from './useFirstLoadRetry'

interface RefetchResult {
  status: 'pending' | 'error' | 'success'
}

interface Deferred {
  promise: Promise<RefetchResult>
  resolve: (value: RefetchResult) => void
  reject: (error: unknown) => void
}

function deferred(): Deferred {
  let resolve: (value: RefetchResult) => void = () => undefined
  let reject: (error: unknown) => void = () => undefined
  const promise = new Promise<RefetchResult>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, resolve, reject }
}

function renderRetry(key: string, refetch: () => Promise<RefetchResult>) {
  return renderHook(({ id }: { id: string }) => useFirstLoadRetry(id, refetch), {
    initialProps: { id: key },
  })
}

describe('useFirstLoadRetry', () => {
  it('is retrying until the refetch succeeds, then recovered', async () => {
    const request = deferred()
    const { result } = renderRetry('o1', () => request.promise)
    act(() => result.current.retry())
    expect(result.current.isRetrying).toBe(true)
    await act(async () => request.resolve({ status: 'success' }))
    expect(result.current.isRetrying).toBe(false)
    expect(result.current.hasRecovered).toBe(true)
  })

  it('is not recovered when the refetch resolves with an error status', async () => {
    const request = deferred()
    const { result } = renderRetry('o1', () => request.promise)
    act(() => result.current.retry())
    await act(async () => request.resolve({ status: 'error' }))
    expect(result.current.isRetrying).toBe(false)
    expect(result.current.hasRecovered).toBe(false)
  })

  it('is not recovered when the refetch rejects', async () => {
    const request = deferred()
    const { result } = renderRetry('o1', () => request.promise)
    act(() => result.current.retry())
    await act(async () => request.reject(new Error('boom')))
    expect(result.current.isRetrying).toBe(false)
    expect(result.current.hasRecovered).toBe(false)
  })

  it('resets on a key change and ignores a result of the earlier key', async () => {
    const first = deferred()
    const second = deferred()
    const refetch = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const { result, rerender } = renderRetry('o1', refetch)
    act(() => result.current.retry())
    rerender({ id: 'o2' })
    expect(result.current.isRetrying).toBe(false)
    act(() => result.current.retry())
    await act(async () => first.resolve({ status: 'success' }))
    expect(result.current.isRetrying).toBe(true)
    expect(result.current.hasRecovered).toBe(false)
    await act(async () => second.resolve({ status: 'error' }))
    expect(result.current.isRetrying).toBe(false)
  })

  it('does not update or throw when the retry settles after unmount', async () => {
    const request = deferred()
    const errors = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { result, unmount } = renderRetry('o1', () => request.promise)
    act(() => result.current.retry())
    unmount()
    await act(async () => request.resolve({ status: 'success' }))
    expect(errors).not.toHaveBeenCalled()
    errors.mockRestore()
  })
})
