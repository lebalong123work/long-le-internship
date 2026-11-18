import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ImageThumbnail } from './ProductThumbnail'

describe('ImageThumbnail', () => {
  it('renders a decorative 80 x 80 image for a filled source', () => {
    const { container } = render(<ImageThumbnail src="/images/products/p1.jpg" />)
    const image = container.querySelector('img')
    expect(image).toHaveAttribute('src', '/images/products/p1.jpg')
    expect(image).toHaveAttribute('alt', '')
    expect(image).toHaveAttribute('width', '80')
    expect(image).toHaveAttribute('height', '80')
  })

  it('renders the neutral box without an image when the source is missing', () => {
    const { container } = render(<ImageThumbnail src={undefined} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('renders the neutral box without an image when the source is blank', () => {
    const { container } = render(<ImageThumbnail src="   " />)
    expect(container.querySelector('img')).toBeNull()
    expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument()
  })
})
