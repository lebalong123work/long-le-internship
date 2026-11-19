import { describe, expect, it } from 'vitest'
import { product } from '@/test/fixtures'
import { suggestionKey, suggestionRoute } from './suggestionRoute'
import type { Suggestion } from '@/types'

const category: Suggestion = {
  type: 'category',
  category: { id: 'p1', name: 'T-Shirt', slug: 't-shirt' },
}

const productSuggestion: Suggestion = { type: 'product', product: product('p1') }

describe('suggestionRoute', () => {
  it('category goes to the search results for its name', () => {
    expect(suggestionRoute(category)).toBe('/search?q=T-Shirt')
  })

  it('product goes to its detail page', () => {
    expect(suggestionRoute(productSuggestion)).toBe('/shop/p1')
  })
})

describe('suggestionKey', () => {
  it('keys differ for a category and a product with the same id', () => {
    expect(suggestionKey(category)).toBe('category-p1')
    expect(suggestionKey(productSuggestion)).toBe('product-p1')
  })
})
