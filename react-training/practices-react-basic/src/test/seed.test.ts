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

describe('db.seed.json products', () => {
  it('has the 8 products shown in Figma', () => {
    expect(products).toHaveLength(8)
  })

  it('has unique ids', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
  })

  it.each(products)('$id has every Product field with the right type', (p) => {
    expect(p).toEqual({
      id: expect.any(String),
      name: expect.any(String),
      price: expect.any(Number),
      thumbnail: expect.any(String),
      images: expect.arrayContaining([expect.any(String)]),
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
    for (const path of [p.thumbnail, ...p.images]) {
      expect(publicImages.has(path), path).toBe(true)
    }
  })
})
