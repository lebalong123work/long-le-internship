const GUEST_ID_KEY = 'mcs_guest'
const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const listeners = new Set<() => void>()
let memoryId: string | null = null

function isGuestId(value: string | null): value is string {
  return value !== null && UUID_V4.test(value)
}

function readStoredId(): string | null {
  try {
    return localStorage.getItem(GUEST_ID_KEY)
  } catch {
    return null
  }
}

function storeId(id: string): boolean {
  try {
    localStorage.setItem(GUEST_ID_KEY, id)
    return true
  } catch {
    return false
  }
}

function notifyListeners(): void {
  for (const listener of listeners) listener()
}

export function getGuestId(): string | null {
  const stored = readStoredId()
  if (isGuestId(stored)) return stored
  return isGuestId(memoryId) ? memoryId : null
}

export function ensureGuestId(): string {
  const existing = getGuestId()
  if (existing) return existing
  const id = crypto.randomUUID()
  if (!storeId(id)) memoryId = id
  notifyListeners()
  return id
}

export function subscribeGuestId(listener: () => void): () => void {
  function onStorage(event: StorageEvent): void {
    if (event.key === GUEST_ID_KEY || event.key === null) listener()
  }
  listeners.add(listener)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', onStorage)
  }
}
