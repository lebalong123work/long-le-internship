export interface HeroSlide {
  id: string
  imageSrc: string
  imageSrc2x?: string
  thumbSrc: string
  alt: string
}

const WOMAN_PHOTO = '/images/hero/IrQmtib-ER4-main.jpg'
const MAN_SLIDE = {
  imageSrc: '/images/hero/GREEBEtyR9Y-main.jpg',
  imageSrc2x: '/images/hero/GREEBEtyR9Y-main@2x.jpg',
  thumbSrc: '/images/hero/GREEBEtyR9Y-thumb.jpg',
  alt: 'Man in a white printed T-shirt',
}

export const HERO_SLIDES: readonly HeroSlide[] = [
  {
    id: 'woman',
    imageSrc: WOMAN_PHOTO,
    thumbSrc: WOMAN_PHOTO,
    alt: 'Smiling woman in a white T-shirt and jeans',
  },
  { id: 'man-1', ...MAN_SLIDE },
  { id: 'man-2', ...MAN_SLIDE },
]

function slidePosition(position: number, total: number): string {
  return `${position} of ${total}`
}

export const HERO_TEXT = {
  title: 'Get the Latest Dress Models From Us',
  description:
    'Discover everyday clothing at Mangcoding Store — comfortable T-shirts, shirts, jackets and jeans picked for your style.',
  shopNow: 'Shop Now',
  carouselLabel: 'Featured photos',
  pickerLabel: 'Choose slide',
  previousSlide: 'Previous slide',
  nextSlide: 'Next slide',
  showSlide: (position: number, total: number): string =>
    `Show slide ${slidePosition(position, total)}`,
  slidePosition,
  slideStatus: (position: number, total: number): string =>
    `Slide ${slidePosition(position, total)}`,
} as const
