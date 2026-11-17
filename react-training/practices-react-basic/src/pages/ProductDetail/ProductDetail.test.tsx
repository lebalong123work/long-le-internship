import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { queryKeys } from '@/constants/queryKeys'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { ApiError } from '@/services/apiClient'
import { PRODUCT_ERRORS } from '@/services/productErrors'
import * as productService from '@/services/productService'
import { product } from '@/test/fixtures'
import ProductDetail from './index'
import type { Product } from '@/types'

vi.mock('@/services/productService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/productService')>()),
  getById: vi.fn(),
  getRelated: vi.fn().mockResolvedValue([]),
}))

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve: (value: T) => void = () => undefined
  let reject: (error: unknown) => void = () => undefined
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve
    reject = onReject
  })
  return { promise, resolve, reject }
}

const P1: Product = {
  ...product('p1'),
  name: 'Tee One',
  colors: ['Black', 'Blue'],
  sizes: ['S', 'M'],
}
const P2: Product = {
  ...product('p2'),
  name: 'Tee Two',
  colors: ['Black', 'Blue'],
  sizes: ['S', 'M'],
}
const NETWORK_ERROR = new ApiError(0, 'Network error')
const SETTLE_TASKS = 3

let pending: Deferred<Product>[] = []

vi.mocked(productService.getById).mockImplementation(() => {
  const request = deferred<Product>()
  pending.push(request)
  return request.promise
})

afterEach(() => {
  pending = []
  vi.mocked(productService.getById).mockClear()
})

async function settleQueries(): Promise<void> {
  for (let task = 0; task < SETTLE_TASKS; task += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0))
  }
}

async function answerAll(answer: Product | Error): Promise<void> {
  await act(async () => {
    while (pending.length > 0) {
      const requests = pending
      pending = []
      for (const request of requests) {
        if (answer instanceof Error) request.reject(answer)
        else request.resolve(answer)
      }
      await settleQueries()
    }
  })
}

function renderPage(path = '/shop/p1') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 } },
  })
  const router = createMemoryRouter(
    [
      { path: '/shop/:productId', element: <ProductDetail /> },
      { path: '/shop', element: <ProductDetail /> },
      { path: '/', element: <p>Home page</p> },
    ],
    { initialEntries: [path] }
  )
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
  return { ...view, queryClient, router, user: userEvent.setup() }
}

async function openProduct(
  router: ReturnType<typeof createMemoryRouter>,
  id: string
): Promise<void> {
  await act(async () => {
    await router.navigate(`/shop/${id}`)
  })
}

function tryAgain(): HTMLElement {
  return screen.getByRole('button', { name: UI_STATE_MESSAGES.retry })
}

function statusText(): string {
  return screen.getByRole('status').textContent ?? ''
}

function busySkeleton(container: HTMLElement): Element | null {
  return container.querySelector('[aria-busy="true"]:not(button)')
}

function heading(): HTMLElement {
  return screen.getByRole('heading', { level: 1 })
}

