import { describe, expect, it } from 'vitest'
import { product } from '@/test/fixtures'
import { productImageSrc } from './productImage'

describe('productImageSrc', () => {
  it('returns the first gallery image', () => {
    const tee = { ...product('p1'), images: [{ src: '/a.jpg' }, { src: '/b.jpg' }] }
    expect(productImageSrc(tee)).toBe('/a.jpg')
  })

  it('falls back to the thumbnail when the first image is blank', () => {
    const tee = { ...product('p1'), images: [{ src: '  ' }], thumbnail: '/thumb.jpg' }
    expect(productImageSrc(tee)).toBe('/thumb.jpg')
  })

  it('returns undefined when there is no image and the thumbnail is blank', () => {
    const tee = { ...product('p1'), images: [], thumbnail: '' }
    expect(productImageSrc(tee)).toBeUndefined()
  })

  it('returns undefined for no product', () => {
    expect(productImageSrc(null)).toBeUndefined()
  })
})
