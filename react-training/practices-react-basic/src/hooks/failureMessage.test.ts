import { describe, expect, it } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import { cartFailureMessage, failureMessage } from './failureMessage'

const fallback = TOAST_MESSAGES.cart.updateFailed

describe('failureMessage', () => {
  it('returns the network text for a status 0 error', () => {
    expect(failureMessage(new ApiError(0, 'Network error'), fallback)).toBe(
      TOAST_MESSAGES.network.error
    )
  })

  it('returns the fallback for a server error', () => {
    expect(failureMessage(new ApiError(500, 'Internal Server Error'), fallback)).toBe(fallback)
  })

  it('returns the fallback for a non-API error', () => {
    expect(failureMessage(new Error('Login required'), fallback)).toBe(fallback)
  })
})

describe('cartFailureMessage', () => {
  it('F1 returns the network text for a status 0 error', () => {
    expect(cartFailureMessage(new ApiError(0, 'Network error'))).toBe(TOAST_MESSAGES.network.error)
  })

  it('F3 returns the cart error text for any other error', () => {
    expect(cartFailureMessage(new ApiError(500, 'Internal Server Error'))).toBe(
      TOAST_MESSAGES.cart.updateFailed
    )
  })
})
