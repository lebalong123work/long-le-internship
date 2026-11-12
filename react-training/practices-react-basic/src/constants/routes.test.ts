import { describe, expect, it } from 'vitest'
import { ROUTES } from './routes'

describe('ROUTES.SEARCH_RESULTS', () => {
  it('builds /search?q=shirt', () => {
    expect(ROUTES.SEARCH_RESULTS('shirt')).toBe('/search?q=shirt')
  })

  it('encodes & and # in the query', () => {
    const url = new URL(ROUTES.SEARCH_RESULTS('a&b #1'), 'http://localhost')
    expect(url.pathname).toBe(ROUTES.SEARCH)
    expect(url.hash).toBe('')
    expect(url.searchParams.get('q')).toBe('a&b #1')
  })
})
