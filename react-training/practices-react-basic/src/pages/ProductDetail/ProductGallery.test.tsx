import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { ProductGallery } from './ProductGallery'
import type { ProductImage } from '@/types'

const NAME = 'Smart T-Shirt'

function imagesOf(count: number): ProductImage[] {
  return Array.from({ length: count }, (_, index) => ({
    src: `/images/products/photo-${index + 1}-main.jpg`,
    thumbnailSrc: `/images/products/photo-${index + 1}-thumb.jpg`,
  }))
}

function renderGallery(images: ProductImage[] = imagesOf(4)) {
  const view = render(<ProductGallery images={images} productName={NAME} />)
  return { ...view, user: userEvent.setup() }
}

function mainPhoto(position: number, total: number): HTMLElement {
  return screen.getByRole('img', { name: PRODUCT_DETAIL_TEXT.mainPhotoAlt(NAME, position, total) })
}

function thumbnails(): HTMLElement[] {
  return within(screen.getByRole('group', { name: PRODUCT_DETAIL_TEXT.choosePhoto })).getAllByRole(
    'button'
  )
}

function thumbnail(position: number, total: number): HTMLElement {
  return screen.getByRole('button', { name: PRODUCT_DETAIL_TEXT.showPhoto(position, total) })
}

function thumbImage(button: HTMLElement): HTMLImageElement | null {
  return button.querySelector('img')
}

