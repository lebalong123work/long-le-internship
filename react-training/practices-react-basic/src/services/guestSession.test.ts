import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const KEY = 'mcs_guest'
const VALID_ID = '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c'

type GuestSession = typeof import('./guestSession')

async function loadSession(): Promise<GuestSession> {
  vi.resetModules()
  return import('./guestSession')
}

function blockStorage(): void {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('guestSession', () => {
  it('G1 getGuestId returns a valid stored id', async () => {
    localStorage.setItem(KEY, VALID_ID)
    const { getGuestId } = await loadSession()
    expect(getGuestId()).toBe(VALID_ID)
  })

  it.each(['', 'abc', '3f2b8c1e-9a4d-1f6b-8c2a-1d5e7f9a0b3c'])(
    'G2 treats the stored value %j as absent and ensureGuestId replaces it',
    async (stored) => {
      localStorage.setItem(KEY, stored)
      const { ensureGuestId, getGuestId } = await loadSession()
      expect(getGuestId()).toBeNull()
      const id = ensureGuestId()
      expect(id).not.toBe(stored)
      expect(localStorage.getItem(KEY)).toBe(id)
    }
  )

  it('G3 ensureGuestId creates and stores an id once, then reuses it', async () => {
    const { ensureGuestId, getGuestId } = await loadSession()
    const id = ensureGuestId()
    expect(id).toMatch(/^[0-9a-f-]{36}$/)
    expect(ensureGuestId()).toBe(id)
    expect(getGuestId()).toBe(id)
    expect(localStorage.getItem(KEY)).toBe(id)
  })

  it('G4 keeps a memory-only id for the current tab when storage is blocked', async () => {
    blockStorage()
    const { ensureGuestId, getGuestId } = await loadSession()
    expect(getGuestId()).toBeNull()
    const id = ensureGuestId()
    expect(getGuestId()).toBe(id)
    expect(ensureGuestId()).toBe(id)
    vi.restoreAllMocks()
    expect(localStorage.getItem(KEY)).toBeNull()
  })

  it('G5 notifies listeners when an id is created and on a storage event for its key only', async () => {
    const { ensureGuestId, subscribeGuestId } = await loadSession()
    const listener = vi.fn()
    const unsubscribe = subscribeGuestId(listener)

    ensureGuestId()
    ensureGuestId()
    expect(listener).toHaveBeenCalledTimes(1)

    window.dispatchEvent(new StorageEvent('storage', { key: 'mcs_auth' }))
    expect(listener).toHaveBeenCalledTimes(1)
    window.dispatchEvent(new StorageEvent('storage', { key: KEY }))
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    window.dispatchEvent(new StorageEvent('storage', { key: KEY }))
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('G6 getGuestId never creates or writes an id', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const { getGuestId } = await loadSession()
    expect(getGuestId()).toBeNull()
    expect(setItem).not.toHaveBeenCalled()
  })
})
