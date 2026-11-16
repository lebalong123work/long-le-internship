import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { HERO_SLIDES, HERO_TEXT } from '@/constants/hero'
import { ROUTES } from '@/constants/routes'
import { HeroBanner } from './HeroBanner'
import Home from './index'

function renderInRouter(element: JSX.Element) {
  return render(<MemoryRouter>{element}</MemoryRouter>)
}

describe('HeroBanner', () => {
  it('renders the title as the page heading and the description', () => {
    renderInRouter(<HeroBanner />)
    expect(screen.getByRole('heading', { level: 1, name: HERO_TEXT.title })).toBeInTheDocument()
    expect(screen.getByText(HERO_TEXT.description)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: HERO_TEXT.title })).toBeInTheDocument()
  })

  it('links Shop Now to the shop page', () => {
    renderInRouter(<HeroBanner />)
    expect(screen.getByRole('link', { name: HERO_TEXT.shopNow })).toHaveAttribute(
      'href',
      ROUTES.SHOP
    )
  })

  it('shows the first slide photo', () => {
    renderInRouter(<HeroBanner />)
    expect(screen.getByRole('img', { name: HERO_SLIDES[0].alt })).toHaveAttribute(
      'src',
      HERO_SLIDES[0].imageSrc
    )
  })

  it('Home page shows the hero banner', () => {
    renderInRouter(<Home />)
    expect(screen.getByRole('heading', { level: 1, name: HERO_TEXT.title })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: HERO_TEXT.carouselLabel })).toBeInTheDocument()
  })
})
