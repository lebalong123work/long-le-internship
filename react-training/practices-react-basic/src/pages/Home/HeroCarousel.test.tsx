import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { HERO_TEXT } from '@/constants/hero'
import { HeroCarousel } from './HeroCarousel'
import type { HeroSlide } from '@/constants/hero'

const SLIDE_A: HeroSlide = {
  id: 'a',
  imageSrc: '/a.jpg',
  imageSrc2x: '/a@2x.jpg',
  thumbSrc: '/a-thumb.jpg',
  alt: 'Photo A',
}
const SLIDE_B: HeroSlide = { id: 'b', imageSrc: '/b.jpg', thumbSrc: '/b-thumb.jpg', alt: 'Photo B' }
const SLIDE_C: HeroSlide = { ...SLIDE_B, id: 'c' }
const SLIDES = [SLIDE_A, SLIDE_B, SLIDE_C]

function renderCarousel(slides: readonly HeroSlide[] = SLIDES) {
  return render(<HeroCarousel slides={slides} />)
}

function picker(): HTMLElement {
  return screen.getByRole('group', { name: HERO_TEXT.pickerLabel })
}

function thumb(position: number): HTMLElement {
  return within(picker()).getByRole('button', { name: HERO_TEXT.showSlide(position, 3) })
}

function visibleSlide(position: number, total = 3): HTMLElement {
  return screen.getByRole('group', { name: HERO_TEXT.slidePosition(position, total) })
}

function mainPhoto(): HTMLElement {
  return within(visibleSlide(currentPosition())).getByRole('img')
}

function currentPosition(): number {
  const label = screen
    .getAllByRole('group')
    .find((element) => element.getAttribute('aria-roledescription') === 'slide')
    ?.getAttribute('aria-label')
  return Number(label?.split(' ')[0])
}

function liveRegions(container: HTMLElement): Element[] {
  return [...container.querySelectorAll('[aria-live]')]
}

function failPhoto(path: string): void {
  const photo = mainPhoto()
  Object.defineProperty(photo, 'currentSrc', {
    value: new URL(path, window.location.href).href,
    configurable: true,
  })
  fireEvent.error(photo)
}

describe('HeroCarousel arrows', () => {
  it('Next shows the second slide', async () => {
    renderCarousel()
    await userEvent.click(screen.getByRole('button', { name: HERO_TEXT.nextSlide }))
    expect(visibleSlide(2)).toBeInTheDocument()
    expect(mainPhoto()).toHaveAttribute('alt', SLIDE_B.alt)
  })

  it('Previous shows the previous slide', async () => {
    renderCarousel()
    await userEvent.click(thumb(3))
    await userEvent.click(screen.getByRole('button', { name: HERO_TEXT.previousSlide }))
    expect(visibleSlide(2)).toBeInTheDocument()
  })

  it('Next on the last slide shows the first', async () => {
    renderCarousel()
    await userEvent.click(thumb(3))
    await userEvent.click(screen.getByRole('button', { name: HERO_TEXT.nextSlide }))
    expect(visibleSlide(1)).toBeInTheDocument()
    expect(mainPhoto()).toHaveAttribute('alt', SLIDE_A.alt)
  })

  it('Previous on the first slide shows the last', async () => {
    renderCarousel()
    await userEvent.click(screen.getByRole('button', { name: HERO_TEXT.previousSlide }))
    expect(visibleSlide(3)).toBeInTheDocument()
  })
})

describe('HeroCarousel thumbnails', () => {
  it('clicking a thumbnail shows that slide', async () => {
    renderCarousel()
    await userEvent.click(thumb(2))
    expect(visibleSlide(2)).toBeInTheDocument()
  })

  it('clicking the active aria-disabled thumbnail keeps the slide', async () => {
    renderCarousel()
    await userEvent.click(thumb(2))
    await userEvent.click(thumb(2))
    expect(visibleSlide(2)).toBeInTheDocument()
    expect(thumb(2)).toHaveAttribute('aria-disabled', 'true')
  })

  it('marks the active thumbnail with aria-disabled and the 80 px size', () => {
    renderCarousel()
    expect(thumb(1)).toHaveAttribute('aria-disabled', 'true')
    expect(thumb(1)).toHaveClass('size-20')
    expect(thumb(1)).not.toHaveClass('size-[60px]')
  })

  it('gives the other thumbnails no aria-disabled and the 60 px size', () => {
    renderCarousel()
    for (const position of [2, 3]) {
      expect(thumb(position)).not.toHaveAttribute('aria-disabled')
      expect(thumb(position)).toHaveClass('size-[60px]')
      expect(thumb(position)).not.toHaveClass('size-20')
    }
  })
})