describe('ProductGallery', () => {
  it('shows the first image as the main photo with its alt', () => {
    renderGallery()
    expect(mainPhoto(1, 4)).toHaveAttribute('src', '/images/products/photo-1-main.jpg')
  })

  it.each([
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 5],
  ])('%s images give %s thumbnails', (count, thumbs) => {
    renderGallery(imagesOf(count))
    expect(thumbnails()).toHaveLength(thumbs)
  })

  it('shows no thumbnail row for one image', () => {
    renderGallery(imagesOf(1))
    expect(screen.queryByRole('group')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('shows the clicked thumbnail as the main photo', async () => {
    const { user } = renderGallery()
    await user.click(thumbnail(2, 4))
    expect(mainPhoto(2, 4)).toHaveAttribute('src', '/images/products/photo-2-main.jpg')
  })

  it('marks the clicked thumbnail current and announces the position', async () => {
    const { user } = renderGallery()
    expect(thumbnail(1, 4)).toHaveAttribute('aria-disabled', 'true')
    await user.click(thumbnail(3, 4))
    expect(thumbnail(3, 4)).toHaveAttribute('aria-disabled', 'true')
    expect(thumbnail(3, 4)).toHaveClass('outline-black')
    expect(thumbnail(1, 4)).not.toHaveAttribute('aria-disabled')
    expect(screen.getByRole('status')).toHaveTextContent(PRODUCT_DETAIL_TEXT.photoStatus(3, 4))
  })

  it('ignores a click on the current thumbnail', async () => {
    const { user } = renderGallery()
    fireEvent.load(mainPhoto(1, 4))
    await user.click(thumbnail(1, 4))
    expect(mainPhoto(1, 4)).toHaveClass('opacity-100')
  })

  it('keeps the main photo transparent until it loads', () => {
    renderGallery()
    expect(mainPhoto(1, 4)).toHaveClass('opacity-0', 'transition-opacity', 'duration-300')
    expect(mainPhoto(1, 4)).toHaveClass('motion-reduce:transition-none')
    fireEvent.load(mainPhoto(1, 4))
    expect(mainPhoto(1, 4)).toHaveClass('opacity-100')
  })

  it('fades a newly selected photo in after load', async () => {
    const { user } = renderGallery()
    fireEvent.load(mainPhoto(1, 4))
    await user.click(thumbnail(2, 4))
    expect(mainPhoto(2, 4)).toHaveClass('opacity-0')
    fireEvent.load(mainPhoto(2, 4))
    expect(mainPhoto(2, 4)).toHaveClass('opacity-100')
  })

  it('replaces a failed main photo with a named grey box', () => {
    renderGallery()
    fireEvent.error(mainPhoto(1, 4))
    const fallback = mainPhoto(1, 4)
    expect(fallback.tagName).toBe('DIV')
    expect(fallback.parentElement).toHaveClass('bg-[#C4C4C4]')
  })

  it('keeps the button when a thumbnail fails', () => {
    renderGallery()
    const button = thumbnail(2, 4)
    const image = thumbImage(button)
    if (!image) throw new Error('no thumbnail image')
    fireEvent.error(image)
    expect(thumbImage(thumbnail(2, 4))).toBeNull()
    expect(thumbnail(2, 4)).toHaveClass('bg-[#C4C4C4]')
  })

  it('clamps the selection when the images list gets shorter', async () => {
    const { user, rerender } = renderGallery()
    await user.click(thumbnail(4, 4))
    rerender(<ProductGallery images={imagesOf(2)} productName={NAME} />)
    expect(mainPhoto(2, 2)).toHaveAttribute('src', '/images/products/photo-2-main.jpg')
  })

  it('loads the main photo eagerly at 588 × 400', () => {
    renderGallery()
    const photo = mainPhoto(1, 4)
    expect(photo).not.toHaveAttribute('loading')
    expect(photo).toHaveAttribute('width', '588')
    expect(photo).toHaveAttribute('height', '400')
  })

  it('shows image 4 when its thumbnail is clicked', async () => {
    const { user } = renderGallery(imagesOf(5))
    await user.click(thumbnail(4, 5))
    expect(mainPhoto(4, 5)).toHaveAttribute('src', '/images/products/photo-4-main.jpg')
    await user.click(thumbnail(5, 5))
    expect(mainPhoto(5, 5)).toHaveAttribute('src', '/images/products/photo-5-main.jpg')
  })

  it('sizes thumbnails three per row in a horizontal scroll strip', () => {
    renderGallery(imagesOf(5))
    expect(screen.getByRole('group', { name: PRODUCT_DETAIL_TEXT.choosePhoto })).toHaveClass(
      'flex',
      'overflow-x-auto',
      'gap-6'
    )
    for (const button of thumbnails()) {
      expect(button).toHaveClass('w-[calc((100%-48px)/3)]', 'shrink-0', 'aspect-square')
    }
    expect(thumbImage(thumbnails()[3])).toHaveAttribute('loading', 'lazy')
    expect(thumbImage(thumbnails()[2])).not.toHaveAttribute('loading')
  })

  it('uses thumbnailSrc for the thumbnail', () => {
    renderGallery()
    expect(thumbImage(thumbnail(2, 4))).toHaveAttribute('src', '/images/products/photo-2-thumb.jpg')
    expect(thumbImage(thumbnail(2, 4))).toHaveAttribute('width', '180')
  })

  it('falls back to src without thumbnailSrc', () => {
    renderGallery([{ src: '/images/products/a-main.jpg' }, { src: '/images/products/b-main.jpg' }])
    expect(thumbImage(thumbnail(2, 2))).toHaveAttribute('src', '/images/products/b-main.jpg')
  })

  it('adds a 1x / 2x srcSet when src2x exists', () => {
    renderGallery([{ src: '/a.jpg', src2x: '/a@2x.jpg' }])
    expect(mainPhoto(1, 1)).toHaveAttribute('srcset', '/a.jpg 1x, /a@2x.jpg 2x')
  })

  it('has no srcSet without src2x', () => {
    renderGallery()
    expect(mainPhoto(1, 4)).not.toHaveAttribute('srcset')
  })

  it('retries the 1x photo once before the grey box', () => {
    renderGallery([{ src: '/a.jpg', src2x: '/a@2x.jpg' }])
    fireEvent.error(mainPhoto(1, 1))
    expect(mainPhoto(1, 1).tagName).toBe('IMG')
    expect(mainPhoto(1, 1)).not.toHaveAttribute('srcset')
    fireEvent.error(mainPhoto(1, 1))
    expect(mainPhoto(1, 1).tagName).toBe('DIV')
  })
})
