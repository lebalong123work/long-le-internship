import { describe, expect, it } from 'vitest'
import { toProfileFormValues, toUpdateProfileDto } from './profileFormValues'
import type { ProfileFormValues } from '@/schemas/profile'
import type { User } from '@/types'

const BASE_USER: User = {
  id: 'u1',
  email: 'user@store.com',
  name: 'Test Customer',
  role: 'customer',
}
const FULL_USER: User = {
  ...BASE_USER,
  phone: '0912345678',
  address: '1 Main Street',
  birthDate: '2000-01-31',
  avatar: 'data:image/png;base64,AAAA',
}
const VALUES: ProfileFormValues = {
  name: 'New Name',
  phone: '',
  address: '2 Side Street',
  birthDate: '',
  avatar: 'data:image/png;base64,BBBB',
}

describe('toProfileFormValues', () => {
  it('V1 copies every profile field', () => {
    expect(toProfileFormValues(FULL_USER)).toEqual({
      name: 'Test Customer',
      phone: '0912345678',
      address: '1 Main Street',
      birthDate: '2000-01-31',
      avatar: 'data:image/png;base64,AAAA',
    })
  })

  it('V1 turns missing optional fields into empty strings', () => {
    expect(toProfileFormValues(BASE_USER)).toEqual({
      name: 'Test Customer',
      phone: '',
      address: '',
      birthDate: '',
      avatar: '',
    })
  })
})

describe('toUpdateProfileDto', () => {
  it('V2 includes the avatar when it changed', () => {
    expect(toUpdateProfileDto(VALUES, true)).toEqual({
      name: 'New Name',
      phone: '',
      address: '2 Side Street',
      birthDate: '',
      avatar: 'data:image/png;base64,BBBB',
    })
  })

  it('V2 leaves the avatar out when it did not change', () => {
    expect(toUpdateProfileDto(VALUES, false)).not.toHaveProperty('avatar')
  })

  it('V2 sends empty strings so cleared fields are cleared', () => {
    const dto = toUpdateProfileDto(VALUES, false)
    expect(dto.phone).toBe('')
    expect(dto.birthDate).toBe('')
  })

  it('V3 sends only the editable profile keys', () => {
    expect(Object.keys(toUpdateProfileDto(VALUES, true)).sort()).toEqual([
      'address',
      'avatar',
      'birthDate',
      'name',
      'phone',
    ])
  })
})
