import { useAuthStore } from '@/stores/authStore'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}
export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 0
}

type QueryValue = string | number | boolean | undefined
export type Query = Record<string, QueryValue>

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'
const DELAY_MS = import.meta.env.DEV ? Number(import.meta.env.VITE_API_DELAY_MS ?? 0) : 0

function buildUrl(path: string, query?: Query): string {
  const url = new URL(path, BASE_URL)
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }
  return url.toString()
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function request<T>(method: string, path: string, body?: unknown, query?: Query): Promise<T> {
  if (DELAY_MS > 0) await wait(DELAY_MS)

  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const token = useAuthStore.getState().token
  if (token) headers.Authorization = `Bearer ${token}`

  let response: Response
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'Network error')
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      response.statusText || `Request failed (${response.status})`
    )
  }

  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

export const apiClient = {
  get: <T>(path: string, query?: Query) => request<T>('GET', path, undefined, query),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  delete: (path: string) => request<void>('DELETE', path),
}
