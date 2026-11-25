import { describe, expect, it } from 'vitest'
import indexHtml from '../../index.html?raw'
import { HERO_SLIDES, HERO_TEXT } from './hero'

const HERO_DIR = '/images/hero/'

const PUBLIC_HERO_FILES = new Set(
  Object.keys(import.meta.glob('../../public/images/hero/*')).map((file) =>
    file.replace('../../public', '')
  )
)

function slidePaths(): string[] {
  return HERO_SLIDES.flatMap((slide) =>
    [slide.imageSrc, slide.imageSrc2x, slide.thumbSrc].filter(
      (path): path is string => path !== undefined
    )
  )
}

function imagePreloads(): Element[] {
  const document = new DOMParser().parseFromString(indexHtml, 'text/html')
  return [...document.querySelectorAll('link[rel="preload"][as="image"]')]
}

describe('hero slides', () => {
  it('has three slides with unique ids', () => {
    expect(HERO_SLIDES).toHaveLength(3)
    expect(new Set(HERO_SLIDES.map((slide) => slide.id)).size).toBe(3)
  })

  it('has no slide with an empty alt text or image path', () => {
    for (const slide of HERO_SLIDES) {
      expect(slide.alt.trim()).not.toBe('')
      expect(slide.imageSrc.trim()).not.toBe('')
      expect(slide.thumbSrc.trim()).not.toBe('')
      if (slide.imageSrc2x !== undefined) expect(slide.imageSrc2x.trim()).not.toBe('')
    }
  })
})

describe('hero images', () => {
  it('points every slide at existing owner photo and thumbnail files', () => {
    for (const path of slidePaths()) expect(PUBLIC_HERO_FILES.has(path)).toBe(true)
  })

  it('uses only paths inside /images/hero/', () => {
    for (const path of slidePaths()) expect(path.startsWith(HERO_DIR)).toBe(true)
  })

  it('H1 never shows a small thumbnail file as the main slide photo', () => {
    for (const slide of HERO_SLIDES) {
      expect(slide.imageSrc).not.toMatch(/-thumb/)
      if (slide.imageSrc2x !== undefined) expect(slide.imageSrc2x).not.toMatch(/-thumb/)
    }
  })
})

describe('hero texts', () => {
  it('has non-empty hero texts', () => {
    const texts = [
      HERO_TEXT.title,
      HERO_TEXT.description,
      HERO_TEXT.shopNow,
      HERO_TEXT.carouselLabel,
      HERO_TEXT.pickerLabel,
      HERO_TEXT.previousSlide,
      HERO_TEXT.nextSlide,
    ]
    for (const text of texts) expect(text.trim()).not.toBe('')
  })

  it('builds slide names from the position, not the photo', () => {
    expect(HERO_TEXT.showSlide(2, 3)).toBe('Show slide 2 of 3')
    expect(HERO_TEXT.showSlide(3, 3)).toBe('Show slide 3 of 3')
    expect(HERO_TEXT.slidePosition(2, 3)).toBe('2 of 3')
    expect(HERO_TEXT.slideStatus(2, 3)).toBe('Slide 2 of 3')
  })
})

describe('hero preload in index.html', () => {
  it('index.html preloads the first slide photo with the same sources', () => {
    const [first] = HERO_SLIDES
    const preload = imagePreloads().find((link) => link.getAttribute('href') === first.imageSrc)
    expect(preload).toBeDefined()
    expect(preload?.getAttribute('fetchpriority')).toBe('high')
    expect(preload?.getAttribute('imagesrcset')).toBe(
      first.imageSrc2x === undefined ? null : `${first.imageSrc} 1x, ${first.imageSrc2x} 2x`
    )
  })

  it('index.html preloads no other hero photo', () => {
    const heroPreloads = imagePreloads().filter((link) =>
      (link.getAttribute('href') ?? '').startsWith(HERO_DIR)
    )
    expect(heroPreloads).toHaveLength(1)
  })
})