describe('HeroCarousel live status', () => {
  it('announces "Slide 2 of 3" after a change', async () => {
    const { container } = renderCarousel()
    const [status] = liveRegions(container)
    expect(status).toHaveTextContent(HERO_TEXT.slideStatus(1, 3))
    await userEvent.click(screen.getByRole('button', { name: HERO_TEXT.nextSlide }))
    expect(status).toHaveTextContent('Slide 2 of 3')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveAttribute('aria-atomic', 'true')
  })

  it('has one live region and does not change it when the active thumbnail is clicked', async () => {
    const { container } = renderCarousel()
    expect(liveRegions(container)).toHaveLength(1)
    const [status] = liveRegions(container)
    await userEvent.click(thumb(1))
    expect(status).toHaveTextContent(HERO_TEXT.slideStatus(1, 3))
    expect(liveRegions(container)).toHaveLength(1)
  })
})

describe('HeroCarousel names', () => {
  it('names the carousel, the arrows and the thumbnails', () => {
    renderCarousel()
    const carousel = screen.getByRole('region', { name: HERO_TEXT.carouselLabel })
    expect(carousel).toHaveAttribute('aria-roledescription', 'carousel')
    expect(screen.getByRole('button', { name: HERO_TEXT.previousSlide })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: HERO_TEXT.nextSlide })).toBeInTheDocument()
    expect(within(picker()).getAllByRole('button')).toHaveLength(3)
  })

  it('gives slides with the same photo different thumbnail names', () => {
    renderCarousel()
    expect(thumb(2)).not.toBe(thumb(3))
    expect(thumb(2)).toHaveAccessibleName('Show slide 2 of 3')
    expect(thumb(3)).toHaveAccessibleName('Show slide 3 of 3')
  })
})

describe('HeroCarousel slide count', () => {
  it('shows only the photo for a single slide', () => {
    const { container } = renderCarousel([SLIDE_A])
    expect(screen.getByRole('img', { name: SLIDE_A.alt })).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(liveRegions(container)).toHaveLength(0)
  })

  it('renders nothing for an empty slide list', () => {
    const { container } = renderCarousel([])
    expect(container).toBeEmptyDOMElement()
  })
})

describe('HeroCarousel photo failure', () => {
  it('retries with the 1x photo when the 2x photo fails', () => {
    renderCarousel()
    failPhoto(SLIDE_A.imageSrc2x ?? '')
    expect(mainPhoto()).toHaveAttribute('src', SLIDE_A.imageSrc)
    expect(mainPhoto()).not.toHaveAttribute('srcset')
    expect(mainPhoto().tagName).toBe('IMG')
  })

  it('shows a photo with another source after a failure when the slide changes', async () => {
    renderCarousel()
    failPhoto(SLIDE_A.imageSrc)
    await userEvent.click(thumb(2))
    expect(mainPhoto().tagName).toBe('IMG')
    expect(mainPhoto()).toHaveAttribute('src', SLIDE_B.imageSrc)
  })

  it('shows the fallback named by the alt when the 1x photo also fails', () => {
    renderCarousel()
    failPhoto(SLIDE_A.imageSrc2x ?? '')
    failPhoto(SLIDE_A.imageSrc)
    expect(mainPhoto().tagName).toBe('DIV')
    expect(mainPhoto()).toHaveAccessibleName(SLIDE_A.alt)
  })

  it('shows the fallback at once when the 1x file failed first', () => {
    renderCarousel()
    failPhoto(SLIDE_A.imageSrc)
    expect(mainPhoto().tagName).toBe('DIV')
    expect(mainPhoto()).toHaveAccessibleName(SLIDE_A.alt)
  })

  it('starts at the 1x photo when a slide has no 2x photo', async () => {
    renderCarousel()
    await userEvent.click(thumb(2))
    expect(mainPhoto()).not.toHaveAttribute('srcset')
    failPhoto(SLIDE_B.imageSrc)
    expect(mainPhoto().tagName).toBe('DIV')
  })

  it('keeps the fallback on every slide that uses a failed photo', async () => {
    renderCarousel()
    await userEvent.click(thumb(2))
    failPhoto(SLIDE_B.imageSrc)
    await userEvent.click(thumb(3))
    expect(visibleSlide(3)).toBeInTheDocument()
    expect(mainPhoto().tagName).toBe('DIV')
    expect(mainPhoto()).toHaveAccessibleName(SLIDE_C.alt)
  })

  it('shows a fallback thumbnail but keeps its button', () => {
    renderCarousel()
    const thumbImage = thumb(2).querySelector('img')
    if (thumbImage === null) throw new Error('Missing thumbnail image')
    fireEvent.error(thumbImage)
    expect(thumb(2).querySelector('img')).toBeNull()
    expect(thumb(2)).toHaveClass('size-[60px]')
    expect(thumb(2)).toHaveAccessibleName('Show slide 2 of 3')
  })
})

