import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useWishlist } from '@/hooks/useWishlist'
import { product } from '@/test/fixtures'
import { ProductGrid, ProductGridSkeleton } from './ProductGrid'
import type { ReactElement } from 'react'

vi.mock('@/hooks/useWishlist')

const COLUMN_CLASSES = [
  'grid-cols-[repeat(2,minmax(0,theme(maxWidth.card)))]',
  'md:grid-cols-[repeat(3,minmax(0,theme(maxWidth.card)))]',
  'xl:grid-cols-[repeat(4,minmax(0,theme(maxWidth.card)))]',
]

function renderInRouter(element: ReactElement) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

function skeletonGrid(container: HTMLElement): HTMLElement {
  const grid = container.querySelector('[aria-hidden="true"]')
  if (!(grid instanceof HTMLElement)) throw new Error('skeleton grid not rendered')
  return grid
}

beforeEach(() => {
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

describe('ProductGrid', () => {
  it('renders one list item per product in order', () => {
    const products = [
      { ...product('p1'), name: 'First' },
      { ...product('p2'), name: 'Second' },
      { ...product('p3'), name: 'Third' },
    ]
    renderInRouter(<ProductGrid products={products} />)
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items.map((item) => within(item).getByRole('heading').textContent)).toEqual([
      'First',
      'Second',
      'Third',
    ])
  })

  it('renders nothing for an empty product list', () => {
    const { container } = renderInRouter(<ProductGrid products={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('uses 2 / 3 / 4 columns capped at the card width with gaps 16 / 24 / 40', () => {
    renderInRouter(<ProductGrid products={[product('p1')]} />)
    expect(screen.getByRole('list')).toHaveClass(
      'grid',
      'justify-center',
      'gap-4',
      'md:gap-6',
      'xl:gap-10',
      ...COLUMN_CLASSES
    )
  })

  it('renders the actions from renderActions inside each card', () => {
    const products = [product('p1'), product('p2')]
    renderInRouter(
      <ProductGrid
        products={products}
        renderActions={(item) => <button type="button">{`Act ${item.id}`}</button>}
      />
    )
    const items = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(within(items[0]).getByRole('button', { name: 'Act p1' })).toBeInTheDocument()
    expect(within(items[1]).getByRole('button', { name: 'Act p2' })).toBeInTheDocument()
  })

  it('a conflicting caller class replaces the default', () => {
    renderInRouter(<ProductGrid products={[product('p1')]} className="gap-2" />)
    const list = screen.getByRole('list')
    expect(list).toHaveClass('gap-2')
    expect(list).not.toHaveClass('gap-4')
  })
})

describe('ProductGridSkeleton', () => {
  it('renders count skeleton cards hidden from screen readers', () => {
    const { container } = render(<ProductGridSkeleton count={8} />)
    const grid = skeletonGrid(container)
    expect(grid.children).toHaveLength(8)
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
    'renders no skeleton for count %s',
    (count) => {
      const { container } = render(<ProductGridSkeleton count={count} />)
      expect(container).toBeEmptyDOMElement()
    }
  )

  it('rounds a decimal skeleton count down', () => {
    const { container } = render(<ProductGridSkeleton count={3.9} />)
    expect(skeletonGrid(container).children).toHaveLength(3)
  })

  it('skeleton cards use the same grid as the products', () => {
    const { container } = render(<ProductGridSkeleton count={1} />)
    expect(skeletonGrid(container)).toHaveClass(
      'grid',
      'justify-center',
      'gap-4',
      'md:gap-6',
      'xl:gap-10',
      ...COLUMN_CLASSES
    )
  })

  it('skeleton card has the card image ratio and three text bars', () => {
    const { container } = render(<ProductGridSkeleton count={1} />)
    const card = skeletonGrid(container).firstElementChild
    if (!card) throw new Error('skeleton card not rendered')
    expect(card).toHaveClass('max-w-card', 'shadow-card')
    expect(card.firstElementChild).toHaveClass('aspect-card')
    const bars = card.lastElementChild?.children ?? []
    expect(Array.from(bars).map((bar) => bar.className)).toEqual([
      expect.stringContaining('h-[21px] w-2/3'),
      expect.stringContaining('mt-1 w-1/3'),
      expect.stringContaining('mt-[13px] h-[18px] w-[106px]'),
    ])
  })
})
