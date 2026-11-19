import type { CartOwner } from '@/types'

export const CART_OWNER_REQUIRED = 'Cart owner required'

type OwnerFields = { userId: string } | { guestId: string }

interface OwnedRecord {
  userId?: string
  guestId?: string
}

export function ownerKey(owner: CartOwner): string {
  return `${owner.kind}:${owner.id}`
}

export function ownerFields(owner: CartOwner): OwnerFields {
  return owner.kind === 'user' ? { userId: owner.id } : { guestId: owner.id }
}

export function belongsTo(record: OwnedRecord, owner: CartOwner): boolean {
  const recordOwnerId = owner.kind === 'user' ? record.userId : record.guestId
  return recordOwnerId === owner.id
}

export function requireCartOwner(owner: CartOwner | null): CartOwner {
  if (!owner) throw new Error(CART_OWNER_REQUIRED)
  return owner
}
