import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient, ApiError, isNotFoundError } from './apiClient'
import { useAuthStore } from '@/stores/authStore'

interface FakeResponse {
  ok?: boolean
  status?: number
  statusText?: string
  body?: string
}

function mockFetch(response: FakeResponse) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: response.ok ?? true,
    status: response.status ?? 200,
    statusText: response.statusText ?? 'OK',
    text: () => Promise.resolve(response.body ?? ''),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('apiClient', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('builds the URL with query params and skips undefined values', async () => {
    const fetchMock = mockFetch({ body: '[]' })
    await apiClient.get('/products', { 'name:contains': 'shirt', _page: 1, category: undefined })
    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.pathname).toBe('/products')
    expect(url.searchParams.get('name:contains')).toBe('shirt')
    expect(url.searchParams.get('_page')).toBe('1')
    expect(url.searchParams.has('category')).toBe(false)
  })

  it('parses JSON responses', async () => {
    mockFetch({ body: '{"id":"u1"}' })
    await expect(apiClient.get('/users/u1')).resolves.toEqual({ id: 'u1' })
  })

  it('sends a JSON body and the auth header when logged in', async () => {
    useAuthStore.setState({ token: 'mock-token-u1' })
    const fetchMock = mockFetch({ status: 201, body: '{"id":"o1"}' })
    await apiClient.post('/orders', { total: 40 })
    const init = fetchMock.mock.calls[0][1] as RequestInit
    const headers = init.headers as Record<string, string>
    expect(init.method).toBe('POST')
    expect(init.body).toBe('{"total":40}')
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers.Authorization).toBe('Bearer mock-token-u1')
  })

  it('throws ApiError with the status for non-2xx responses', async () => {
    mockFetch({ ok: false, status: 404, statusText: 'Not Found' })
    const error = await apiClient.get('/orders/x').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(404)
  })

  it('throws ApiError with status 0 on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
    const error = await apiClient.get('/products').catch((e: unknown) => e)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).status).toBe(0)
  })
})

describe('isNotFoundError', () => {
  it('is true only for an ApiError with status 404', () => {
    expect(isNotFoundError(new ApiError(404, 'Not Found'))).toBe(true)
    expect(isNotFoundError(new ApiError(500, 'Server error'))).toBe(false)
  })

  it('is false for non-ApiError values', () => {
    expect(isNotFoundError(new Error('404'))).toBe(false)
    expect(isNotFoundError({ status: 404 })).toBe(false)
    expect(isNotFoundError(undefined)).toBe(false)
  })
})
