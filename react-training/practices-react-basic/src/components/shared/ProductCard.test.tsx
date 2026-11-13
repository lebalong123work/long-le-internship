import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PRODUCT_CARD_TEXT } from '@/constants/productCard'
import { useWishlist } from '@/hooks/useWishlist'
import { product } from '@/test/fixtures'
import { ProductCard } from './ProductCard'
import type { Product } from '@/types'

vi.mock('@/hooks/useWishlist')

const STAR_ICON = '/icons/star.svg'
const BOOKMARK_ICON = '/icons/card-bookmark.svg'
const HEART_FILE = '/icons/card-heart.svg#'
const START_PATH = '/'

interface WishlistMock {
  saved?: boolean
  isLoaded?: boolean
}

const toggle = vi.fn()

function mockWishlist({ saved = false, isLoaded = true }: WishlistMock = {}): void {
  vi.mocked(useWishlist).mockReturnValue({
    productIds: saved ? ['p1'] : [],
    isInWishlist: (id: string) => saved && id === 'p1',
    toggle,
    isLoaded,
  })
}

function LocationDisplay(): JSX.Element {
  return <output data-testid="location">{useLocation().pathname}</output>
}

function card(overrides: Partial<Product> = {}, className?: string): JSX.Element {
  return (
    <MemoryRouter initialEntries={[START_PATH]}>
      <ProductCard product={{ ...product('p1'), ...overrides }} className={className} />
      <LocationDisplay />
    </MemoryRouter>
  )
}

function renderCard(overrides: Partial<Product> = {}, className?: string) {
  return render(card(overrides, className))
}

function heart(): HTMLElement {
  return screen.getByRole('button', { name: PRODUCT_CARD_TEXT.saveToWishlist('Smart T-Shirt') })
}

function heartShape(): Element | null {
  return heart().querySelector(`use[href="${HEART_FILE}card-heart-shape"]`)
}

function article(container: HTMLElement): HTMLElement {
  const element = container.querySelector('article')
  if (!element) throw new Error('article not rendered')
  return element
}

function iconBar(container: HTMLElement): HTMLElement {
  const bar = heart().parentElement
  if (!bar || !container.contains(bar)) throw new Error('icon bar not rendered')
  return bar
}

function thumbnail(container: HTMLElement): HTMLImageElement | null {
  return container.querySelector('img[src="/images/products/p1.jpg"]')
}

function starImages(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll(`img[src="${STAR_ICON}"]`)
}

function classTokens(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[class]')).flatMap((element) =>
    (element.getAttribute('class') ?? '').split(/\s+/)
  )
}

