import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { queryKeys } from '@/constants/queryKeys'
import { ApiError } from '@/services/apiClient'
import * as productService from '@/services/productService'
import { product } from '@/test/fixtures'
import { SameProductSection } from './SameProductSection'
import type { Product } from '@/types'

vi.mock('@/services/productService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/productService')>()),
  getRelated: vi.fn(),
}))

const CURRENT: Product = { ...product('p1'), category: 't-shirt' }
const RELATED: Product[] = Array.from({ length: 8 }, (_, index) => ({
  ...product(`p${index + 2}`),
  name: `Tee ${index + 2}`,
}))

function renderSection(item: Product = CURRENT, queryClient = newClient()) {
  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SameProductSection product={item} />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { ...view, queryClient }
}

function newClient(): QueryClient {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } })
}

function section(): HTMLElement {
  return screen.getByRole('region', { name: PRODUCT_DETAIL_TEXT.sameProduct })
}

function seeMore(): HTMLElement {
  return screen.getByRole('link', { name: PRODUCT_DETAIL_TEXT.seeMore })
}

afterEach(() => {
  vi.mocked(productService.getRelated).mockReset()
})

describe('SameProductSection', () => {
  it('shows the Same Product heading and one card per related product', async () => {
    vi.mocked(productService.getRelated).mockResolvedValue(RELATED)
    renderSection()
    expect(await within(section()).findAllByRole('listitem')).toHaveLength(8)
    expect(
      screen.getByRole('heading', { level: 2, name: PRODUCT_DETAIL_TEXT.sameProduct })
    ).toBeInTheDocument()
  })

  it('links See More to the shop filtered by the product category', async () => {
    vi.mocked(productService.getRelated).mockResolvedValue(RELATED)
    renderSection()
    expect(await screen.findByRole('link', { name: PRODUCT_DETAIL_TEXT.seeMore })).toHaveAttribute(
      'href',
      '/shop?category=t-shirt'
    )
  })

  it('links See More to the whole shop for an unknown category', async () => {
    vi.mocked(productService.getRelated).mockResolvedValue(RELATED)
    renderSection({ ...CURRENT, category: 'hats' })
    await screen.findAllByRole('listitem')
    expect(seeMore()).toHaveAttribute('href', '/shop')
  })

  it('renders nothing when there are no related products', async () => {
    vi.mocked(productService.getRelated).mockResolvedValue([])
    const { container } = renderSection()
    await waitFor(() => expect(container).toBeEmptyDOMElement())
    expect(productService.getRelated).toHaveBeenCalledTimes(1)
  })

  it('renders nothing when the first load fails', async () => {
    vi.mocked(productService.getRelated).mockRejectedValue(new ApiError(0, 'Network error'))
    const { container } = renderSection()
    await waitFor(() => expect(container).toBeEmptyDOMElement())
    expect(productService.getRelated).toHaveBeenCalledTimes(1)
  })

  it('keeps the cards when a background refetch fails', async () => {
    vi.mocked(productService.getRelated).mockResolvedValueOnce(RELATED)
    const { queryClient } = renderSection()
    await screen.findAllByRole('listitem')
    vi.mocked(productService.getRelated).mockRejectedValue(new ApiError(500, 'Server error'))
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: queryKeys.products.related('p1') })
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(queryClient.getQueryState(queryKeys.products.related('p1'))?.status).toBe('error')
    expect(within(section()).getAllByRole('listitem')).toHaveLength(8)
  })

  it('shows the heading and a busy skeleton without See More while loading', () => {
    vi.mocked(productService.getRelated).mockReturnValue(new Promise(() => undefined))
    renderSection()
    expect(within(section()).getByRole('heading', { level: 2 })).toBeInTheDocument()
    const busy = section().querySelector('[aria-busy="true"]')
    expect(busy?.querySelectorAll('.shadow-card')).toHaveLength(productService.RELATED_LIMIT)
    expect(screen.queryByRole('link', { name: PRODUCT_DETAIL_TEXT.seeMore })).toBeNull()
  })

  it('asks the service for products related to this product', async () => {
    vi.mocked(productService.getRelated).mockResolvedValue(RELATED)
    renderSection()
    await screen.findAllByRole('listitem')
    expect(productService.getRelated).toHaveBeenCalledWith(CURRENT)
  })
})
