import { vi } from 'vitest'
import type { Cart } from '@/types'

interface FakeResponse {
  ok: boolean
  status: number
  statusText: string
  text: () => Promise<string>
}

export interface CartServer {
  carts: Cart[]
  postCount: () => number
  failNextPost: () => void
  holdReads: () => void
  releaseReads: () => void
}

function reply(status: number, body?: unknown): FakeResponse {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 500 ? 'Internal Server Error' : 'OK',
    text: () => Promise.resolve(body === undefined ? '' : JSON.stringify(body)),
  }
}

function matchesFilter(cart: Cart, params: URLSearchParams): boolean {
  return [...params].every(([key, value]) => {
    const field = key.replace(/:eq$/, '') as keyof Cart
    return cart[field] === value
  })
}

export function mockCartServer(): CartServer {
  const carts: Cart[] = []
  let posts = 0
  let failPost = false
  let heldReads: (() => void)[] | null = null

  function handle(url: URL, init?: RequestInit): FakeResponse {
    const method = init?.method ?? 'GET'
    const body = init?.body ? (JSON.parse(init.body as string) as Partial<Cart>) : {}
    if (method === 'GET')
      return reply(
        200,
        carts.filter((cart) => matchesFilter(cart, url.searchParams))
      )
    if (method === 'POST') {
      posts += 1
      if (failPost) {
        failPost = false
        return reply(500)
      }
      const created: Cart = { items: [], ...body, id: `c${posts}` }
      carts.push(created)
      return reply(201, created)
    }
    const id = decodeURIComponent(url.pathname.split('/').pop() ?? '')
    const index = carts.findIndex((cart) => cart.id === id)
    if (index < 0) return reply(404)
    carts[index] = { ...carts[index], ...body }
    return reply(200, carts[index])
  }

  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init?: RequestInit) => {
      const url = new URL(input)
      if ((init?.method ?? 'GET') === 'GET' && heldReads) {
        await new Promise<void>((resolve) => heldReads?.push(resolve))
      }
      await Promise.resolve()
      return handle(url, init)
    })
  )

  return {
    carts,
    postCount: () => posts,
    failNextPost: () => {
      failPost = true
    },
    holdReads: () => {
      heldReads = []
    },
    releaseReads: () => {
      const waiting = heldReads ?? []
      heldReads = null
      for (const resolve of waiting) resolve()
    },
  }
}
