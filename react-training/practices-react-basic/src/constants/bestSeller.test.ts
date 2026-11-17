import { describe, expect, it } from 'vitest'
import { BEST_SELLER_TEXT, CATEGORY_TABS } from './bestSeller'
import { CATEGORIES } from './categories'

describe('Best Seller constants', () => {
  it('category tabs follow CATEGORIES with slug ids and names', () => {
    expect(CATEGORY_TABS).toEqual(
      CATEGORIES.map((category) => ({ id: category.slug, label: category.name }))
    )
  })

  it('every Best Seller text is a non-empty string', () => {
    for (const text of Object.values(BEST_SELLER_TEXT)) {
      expect(text.trim()).not.toBe('')
    }
  })
})
