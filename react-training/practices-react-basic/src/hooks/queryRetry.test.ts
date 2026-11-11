import { describe, expect, it } from 'vitest'
import { ApiError } from '@/services/apiClient'
import { retryUnlessNotFound } from './queryRetry'

describe('retryUnlessNotFound', () => {
  it('retries another error while fewer than 3 failures', () => {
    expect(retryUnlessNotFound(2, new ApiError(500, 'Internal Server Error'))).toBe(true)
  })

  it('does not retry a not-found error', () => {
    expect(retryUnlessNotFound(0, new ApiError(404, 'Not Found'))).toBe(false)
  })

  it('stops after 3 failures', () => {
    expect(retryUnlessNotFound(3, new ApiError(500, 'Internal Server Error'))).toBe(false)
  })
})
