import { describe, expect, it } from 'vitest'
import { AUTH_TEXT } from '@/constants/auth'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ApiError } from '@/services/apiClient'
import { AUTH_ERRORS } from '@/services/authService'
import { authFormError, registerFormError } from './authFormError'

describe('registerFormError', () => {
  it('registerFormError returns Email already exists without retry for a 409', () => {
    expect(registerFormError(new ApiError(409, AUTH_ERRORS.emailExists))).toEqual({
      message: AUTH_ERRORS.emailExists,
      canRetry: false,
    })
  })

  it('registerFormError keeps the network text with retry for status 0', () => {
    expect(registerFormError(new ApiError(0, 'Network error'))).toEqual({
      message: TOAST_MESSAGES.network.error,
      canRetry: true,
    })
  })

  it('registerFormError uses the fixed text when a 409 carries another message', () => {
    expect(registerFormError(new ApiError(409, 'Duplicate key')).message).toBe(
      AUTH_ERRORS.emailExists
    )
  })

  it('authFormError keeps a 409 as the default retryable text', () => {
    const result = authFormError(new ApiError(409, AUTH_ERRORS.emailExists))
    expect(result).toEqual({ message: UI_STATE_MESSAGES.errorDefault, canRetry: true })
    expect(result.message).not.toBe(AUTH_TEXT.invalidCredentials)
  })
})
