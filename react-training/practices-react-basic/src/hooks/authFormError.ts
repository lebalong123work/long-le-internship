import { AUTH_TEXT } from '@/constants/auth'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ApiError } from '@/services/apiClient'
import { AUTH_ERRORS } from '@/services/authService'
import { failureMessage } from './failureMessage'

export interface AuthFormError {
  message: string
  canRetry: boolean
}

const CREDENTIAL_STATUSES: ReadonlySet<number> = new Set([401, 404])
const CONFLICT_STATUS = 409

function isCredentialError(error: unknown): boolean {
  return error instanceof ApiError && CREDENTIAL_STATUSES.has(error.status)
}

export function authFormError(error: unknown): AuthFormError {
  if (isCredentialError(error)) {
    return { message: AUTH_TEXT.invalidCredentials, canRetry: false }
  }
  return { message: failureMessage(error, UI_STATE_MESSAGES.errorDefault), canRetry: true }
}

export function registerFormError(error: unknown): AuthFormError {
  if (error instanceof ApiError && error.status === CONFLICT_STATUS) {
    return { message: AUTH_ERRORS.emailExists, canRetry: false }
  }
  return authFormError(error)
}
