import { describe, expect, it } from 'vitest'
import { pageHref, withPageParam } from './pageSearchParams'

describe('withPageParam', () => {
  it('U1 sets a page above 1 and keeps the other params', () => {
    const next = withPageParam(new URLSearchParams('q=shirt&ref=a'), 2)
    expect(next.toString()).toBe('q=shirt&ref=a&page=2')
  })

  it.each([1, 0])('U1 removes the page parameter for page %i', (page) => {
    const next = withPageParam(new URLSearchParams('q=shirt&page=4'), page)
    expect(next.toString()).toBe('q=shirt')
  })

  it('U1 does not change the given params', () => {
    const params = new URLSearchParams('q=shirt&page=4')
    withPageParam(params, 2)
    withPageParam(params, 1)
    expect(params.toString()).toBe('q=shirt&page=4')
  })
})

describe('pageHref', () => {
  it('U2 returns the bare path when no param is left', () => {
    expect(pageHref('/account/orders', new URLSearchParams('page=3'), 1)).toBe('/account/orders')
  })

  it('U2 returns the path with the search string', () => {
    expect(pageHref('/search', new URLSearchParams('q=shirt'), 2)).toBe('/search?q=shirt&page=2')
  })
})
