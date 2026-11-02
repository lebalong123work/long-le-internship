import { useSearchParams } from 'react-router-dom'

export type AuthMode = 'login' | 'register'

const AUTH_PARAM = 'auth'
const REDIRECT_PARAM = 'redirect'

/** Path that opens the login modal on Home and returns to `redirect` after login. */
export function loginRedirectPath(redirect: string): string {
  const params = new URLSearchParams({ [AUTH_PARAM]: 'login', [REDIRECT_PARAM]: redirect })
  return `/?${params.toString()}`
}

/** Login / Sign Up modal state, stored in the URL (?auth=login|register&redirect=<path>). */
export function useAuthModal() {
  const [params, setParams] = useSearchParams()
  const value = params.get(AUTH_PARAM)
  const mode: AuthMode | null = value === 'login' || value === 'register' ? value : null
  const redirect = params.get(REDIRECT_PARAM)

  function open(nextMode: AuthMode, redirectTo?: string): void {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(AUTH_PARAM, nextMode)
      if (redirectTo) next.set(REDIRECT_PARAM, redirectTo)
      return next
    })
  }

  function close(): void {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete(AUTH_PARAM)
      next.delete(REDIRECT_PARAM)
      return next
    })
  }

  return { mode, redirect, open, close }
}
