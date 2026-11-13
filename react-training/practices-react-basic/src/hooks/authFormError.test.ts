import { describe, expect, it } from 'vitest'
import { AUTH_TEXT } from '@/constants/auth'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ApiError } from '@/services/apiClient'
import { AUTH_ERRORS } from '@/services/authService'
import { authFormError } from './authFormError'

describe('authFormError credential errors', () => {
  it('returns the credentials text without retry for a 401', () => {
    expect(authFormError(new ApiError(401, AUTH_ERRORS.wrongPassword))).toEqual({
      message: AUTH_TEXT.invalidCredentials,
      canRetry: false,
    })
  })

  it('returns the credentials text without retry for a 404', () => {
    expect(authFormError(new ApiError(404, AUTH_ERRORS.emailNotFound))).toEqual({
      message: AUTH_TEXT.invalidCredentials,
      canRetry: false,
    })
  })

  it('never shows the service message for a 401 or 404', () => {
    const messages = [
      authFormError(new ApiError(401, AUTH_ERRORS.wrongPassword)).message,
      authFormError(new ApiError(404, AUTH_ERRORS.emailNotFound)).message,
    ]
    expect(messages).not.toContain(AUTH_ERRORS.wrongPassword)
    expect(messages).not.toContain(AUTH_ERRORS.emailNotFound)
  })
})

describe('authFormError retryable errors', () => {
  it('returns the network text with retry for status 0', () => {
    expect(authFormError(new ApiError(0, 'Network error'))).toEqual({
      message: TOAST_MESSAGES.network.error,
      canRetry: true,
    })
  })

  it('treats a plain Error as retryable with the default text', () => {
    expect(authFormError(new Error('boom'))).toEqual({
      message: UI_STATE_MESSAGES.errorDefault,
      canRetry: true,
    })
  })

  it('returns the default text with retry for a 500', () => {
    expect(authFormError(new ApiError(500, 'Internal Server Error'))).toEqual({
      message: UI_STATE_MESSAGES.errorDefault,
      canRetry: true,
    })
  })

  it('never returns the raw server status text', () => {
    expect(authFormError(new ApiError(503, 'Service Unavailable')).message).not.toBe(
      'Service Unavailable'
    )
  })
})
