import { useNavigate, useSearchParams } from 'react-router-dom'

export type AuthMode = 'login' | 'register'

const AUTH_PARAM = 'auth'
const REDIRECT_PARAM = 'redirect'

interface AuthModalControls {
  mode: AuthMode | null
  redirect: string | null
  open: (nextMode: AuthMode, redirectTo?: string) => void
  close: () => void
  switchMode: (nextMode: AuthMode) => void
  closeAndRedirect: () => void
}

export function loginRedirectPath(redirect: string): string {
  const params = new URLSearchParams({ [AUTH_PARAM]: 'login', [REDIRECT_PARAM]: redirect })
  return `/?${params.toString()}`
}

function toSafeRedirect(value: string | null): string | null {
  if (!value?.startsWith('/')) return null
  const appOrigin = window.location.origin
  const url = new URL(value, appOrigin)
  if (url.origin !== appOrigin) return null
  return url.pathname + url.search + url.hash
}

function withoutAuthParams(prev: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(prev)
  next.delete(AUTH_PARAM)
  next.delete(REDIRECT_PARAM)
  return next
}

export function useAuthModal(): AuthModalControls {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const value = params.get(AUTH_PARAM)
  const mode: AuthMode | null = value === 'login' || value === 'register' ? value : null
  const redirect = toSafeRedirect(params.get(REDIRECT_PARAM))

  function open(nextMode: AuthMode, redirectTo?: string): void {
    setParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set(AUTH_PARAM, nextMode)
      if (redirectTo) next.set(REDIRECT_PARAM, redirectTo)
      return next
    })
  }

  function close(): void {
    setParams(withoutAuthParams)
  }

  function switchMode(nextMode: AuthMode): void {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set(AUTH_PARAM, nextMode)
        return next
      },
      { replace: true }
    )
  }

  function closeAndRedirect(): void {
    if (redirect) {
      navigate(redirect, { replace: true })
      return
    }
    setParams(withoutAuthParams, { replace: true })
  }

  return { mode, redirect, open, close, switchMode, closeAndRedirect }
}