beforeEach(() => {
  mockWishlist()
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('ProductCard content', () => {
  it('shows the name, the short price and Best quality', () => {
    renderCard()
    expect(screen.getByText('Smart T-Shirt')).toBeInTheDocument()
    expect(screen.getByText('40$')).toBeInTheDocument()
    expect(screen.getByText(PRODUCT_CARD_TEXT.bestQuality)).toBeInTheDocument()
  })

  it('shows a decimal price with 2 decimals', () => {
    renderCard({ price: 39.5 })
    expect(screen.getByText('39.50$')).toBeInTheDocument()
  })

  it('shows the name as a level-3 heading', () => {
    renderCard()
    expect(screen.getByRole('heading', { level: 3, name: 'Smart T-Shirt' })).toBeInTheDocument()
  })

  it('keeps the price out of the heading', () => {
    renderCard()
    expect(screen.getByRole('heading', { level: 3 })).not.toHaveTextContent('40$')
  })
})

describe('ProductCard link', () => {
  it('links the name to the product page', () => {
    renderCard()
    expect(screen.getByRole('link', { name: 'Smart T-Shirt' })).toHaveAttribute('href', '/shop/p1')
  })

  it('renders only one link in the card', () => {
    renderCard()
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })
})

describe('ProductCard image', () => {
  it('shows the thumbnail as a decorative image', () => {
    const { container } = renderCard()
    expect(thumbnail(container)).toHaveAttribute('alt', '')
  })

  it('keeps the placeholder colour behind the image', () => {
    const { container } = renderCard()
    expect(thumbnail(container)?.parentElement).toHaveClass('bg-[#ACACAC]', 'aspect-card')
  })

  it('shows a new thumbnail again after the previous one failed', () => {
    const { container, rerender } = renderCard()
    const failed = thumbnail(container)
    if (!failed) throw new Error('thumbnail not rendered')
    fireEvent.error(failed)
    rerender(card({ thumbnail: '/images/products/p2.jpg' }))
    expect(container.querySelector('img[src="/images/products/p2.jpg"]')).toBeInTheDocument()
  })

  it('replaces a failed image with the placeholder box', () => {
    const { container } = renderCard()
    const image = thumbnail(container)
    if (!image) throw new Error('thumbnail not rendered')
    const box = image.parentElement
    fireEvent.error(image)
    expect(thumbnail(container)).toBeNull()
    expect(box).toHaveClass('bg-[#ACACAC]', 'aspect-card')
  })
})

describe('ProductCard rating', () => {
  it('shows one star per rounded rating point', () => {
    const { container } = renderCard({ rating: 4.4 })
    expect(starImages(container)).toHaveLength(4)
  })

  it('shows no star for a rating of 0', () => {
    const { container } = renderCard({ rating: 0 })
    expect(starImages(container)).toHaveLength(0)
  })

  it('names the star group with the rating out of 5', () => {
    renderCard()
    expect(screen.getByRole('img', { name: PRODUCT_CARD_TEXT.rating(5) })).toBeInTheDocument()
  })

  it('names a decimal rating with one decimal', () => {
    renderCard({ rating: 4.46 })
    expect(screen.getByRole('img', { name: 'Rated 4.5 out of 5' })).toBeInTheDocument()
  })

  it('shows the short count hidden and the full count for screen readers', () => {
    renderCard()
    expect(screen.getByText('( 1k )')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByText('1,000 reviews')).toHaveClass('sr-only')
  })

  it('says 1 review for a single review', () => {
    renderCard({ reviewCount: 1 })
    expect(screen.getByText('1 review')).toBeInTheDocument()
  })
})

describe('ProductCard heart', () => {
  it('presses and fills the heart when the product is saved', () => {
    mockWishlist({ saved: true })
    renderCard()
    expect(heart()).toHaveAttribute('aria-pressed', 'true')
    expect(heartShape()).toHaveClass('fill-badge')
  })

  it('leaves the heart unpressed and unfilled when not saved', () => {
    renderCard()
    expect(heart()).toHaveAttribute('aria-pressed', 'false')
    expect(heartShape()).toHaveClass('fill-none')
  })

  it('calls toggle once with the product id', async () => {
    renderCard()
    await userEvent.click(heart())
    expect(toggle).toHaveBeenCalledTimes(1)
    expect(toggle).toHaveBeenCalledWith('p1')
  })

  it('does not navigate when the heart is clicked', async () => {
    renderCard()
    await userEvent.click(heart())
    expect(screen.getByTestId('location')).toHaveTextContent(START_PATH)
  })

  it('names the heart Save {name} to wishlist', () => {
    renderCard()
    expect(heart()).toHaveAccessibleName('Save Smart T-Shirt to wishlist')
  })

  it('keeps the heart name when it becomes pressed', () => {
    const { rerender } = renderCard()
    mockWishlist({ saved: true })
    rerender(card())
    expect(heart()).toHaveAccessibleName('Save Smart T-Shirt to wishlist')
    expect(heart()).toHaveAttribute('aria-pressed', 'true')
  })

  it('enables the heart once the saved list is loaded', async () => {
    mockWishlist({ isLoaded: false })
    const { rerender } = renderCard()
    mockWishlist({ isLoaded: true })
    rerender(card())
    expect(heart()).not.toHaveAttribute('aria-disabled')
    await userEvent.click(heart())
    expect(toggle).toHaveBeenCalledWith('p1')
  })

  it('marks the heart aria-disabled and ignores click, Enter and Space until the saved list is loaded', async () => {
    mockWishlist({ isLoaded: false })
    renderCard()
    expect(heart()).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(heart())
    heart().focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(heart()).toHaveFocus()
    expect(toggle).not.toHaveBeenCalled()
  })
})

describe('ProductCard icons', () => {
  it('uses only the owner card icon files', () => {
    const { container } = renderCard()
    const imageSources = Array.from(container.querySelectorAll('img')).map((img) =>
      img.getAttribute('src')
    )
    const iconSources = imageSources.filter((src) => src !== '/images/products/p1.jpg')
    expect(new Set(iconSources)).toEqual(new Set([STAR_ICON, BOOKMARK_ICON]))
    const useTargets = Array.from(container.querySelectorAll('use')).map((use) =>
      use.getAttribute('href')
    )
    expect(useTargets).toEqual([`${HEART_FILE}card-heart-frame`, `${HEART_FILE}card-heart-shape`])
  })

  it('draws no heart path inline', () => {
    const { container } = renderCard()
    expect(container.querySelectorAll('path')).toHaveLength(0)
  })

  it('shows the Bookmark icon before the heart', () => {
    const { container } = renderCard()
    const bookmark = container.querySelector(`img[src="${BOOKMARK_ICON}"]`)
    if (!bookmark) throw new Error('bookmark not rendered')
    expect(
      bookmark.compareDocumentPosition(heart()) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('keeps the Bookmark out of the tab order and accessibility tree', () => {
    const { container } = renderCard()
    const bookmark = container.querySelector(`img[src="${BOOKMARK_ICON}"]`)
    expect(bookmark?.closest('[aria-hidden="true"]')).not.toBeNull()
    expect(bookmark?.closest('button, a, [tabindex]')).toBeNull()
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })
})

describe('ProductCard hover and touch', () => {
  it('hides the icon bar on mouse until hover or focus within', () => {
    const { container } = renderCard()
    expect(iconBar(container)).toHaveClass(
      'can-hover:opacity-0',
      'can-hover:group-hover:opacity-100',
      'can-hover:group-focus-within:opacity-100'
    )
  })

  it('keeps the icon bar visible without the mouse variant', () => {
    const { container } = renderCard()
    expect(iconBar(container)).not.toHaveClass('opacity-0')
  })

  it('uses the card shadow and the mouse-only hover shadow', () => {
    const { container } = renderCard()
    expect(article(container)).toHaveClass(
      'group',
      'shadow-card',
      'can-hover:hover:shadow-card-hover'
    )
  })

  it('uses no plain hover class', () => {
    const { container } = renderCard()
    expect(classTokens(container).filter((token) => token.startsWith('hover:'))).toEqual([])
  })
})

describe('ProductCard focus ring', () => {
  it('uses a white focus ring on the heart over the photo bar', () => {
    renderCard()
    expect(heart()).toHaveClass('focus-visible:ring-2', 'focus-visible:ring-white')
    expect(heart()).not.toHaveClass('focus-visible:ring-primary')
  })

  it('keeps the primary focus ring on the card link', () => {
    renderCard()
    expect(screen.getByRole('link', { name: 'Smart T-Shirt' })).toHaveClass(
      'focus-visible:after:ring-primary'
    )
  })
})

describe('ProductCard className', () => {
  it('merges a caller class name', () => {
    const { container } = renderCard({}, 'mt-4')
    expect(article(container)).toHaveClass('mt-4', 'max-w-card')
  })

  it('lets a conflicting caller class win', () => {
    const { container } = renderCard({}, 'max-w-none')
    expect(article(container)).toHaveClass('max-w-none')
    expect(article(container)).not.toHaveClass('max-w-card')
  })
})
