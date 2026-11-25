import { CATEGORIES } from '@/constants/categories'
import seed from '../../server/db.seed.json'
import type { Product } from '@/types'

const products: Product[] = seed.products
const slugs: string[] = CATEGORIES.map((c) => c.slug)

const publicImages = new Set(
  Object.keys(import.meta.glob('../../public/images/**/*')).map((file) =>
    file.replace('../../public', '')
  )
)

const FIGMA_COLORS = ['Black', 'Blue', 'Green']
const FIGMA_SIZES = ['S', 'M', 'L', 'XL']

const PRODUCTS_PER_CATEGORY = 10
const BEST_SELLERS_PER_CATEGORY = 8
const FIGMA_PRODUCT_IDS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']
const PLACEHOLDER_DESCRIPTION = /placeholder/i

function countBy(list: Product[], key: (p: Product) => string): Record<string, number> {
  return list.reduce<Record<string, number>>((counts, p) => {
    counts[key(p)] = (counts[key(p)] ?? 0) + 1
    return counts
  }, {})
}

function everyCategory(count: number): Record<string, number> {
  return Object.fromEntries(slugs.map((slug) => [slug, count]))
}

describe('db.seed.json catalog (row 17-5)', () => {
  it('K1 has 10 products in every category', () => {
    expect(products).toHaveLength(slugs.length * PRODUCTS_PER_CATEGORY)
    expect(countBy(products, (p) => p.category)).toEqual(everyCategory(PRODUCTS_PER_CATEGORY))
  })

  it('K2 has 8 best sellers in every category, so no Best Seller tab is empty', () => {
    const bestSellers = products.filter((p) => p.isBestSeller)
    expect(countBy(bestSellers, (p) => p.category)).toEqual(
      everyCategory(BEST_SELLERS_PER_CATEGORY)
    )
  })

  it('K3 keeps the 8 Figma T-shirts first as the T-Shirt best sellers', () => {
    const figma = products.slice(0, FIGMA_PRODUCT_IDS.length)
    expect(figma.map((p) => p.id)).toEqual(FIGMA_PRODUCT_IDS)
    for (const p of figma) {
      expect(p).toMatchObject({ name: 'Smart T-Shirt', category: 't-shirt', isBestSeller: true })
    }
  })

  it.each(products)('K4 $id has a real description, not a placeholder', (p) => {
    expect(p.description.trim()).not.toBe('')
    expect(p.description).not.toMatch(PLACEHOLDER_DESCRIPTION)
  })
})

describe('db.seed.json products', () => {
  it('has unique ids', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
  })

  it.each(products)('$id has every Product field with the right type', (p) => {
    expect(p).toEqual({
      id: expect.any(String),
      name: expect.any(String),
      price: expect.any(Number),
      thumbnail: expect.any(String),
      images: expect.arrayContaining([expect.objectContaining({ src: expect.any(String) })]),
      category: expect.any(String),
      description: expect.any(String),
      stock: expect.any(Number),
      colors: expect.any(Array),
      sizes: expect.any(Array),
      rating: expect.any(Number),
      reviewCount: expect.any(Number),
      isBestSeller: expect.any(Boolean),
      createdAt: expect.any(String),
    })
    expect(Number.isNaN(Date.parse(p.createdAt))).toBe(false)
  })

  it.each(products)('$id uses a known category slug', (p) => {
    expect(slugs).toContain(p.category)
  })

  it.each(products)('$id uses only Figma colors and sizes', (p) => {
    expect(FIGMA_COLORS).toEqual(expect.arrayContaining(p.colors))
    expect(FIGMA_SIZES).toEqual(expect.arrayContaining(p.sizes))
  })

  it.each(products)('$id points to image files that exist in public/', (p) => {
    const imagePaths = p.images.flatMap(({ src, thumbnailSrc, src2x }) =>
      [src, thumbnailSrc, src2x].filter((path) => path !== undefined)
    )
    for (const path of [p.thumbnail, ...imagePaths]) {
      expect(publicImages.has(path), path).toBe(true)
    }
  })
})
