import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RATING_TEXT } from '@/constants/product'
import { RatingStars } from './RatingStars'

const STAR_ICON = '/icons/star.svg'

function starImages(container: HTMLElement): HTMLImageElement[] {
  return Array.from(container.querySelectorAll(`img[src="${STAR_ICON}"]`))
}

describe('RatingStars', () => {
  it.each([
    [5, 5],
    [4.4, 4],
    [4.5, 5],
  ])('rating %s shows %s stars', (rating, stars) => {
    const { container } = render(<RatingStars rating={rating} />)
    expect(starImages(container)).toHaveLength(stars)
  })

  it('rating 0 shows no star but keeps the label', () => {
    const { container } = render(<RatingStars rating={0} />)
    expect(starImages(container)).toHaveLength(0)
    expect(screen.getByRole('img', { name: RATING_TEXT.rating(0) })).toBeInTheDocument()
  })

  it('names the group Rated 4.5 out of 5', () => {
    render(<RatingStars rating={4.5} />)
    expect(screen.getByRole('img', { name: 'Rated 4.5 out of 5' })).toBeInTheDocument()
  })

  it('rounds 4.46 to 4.5 in the label', () => {
    render(<RatingStars rating={4.46} />)
    expect(screen.getByRole('img', { name: 'Rated 4.5 out of 5' })).toBeInTheDocument()
  })

  it('renders star.svg 16 × 15 with empty alt', () => {
    const { container } = render(<RatingStars rating={1} />)
    const [star] = starImages(container)
    expect(star).toHaveAttribute('alt', '')
    expect(star).toHaveAttribute('width', '16')
    expect(star).toHaveAttribute('height', '15')
  })

  it('adds the caller gap class', () => {
    render(<RatingStars rating={5} className="gap-2" />)
    expect(screen.getByRole('img', { name: RATING_TEXT.rating(5) })).toHaveClass('flex', 'gap-2')
  })
})
