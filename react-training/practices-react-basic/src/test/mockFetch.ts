import { vi } from 'vitest'
import { ApiError } from '@/services/apiClient'

export interface MockResponse {
  body?: unknown
  status?: number
}

function response({ body, status = 200 }: MockResponse) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 500 ? 'Internal Server Error' : 'OK',
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  }
}

export function mockFetch(...responses: MockResponse[]) {
  const fetchMock = vi.fn()
  for (const r of responses) fetchMock.mockResolvedValueOnce(response(r))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function mockRoutes(routes: Record<string, MockResponse>) {
  const fetchMock = vi.fn((input: string) => {
    const route = routes[new URL(input).pathname]
    return Promise.resolve(response(route ?? { status: 404 }))
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function mockNetworkFailure() {
  const fetchMock = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

export function callUrl(fetchMock: ReturnType<typeof vi.fn>, index: number): URL {
  return new URL(fetchMock.mock.calls[index][0] as string)
}

export function callInit(fetchMock: ReturnType<typeof vi.fn>, index: number): RequestInit {
  return fetchMock.mock.calls[index][1] as RequestInit
}

export function callBody(fetchMock: ReturnType<typeof vi.fn>, index: number): unknown {
  return JSON.parse(callInit(fetchMock, index).body as string)
}

export async function catchError(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (error) {
    if (error instanceof ApiError) return error
    throw error
  }
  throw new Error('expected an ApiError')
}
