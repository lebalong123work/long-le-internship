import { afterEach, describe, expect, it, vi } from 'vitest'
import { callInit, callUrl, catchError, mockFetch } from '@/test/mockFetch'
import { AUTH_ERRORS, login, register } from './authService'

const seedRecord = {
  id: 'u1',
  email: 'user@store.com',
  password: 'user123',
  name: 'Test Customer',
  role: 'customer',
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('login', () => {
  it('returns the user without password and a mock token for the seed user', async () => {
    const fetchMock = mockFetch({ body: [seedRecord] })
    const result = await login({ email: 'user@store.com', password: 'user123' })

    expect(result.token).toBe('mock-token-u1')
    expect(result.user).toEqual({
      id: 'u1',
      email: 'user@store.com',
      name: 'Test Customer',
      role: 'customer',
    })
    expect(result.user).not.toHaveProperty('password')

    const url = callUrl(fetchMock, 0)
    expect(url.pathname).toBe('/users')
    expect(url.searchParams.get('email:eq')).toBe('user@store.com')
  })

  it('trims and lower-cases the email before the lookup', async () => {
    const fetchMock = mockFetch({ body: [seedRecord] })
    await login({ email: '  User@Store.COM ', password: 'user123' })
    expect(callUrl(fetchMock, 0).searchParams.get('email:eq')).toBe('user@store.com')
  })

  it('throws 401 "Incorrect password" for a wrong password', async () => {
    mockFetch({ body: [seedRecord] })
    const error = await catchError(login({ email: 'user@store.com', password: 'wrong1' }))
    expect(error.status).toBe(401)
    expect(error.message).toBe(AUTH_ERRORS.wrongPassword)
  })

  it('throws 404 "No account with this email" for an unknown email', async () => {
    mockFetch({ body: [] })
    const error = await catchError(login({ email: 'nobody@store.com', password: 'user123' }))
    expect(error.status).toBe(404)
    expect(error.message).toBe(AUTH_ERRORS.emailNotFound)
  })

  it('passes a network error through unchanged', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const error = await catchError(login({ email: 'user@store.com', password: 'user123' }))
    expect(error.status).toBe(0)
  })

  it('passes a server error through unchanged', async () => {
    mockFetch({ body: {}, status: 500 })
    const error = await catchError(login({ email: 'user@store.com', password: 'user123' }))
    expect(error.status).toBe(500)
  })
})

describe('register', () => {
  it('throws 409 "Email already exists" and sends no POST when the email is taken', async () => {
    const fetchMock = mockFetch({ body: [seedRecord] })
    const error = await catchError(
      register({ name: 'Other', email: 'USER@store.com', password: 'secret1' })
    )
    expect(error.status).toBe(409)
    expect(error.message).toBe(AUTH_ERRORS.emailExists)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(callUrl(fetchMock, 0).searchParams.get('email:eq')).toBe('user@store.com')
  })

  it('creates a customer and returns the login result without password', async () => {
    const created = {
      id: 'a1b2',
      name: 'New Customer',
      email: 'new@store.com',
      password: 'secret1',
      role: 'customer',
    }
    const fetchMock = mockFetch({ body: [] }, { body: created, status: 201 })

    const result = await register({
      name: 'New Customer',
      email: ' New@Store.com',
      password: 'secret1',
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(callUrl(fetchMock, 1).pathname).toBe('/users')
    const init = callInit(fetchMock, 1)
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({
      name: 'New Customer',
      email: 'new@store.com',
      password: 'secret1',
      role: 'customer',
    })

    expect(result.token).toBe('mock-token-a1b2')
    expect(result.user).toEqual({
      id: 'a1b2',
      name: 'New Customer',
      email: 'new@store.com',
      role: 'customer',
    })
    expect(result.user).not.toHaveProperty('password')
  })

  it('passes a network error through unchanged', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const error = await catchError(
      register({ name: 'New', email: 'new@store.com', password: 'secret1' })
    )
    expect(error.status).toBe(0)
  })
})
