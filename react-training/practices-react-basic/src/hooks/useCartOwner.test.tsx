import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ensureGuestId } from '@/services/guestSession'
import { useAuthStore } from '@/stores/authStore'
import { useCartOwner } from './useCartOwner'
import type { User } from '@/types'

const GUEST_ID = '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c'
const OTHER_GUEST_ID = '9c1d2e3f-4a5b-4c6d-8e7f-0a1b2c3d4e5f'
const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('useCartOwner', () => {
  it('H1 returns the user owner even when a guest id is stored', () => {
    localStorage.setItem('mcs_guest', GUEST_ID)
    useAuthStore.setState({ user, token: 't', isAuthenticated: true })
    const { result } = renderHook(() => useCartOwner())
    expect(result.current).toEqual({ kind: 'user', id: 'u1' })
  })

  it('H2 returns the guest owner for a guest with an id', () => {
    localStorage.setItem('mcs_guest', GUEST_ID)
    const { result } = renderHook(() => useCartOwner())
    expect(result.current).toEqual({ kind: 'guest', id: GUEST_ID })
  })

  it('H3 returns null and creates no id for a guest without one', () => {
    const { result } = renderHook(() => useCartOwner())
    expect(result.current).toBeNull()
    expect(localStorage.getItem('mcs_guest')).toBeNull()
  })

  it('H4 updates after an id is created or changed in another tab', () => {
    const { result } = renderHook(() => useCartOwner())

    let id = ''
    act(() => {
      id = ensureGuestId()
    })
    expect(result.current).toEqual({ kind: 'guest', id })

    act(() => {
      localStorage.setItem('mcs_guest', OTHER_GUEST_ID)
      window.dispatchEvent(new StorageEvent('storage', { key: 'mcs_guest' }))
    })
    expect(result.current).toEqual({ kind: 'guest', id: OTHER_GUEST_ID })
  })
})
