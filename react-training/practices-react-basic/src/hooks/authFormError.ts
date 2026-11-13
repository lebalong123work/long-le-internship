import { AUTH_TEXT } from '@/constants/auth'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ApiError } from '@/services/apiClient'
import { failureMessage } from './failureMessage'

export interface AuthFormError {
  message: string
  canRetry: boolean
}

const CREDENTIAL_STATUSES: ReadonlySet<number> = new Set([401, 404])

function isCredentialError(error: unknown): boolean {
  return error instanceof ApiError && CREDENTIAL_STATUSES.has(error.status)
}

export function authFormError(error: unknown): AuthFormError {
  if (isCredentialError(error)) {
    return { message: AUTH_TEXT.invalidCredentials, canRetry: false }
  }
  return { message: failureMessage(error, UI_STATE_MESSAGES.errorDefault), canRetry: true }
}