describe('ProductDetail page', () => {
  it('shows the busy skeleton and Loading product', () => {
    const { container } = renderPage()
    expect(busySkeleton(container)).toBeInTheDocument()
    expect(statusText()).toBe(PRODUCT_DETAIL_TEXT.loading)
    expect(productService.getById).toHaveBeenCalledWith('p1')
  })

  it('renders the product and empties the status', async () => {
    const { container } = renderPage()
    await answerAll(P1)
    await act(settleQueries)
    expect(heading()).toHaveTextContent('Tee One')
    expect(busySkeleton(container)).toBeNull()
    expect(statusText()).toBe('')
  })

  it('shows Product not found with Back to Home and does not retry', async () => {
    renderPage('/shop/unknown')
    await answerAll(new ApiError(404, PRODUCT_ERRORS.notFound))
    expect(screen.getByText(UI_STATE_MESSAGES.productNotFound)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: UI_STATE_MESSAGES.backToHome })).toHaveAttribute(
      'href',
      '/'
    )
    expect(productService.getById).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument()
  })

  it('shows ErrorState after a network error', async () => {
    renderPage()
    await answerAll(NETWORK_ERROR)
    expect(screen.getByRole('alert')).toHaveTextContent(UI_STATE_MESSAGES.errorDefault)
    expect(tryAgain()).not.toHaveAttribute('aria-busy')
    expect(productService.getById).toHaveBeenCalledTimes(4)
  })

  it('shows ErrorState for invalid product data', async () => {
    renderPage()
    await answerAll(new ApiError(502, PRODUCT_ERRORS.invalidData))
    expect(tryAgain()).toBeInTheDocument()
    expect(screen.queryByText(UI_STATE_MESSAGES.productNotFound)).not.toBeInTheDocument()
  })

  it('keeps ErrorState busy while retrying', async () => {
    const { user } = renderPage()
    await answerAll(NETWORK_ERROR)
    await user.click(tryAgain())
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
    await user.click(tryAgain())
    expect(productService.getById).toHaveBeenCalledTimes(5)
  })

  it('keeps ErrorState instead of the skeleton while the retried query is pending', async () => {
    const { user, container, queryClient } = renderPage()
    await answerAll(NETWORK_ERROR)
    await user.click(tryAgain())
    expect(queryClient.getQueryState(queryKeys.products.detail('p1'))?.status).toBe('pending')
    expect(tryAgain()).toHaveAttribute('aria-busy', 'true')
    expect(busySkeleton(container)).toBeNull()
    expect(statusText()).toBe('')
  })

  it('focuses the heading after a successful retry', async () => {
    const { user } = renderPage()
    await answerAll(NETWORK_ERROR)
    await user.click(tryAgain())
    await answerAll(P1)
    expect(heading()).toHaveFocus()
    expect(heading()).toHaveAttribute('data-script-focus', 'true')
  })

  it('keeps ErrorState and focus on Try again when the retry fails', async () => {
    const { user } = renderPage()
    await answerAll(NETWORK_ERROR)
    const button = tryAgain()
    await user.click(button)
    await answerAll(NETWORK_ERROR)
    expect(tryAgain()).toBe(button)
    expect(button).toHaveFocus()
    expect(button).not.toHaveAttribute('aria-busy')
  })

  it('keeps the product when a background refetch fails', async () => {
    const { queryClient } = renderPage()
    await answerAll(P1)
    await act(async () => {
      void queryClient.refetchQueries({ queryKey: queryKeys.products.detail('p1') })
      await settleQueries()
    })
    await answerAll(NETWORK_ERROR)
    expect(queryClient.getQueryState(queryKeys.products.detail('p1'))?.status).toBe('error')
    expect(heading()).toHaveTextContent('Tee One')
    expect(screen.queryByRole('button', { name: UI_STATE_MESSAGES.retry })).not.toBeInTheDocument()
  })

  it('resets color, size and quantity when another product opens', async () => {
    const { user, router } = renderPage('/shop/p2')
    await answerAll(P2)
    await openProduct(router, 'p1')
    await answerAll(P1)
    await user.click(screen.getByRole('radio', { name: 'Blue' }))
    await user.click(screen.getByRole('radio', { name: 'M' }))
    await user.click(screen.getByRole('button', { name: 'Increase quantity' }))
    await openProduct(router, 'p2')
    await answerAll(P2)
    expect(heading()).toHaveTextContent('Tee Two')
    expect(screen.getByRole('radio', { name: 'Blue' })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'S' })).toBeChecked()
    expect(screen.getByRole('group', { name: 'Quantity of Tee Two' })).toHaveTextContent('1')
  })

  it('never moves focus to another product after an old retry finishes', async () => {
    const { user, router } = renderPage()
    await answerAll(NETWORK_ERROR)
    await user.click(tryAgain())
    const oldRetry = pending
    pending = []
    await openProduct(router, 'p2')
    await answerAll(P2)
    await act(async () => {
      for (const request of oldRetry) request.resolve(P1)
      await settleQueries()
    })
    expect(heading()).toHaveTextContent('Tee Two')
    expect(heading()).not.toHaveFocus()
  })

  it('does not refocus the heading when the product opens again later', async () => {
    const { user, router } = renderPage()
    await answerAll(NETWORK_ERROR)
    await user.click(tryAgain())
    await answerAll(P1)
    heading().blur()
    await openProduct(router, 'p2')
    await answerAll(P2)
    await openProduct(router, 'p1')
    expect(heading()).toHaveTextContent('Tee One')
    expect(heading()).not.toHaveFocus()
  })

  it('shows Same Product below the product', async () => {
    vi.mocked(productService.getRelated).mockResolvedValueOnce([P2])
    renderPage()
    await answerAll(P1)
    const section = await screen.findByRole('region', { name: PRODUCT_DETAIL_TEXT.sameProduct })
    expect(within(section).getByRole('link', { name: 'Tee Two' })).toBeInTheDocument()
    expect(productService.getRelated).toHaveBeenCalledWith(P1)
  })

  it('shows Product not found without a productId', () => {
    renderPage('/shop')
    expect(screen.getByText(UI_STATE_MESSAGES.productNotFound)).toBeInTheDocument()
    expect(productService.getById).not.toHaveBeenCalled()
  })
})
