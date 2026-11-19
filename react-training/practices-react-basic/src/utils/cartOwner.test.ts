import { describe, expect, it } from 'vitest'
import {
  belongsTo,
  CART_OWNER_REQUIRED,
  ownerFields,
  ownerKey,
  requireCartOwner,
} from './cartOwner'
import type { CartOwner } from '@/types'

const USER: CartOwner = { kind: 'user', id: 'u1' }
const GUEST: CartOwner = { kind: 'guest', id: 'g1' }

describe('cartOwner', () => {
  it('O1 ownerKey separates user and guest owners', () => {
    expect(ownerKey(USER)).toBe('user:u1')
    expect(ownerKey(GUEST)).toBe('guest:g1')
  })

  it('O2 ownerFields returns exactly one owner field', () => {
    expect(ownerFields(USER)).toEqual({ userId: 'u1' })
    expect(ownerFields(GUEST)).toEqual({ guestId: 'g1' })
  })

  it('O3 belongsTo is true only for the owner field of the same id', () => {
    expect(belongsTo({ userId: 'u1' }, USER)).toBe(true)
    expect(belongsTo({ guestId: 'g1' }, GUEST)).toBe(true)
  })

  it('O3 belongsTo is false for another id', () => {
    expect(belongsTo({ userId: 'u2' }, USER)).toBe(false)
    expect(belongsTo({ guestId: 'g2' }, GUEST)).toBe(false)
  })

  it('O3 belongsTo never falls back to the other owner field', () => {
    expect(belongsTo({ guestId: 'u1' }, USER)).toBe(false)
    expect(belongsTo({ userId: 'g1' }, GUEST)).toBe(false)
    expect(belongsTo({ userId: 'u1', guestId: 'g9' }, GUEST)).toBe(false)
  })

  it('O4 requireCartOwner returns the owner', () => {
    expect(requireCartOwner(GUEST)).toBe(GUEST)
  })

  it('O4 requireCartOwner throws without an owner', () => {
    expect(() => requireCartOwner(null)).toThrow(CART_OWNER_REQUIRED)
  })
})
