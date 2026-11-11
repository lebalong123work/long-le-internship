import { describe, expect, it } from 'vitest'
import { LOGIN_REQUIRED, requireUserId } from './requireUserId'

describe('requireUserId', () => {
  it('returns the user id when it is set', () => {
    expect(requireUserId('u1')).toBe('u1')
  })

  it("throws 'Login required' when the user id is missing", () => {
    expect(() => requireUserId(undefined)).toThrow(LOGIN_REQUIRED)
    expect(LOGIN_REQUIRED).toBe('Login required')
  })
})
