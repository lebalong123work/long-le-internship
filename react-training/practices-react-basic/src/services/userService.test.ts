import { afterEach, describe, expect, it, vi } from 'vitest'
import { callBody, callInit, callUrl, catchError, mockFetch } from '@/test/mockFetch'
import { changePassword, getProfile, updateProfile, USER_ERRORS } from './userService'

const record = {
  id: 'u1',
  email: 'user@store.com',
  password: 'user123',
  name: 'Test Customer',
  role: 'customer',
  phone: '0912345678',
}

const profile = {
  id: 'u1',
  email: 'user@store.com',
  name: 'Test Customer',
  role: 'customer',
  phone: '0912345678',
}

function mockNetworkFailure() {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getProfile', () => {
  it('returns the profile without the password', async () => {
    const fetchMock = mockFetch({ body: record })
    const result = await getProfile('u1')

    expect(result).toEqual(profile)
    expect(result).not.toHaveProperty('password')
    expect(callUrl(fetchMock, 0).pathname).toBe('/users/u1')
    expect(callInit(fetchMock, 0).method).toBe('GET')
  })

  it('throws 404 "User not found" for an unknown user', async () => {
    mockFetch({ body: {}, status: 404 })
    const error = await catchError(getProfile('xyz'))
    expect(error.status).toBe(404)
    expect(error.message).toBe(USER_ERRORS.notFound)
  })

  it('passes a network error from reading the profile through unchanged', async () => {
    mockNetworkFailure()
    const error = await catchError(getProfile('u1'))
    expect(error.status).toBe(0)
  })

  it('passes a server error from reading the profile through unchanged', async () => {
    mockFetch({ body: {}, status: 500 })
    const error = await catchError(getProfile('u1'))
    expect(error.status).toBe(500)
    expect(error.message).not.toBe(USER_ERRORS.notFound)
  })
})

