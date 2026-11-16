import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BEST_SELLER_TEXT } from '@/constants/bestSeller'
import { HERO_TEXT } from '@/constants/hero'
import { useWishlist } from '@/hooks/useWishlist'
import * as productService from '@/services/productService'
import Home from './index'

vi.mock('@/services/productService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/productService')>()),
  getBestSellers: vi.fn(),
}))
vi.mock('@/hooks/useWishlist')

function renderHome() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.mocked(productService.getBestSellers).mockResolvedValue([])
  vi.mocked(useWishlist).mockReturnValue({
    productIds: [],
    isInWishlist: () => false,
    toggle: vi.fn(),
    isLoaded: true,
  })
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('Home page', () => {
  it('Home page shows the hero banner', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 1, name: HERO_TEXT.title })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: HERO_TEXT.carouselLabel })).toBeInTheDocument()
  })

  it('Home page shows the Best Seller section after the hero', () => {
    renderHome()
    const hero = screen.getByRole('region', { name: HERO_TEXT.title })
    const bestSeller = screen.getByRole('region', { name: BEST_SELLER_TEXT.title })
    expect(hero.compareDocumentPosition(bestSeller) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('Home page has exactly one h1', () => {
    renderHome()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })
})