describe('HeroCarousel keyboard', () => {
  it('Next and the thumbnails work with the keyboard', async () => {
    const user = userEvent.setup()
    renderCarousel()
    screen.getByRole('button', { name: HERO_TEXT.nextSlide }).focus()
    await user.keyboard('{Enter}')
    expect(visibleSlide(2)).toBeInTheDocument()
    thumb(3).focus()
    await user.keyboard(' ')
    expect(visibleSlide(3)).toBeInTheDocument()
  })
})

describe('HeroCarousel APG semantics', () => {
  it('groups the picker and labels the visible slide "2 of 3"', async () => {
    renderCarousel()
    expect(within(picker()).getAllByRole('button')).toHaveLength(3)
    await userEvent.click(screen.getByRole('button', { name: HERO_TEXT.nextSlide }))
    const slide = screen.getByRole('group', { name: '2 of 3' })
    expect(slide).toHaveAttribute('aria-roledescription', 'slide')
    expect(within(slide).getByRole('img')).toHaveAttribute('alt', SLIDE_B.alt)
  })

  it('points Previous and Next at the slides wrapper and keeps the active thumbnail focusable without the disabled attribute', () => {
    renderCarousel()
    const wrapper = visibleSlide(1).parentElement
    for (const name of [HERO_TEXT.previousSlide, HERO_TEXT.nextSlide]) {
      expect(screen.getByRole('button', { name })).toHaveAttribute('aria-controls', wrapper?.id)
    }
    expect(wrapper?.id).not.toBe('')
    expect(thumb(1)).not.toHaveAttribute('disabled')
    thumb(1).focus()
    expect(thumb(1)).toHaveFocus()
  })
})

describe('HeroCarousel photo source', () => {
  it('adds a 2x srcset only when a slide has a 2x photo', async () => {
    renderCarousel()
    expect(mainPhoto()).toHaveAttribute('srcset', '/a.jpg 1x, /a@2x.jpg 2x')
    expect(mainPhoto()).toHaveAttribute('width', '400')
    expect(mainPhoto()).toHaveAttribute('height', '522')
    await userEvent.click(thumb(2))
    expect(mainPhoto()).not.toHaveAttribute('srcset')
  })

  it('never lazy-loads the main photo', async () => {
    renderCarousel()
    expect(mainPhoto()).not.toHaveAttribute('loading', 'lazy')
    await userEvent.click(thumb(2))
    expect(mainPhoto()).not.toHaveAttribute('loading', 'lazy')
  })
})

describe('HeroCarousel arrow buttons', () => {
  it('renders Previous and Next with the same button look and an 18 px chevron', () => {
    renderCarousel()
    for (const name of [HERO_TEXT.previousSlide, HERO_TEXT.nextSlide]) {
      const arrow = screen.getByRole('button', { name })
      expect(arrow).toHaveAttribute('type', 'button')
      expect(arrow).toHaveClass('size-6', 'bg-primary', 'top-1/2', 'focus-visible:outline-dark')
      const chevron = arrow.querySelector('img')
      expect(chevron).toHaveAttribute('alt', '')
      expect(chevron).toHaveAttribute('width', '18')
      expect(chevron).toHaveAttribute('height', '18')
    }
  })

  it('keeps each arrow on its own side with its own chevron', () => {
    renderCarousel()
    const previous = screen.getByRole('button', { name: HERO_TEXT.previousSlide })
    const next = screen.getByRole('button', { name: HERO_TEXT.nextSlide })
    expect(previous).toHaveClass('-left-3')
    expect(previous).not.toHaveClass('-right-3')
    expect(previous.querySelector('img')).toHaveAttribute('src', '/icons/chevron-left.svg')
    expect(next).toHaveClass('-right-3')
    expect(next).not.toHaveClass('-left-3')
    expect(next.querySelector('img')).toHaveAttribute('src', '/icons/chevron-right.svg')
  })
})
