import type { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types'

// Mock auth against json-server `users` — see docs/architecture.md §5.
export function login(_credentials: LoginCredentials): Promise<AuthResponse> {
  throw new Error('not implemented')
}

export function register(_data: RegisterCredentials): Promise<AuthResponse> {
  throw new Error('not implemented')
}