describe('updateProfile', () => {
  it('sends only the profile fields with PATCH /users/<id>', async () => {
    const fetchMock = mockFetch({ body: record })
    await updateProfile('u1', {
      name: 'New Name',
      phone: '0987654321',
      address: '1 Main St',
      birthDate: '2000-01-31',
      avatar: 'data:image/png;base64,AAA',
    })

    expect(callUrl(fetchMock, 0).pathname).toBe('/users/u1')
    expect(callInit(fetchMock, 0).method).toBe('PATCH')
    expect(callBody(fetchMock, 0)).toEqual({
      name: 'New Name',
      phone: '0987654321',
      address: '1 Main St',
      birthDate: '2000-01-31',
      avatar: 'data:image/png;base64,AAA',
    })
  })

  it('never sends email, password, id or role even when they are passed in', async () => {
    const fetchMock = mockFetch({ body: record })
    const data = {
      name: 'New Name',
      email: 'other@store.com',
      password: 'hacked1',
      id: 'u2',
      role: 'admin',
    }
    await updateProfile('u1', data)

    expect(callBody(fetchMock, 0)).toEqual({ name: 'New Name' })
  })

  it('sends an empty string to clear a field', async () => {
    const fetchMock = mockFetch({ body: { ...record, phone: '' } })
    await updateProfile('u1', { phone: '' })
    expect(callBody(fetchMock, 0)).toEqual({ phone: '' })
  })

  it('leaves out fields that are not given', async () => {
    const fetchMock = mockFetch({ body: record })
    await updateProfile('u1', { address: '1 Main St', phone: undefined })
    expect(callBody(fetchMock, 0)).toEqual({ address: '1 Main St' })
  })

  it('returns the updated user without the password', async () => {
    mockFetch({ body: { ...record, name: 'New Name' } })
    const result = await updateProfile('u1', { name: 'New Name' })
    expect(result).toEqual({ ...profile, name: 'New Name' })
    expect(result).not.toHaveProperty('password')
  })

  it('throws 404 "User not found" when updating an unknown user', async () => {
    const fetchMock = mockFetch({ body: {}, status: 404 })
    const error = await catchError(updateProfile('xyz', { name: 'New Name' }))
    expect(error.status).toBe(404)
    expect(error.message).toBe(USER_ERRORS.notFound)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('passes a network error from updating through unchanged', async () => {
    mockNetworkFailure()
    const error = await catchError(updateProfile('u1', { name: 'New Name' }))
    expect(error.status).toBe(0)
  })

  it('passes a server error from updating through unchanged', async () => {
    mockFetch({ body: {}, status: 500 })
    const error = await catchError(updateProfile('u1', { name: 'New Name' }))
    expect(error.status).toBe(500)
    expect(error.message).not.toBe(USER_ERRORS.notFound)
  })
})

describe('changePassword', () => {
  it('saves only the new password when the current one matches', async () => {
    const fetchMock = mockFetch({ body: record }, { body: { ...record, password: 'new123' } })
    const result = await changePassword('u1', {
      currentPassword: 'user123',
      newPassword: 'new123',
    })

    expect(result).toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(callUrl(fetchMock, 0).pathname).toBe('/users/u1')
    expect(callInit(fetchMock, 0).method).toBe('GET')
    expect(callUrl(fetchMock, 1).pathname).toBe('/users/u1')
    expect(callInit(fetchMock, 1).method).toBe('PATCH')
    expect(callBody(fetchMock, 1)).toEqual({ password: 'new123' })
  })

  it('throws 400 "Current password is incorrect" and sends no PATCH', async () => {
    const fetchMock = mockFetch({ body: record })
    const error = await catchError(
      changePassword('u1', { currentPassword: 'wrong1', newPassword: 'new123' })
    )
    expect(error.status).toBe(400)
    expect(error.message).toBe(USER_ERRORS.wrongCurrentPassword)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('accepts a current password with spaces when it matches exactly', async () => {
    const fetchMock = mockFetch(
      { body: { ...record, password: ' pass 123 ' } },
      { body: { ...record, password: 'new123' } }
    )
    await changePassword('u1', { currentPassword: ' pass 123 ', newPassword: 'new123' })
    expect(callBody(fetchMock, 1)).toEqual({ password: 'new123' })
  })

  it.each(['USER123', ' user123', 'user123 '])(
    'rejects a current password that differs only in case or spaces (%j)',
    async (currentPassword) => {
      const fetchMock = mockFetch({ body: record })
      const error = await catchError(
        changePassword('u1', { currentPassword, newPassword: 'new123' })
      )
      expect(error.status).toBe(400)
      expect(error.message).toBe(USER_ERRORS.wrongCurrentPassword)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    }
  )

  it('throws 404 "User not found" for an unknown user and sends no PATCH', async () => {
    const fetchMock = mockFetch({ body: {}, status: 404 })
    const error = await catchError(
      changePassword('xyz', { currentPassword: 'user123', newPassword: 'new123' })
    )
    expect(error.status).toBe(404)
    expect(error.message).toBe(USER_ERRORS.notFound)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws 404 "User not found" when the user is gone before saving', async () => {
    mockFetch({ body: record }, { body: {}, status: 404 })
    const error = await catchError(
      changePassword('u1', { currentPassword: 'user123', newPassword: 'new123' })
    )
    expect(error.status).toBe(404)
    expect(error.message).toBe(USER_ERRORS.notFound)
  })

  it('passes a network error from changing the password through unchanged', async () => {
    const fetchMock = mockNetworkFailure()
    const error = await catchError(
      changePassword('u1', { currentPassword: 'user123', newPassword: 'new123' })
    )
    expect(error.status).toBe(0)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('passes a server error from saving the password through unchanged', async () => {
    mockFetch({ body: record }, { body: {}, status: 500 })
    const error = await catchError(
      changePassword('u1', { currentPassword: 'user123', newPassword: 'new123' })
    )
    expect(error.status).toBe(500)
    expect(error.message).not.toBe(USER_ERRORS.notFound)
  })

  it('accepts a new password that differs from the current one only in case', async () => {
    const fetchMock = mockFetch({ body: record }, { body: { ...record, password: 'USER123' } })
    await changePassword('u1', { currentPassword: 'user123', newPassword: 'USER123' })
    expect(callBody(fetchMock, 1)).toEqual({ password: 'USER123' })
  })

  it('throws 400 "New password must be different from the current password" and sends no PATCH', async () => {
    const fetchMock = mockFetch({ body: record })
    const error = await catchError(
      changePassword('u1', { currentPassword: 'user123', newPassword: 'user123' })
    )
    expect(error.status).toBe(400)
    expect(error.message).toBe(USER_ERRORS.samePassword)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
