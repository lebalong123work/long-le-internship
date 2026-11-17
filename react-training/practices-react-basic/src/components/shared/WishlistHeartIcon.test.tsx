import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { WishlistHeartIcon } from './WishlistHeartIcon'

function uses(container: HTMLElement): Element[] {
  return Array.from(container.querySelectorAll('use'))
}

function shape(container: HTMLElement): Element | undefined {
  return uses(container).find((node) => node.getAttribute('href')?.endsWith('#card-heart-shape'))
}

describe('WishlistHeartIcon', () => {
  it('fills the heart with the badge color when saved', () => {
    const { container } = render(<WishlistHeartIcon isSaved />)
    expect(shape(container)).toHaveClass('fill-badge')
  })

  it('leaves the heart empty when not saved', () => {
    const { container } = render(<WishlistHeartIcon isSaved={false} />)
    expect(shape(container)).toHaveClass('fill-none')
  })

  it('draws the frame only with withFrame', () => {
    const framed = render(<WishlistHeartIcon isSaved={false} withFrame />)
    expect(uses(framed.container)).toHaveLength(2)
    const plain = render(<WishlistHeartIcon isSaved={false} />)
    expect(uses(plain.container)).toHaveLength(1)
  })

  it('is hidden from assistive technology', () => {
    const { container } = render(<WishlistHeartIcon isSaved={false} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
