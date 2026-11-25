import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from './authStore'
import type { User } from '@/types'

const STORAGE_KEY = 'mcs_auth'

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }

beforeEach(() => {
  useAuthStore.getState().login(user, 'mock-token-u1')
})

afterEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  localStorage.clear()
})

describe('authStore.updateUser', () => {
  it('S7 merges the new fields into the logged-in user and keeps the session', () => {
    useAuthStore.getState().updateUser({ name: 'New Name' })

    const state = useAuthStore.getState()
    expect(state.user).toEqual({ ...user, name: 'New Name' })
    expect(state.token).toBe('mock-token-u1')
    expect(state.isAuthenticated).toBe(true)
  })

  it('S8 keeps the user empty when an update arrives after logout and stores no user data', () => {
    useAuthStore.getState().logout()

    useAuthStore.getState().updateUser({ name: 'New Name' })

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAuthenticated).toBe(false)
    const stored = localStorage.getItem(STORAGE_KEY) ?? ''
    expect(stored).not.toContain(user.email)
    expect(stored).not.toContain('New Name')
  })
})
