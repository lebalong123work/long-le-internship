import { describe, expect, it } from 'vitest'
import { CATEGORIES } from './categories'
import { ROUTES } from './routes'

const SHOP_CATEGORY_CASES = CATEGORIES.map(({ slug }) => [slug, `/shop?category=${slug}`] as const)

describe('ROUTES.SHOP_CATEGORY', () => {
  it.each(SHOP_CATEGORY_CASES)('SHOP_CATEGORY(%s) links to %s', (slug, expectedPath) => {
    expect(ROUTES.SHOP_CATEGORY(slug)).toBe(expectedPath)
  })
})
