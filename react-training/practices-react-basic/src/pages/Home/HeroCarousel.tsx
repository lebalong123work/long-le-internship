import { useId, useState } from 'react'
import { HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { HERO_TEXT } from '@/constants/hero'
import { useCarouselIndex } from '@/hooks/useCarouselIndex'
import { cn } from '@/utils/cn'
import type { SyntheticEvent } from 'react'
import type { HeroSlide } from '@/constants/hero'

type PhotoStage = 'responsive' | 'single' | 'failed'

interface HeroCarouselProps {
  slides: readonly HeroSlide[]
}

interface ArrowButtonProps {
  label: string
  iconSrc: string
  sideClassName: string
  controlsId: string
  onClick: () => void
}

const PHOTO_WIDTH = 400
const PHOTO_HEIGHT = 522
const CHEVRON_SIZE = 18
const PREVIOUS_ICON = '/icons/chevron-left.svg'
const NEXT_ICON = '/icons/chevron-right.svg'

const CAROUSEL_CLASSES = {
  frame: 'relative mx-auto w-full max-w-[400px] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]',
  photo:
    'block aspect-[400/522] w-full rounded-hero bg-[#99A799] object-cover ring-[10px] ring-white',
  strip: 'absolute bottom-6 left-1/2 z-10 h-20 w-[290px] -translate-x-1/2',
  picker:
    'flex size-full items-center gap-10 rounded-5 bg-black/50 shadow-thumb backdrop-blur-[2.5px]',
  arrow:
    'absolute top-1/2 z-10 flex size-6 -translate-y-1/2 items-center justify-center bg-primary',
  arrowPrevious: '-left-3',
  arrowNext: '-right-3',
  chevron: 'size-[18px]',
  thumb: 'shrink-0',
  thumbActive: 'size-20',
  thumbIdle: 'size-[60px]',
  thumbImage: 'block size-full object-cover',
  thumbFallback: 'block size-full bg-[#C4C4C4]',
  focus:
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dark focus-visible:ring-2 focus-visible:ring-white',
}

function initialStage(slide: HeroSlide): PhotoStage {
  return slide.imageSrc2x === undefined ? 'single' : 'responsive'
}

function absoluteUrl(path: string): string {
  return new URL(path, window.location.href).href
}

function stageAfterError(slide: HeroSlide, stage: PhotoStage, failedUrl: string): PhotoStage {
  if (stage === 'responsive' && failedUrl !== absoluteUrl(slide.imageSrc)) return 'single'
  return 'failed'
}

function photoSrcSet(slide: HeroSlide, stage: PhotoStage): string | undefined {
  if (stage !== 'responsive' || slide.imageSrc2x === undefined) return undefined
  return `${slide.imageSrc} 1x, ${slide.imageSrc2x} 2x`
}

function ArrowButton({
  label,
  iconSrc,
  sideClassName,
  controlsId,
  onClick,
}: ArrowButtonProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      aria-controls={controlsId}
      onClick={onClick}
      className={cn(CAROUSEL_CLASSES.arrow, sideClassName, CAROUSEL_CLASSES.focus, HOVER_OPACITY)}
    >
      <img
        src={iconSrc}
        alt=""
        width={CHEVRON_SIZE}
        height={CHEVRON_SIZE}
        className={CAROUSEL_CLASSES.chevron}
      />
    </button>
  )
}

export function HeroCarousel({ slides }: HeroCarouselProps): JSX.Element | null {
  const slidesId = useId()
  const { activeIndex, next, prev, goTo } = useCarouselIndex(slides.length)
  const [photoStages, setPhotoStages] = useState<ReadonlyMap<string, PhotoStage>>(new Map())
  const [failedThumbs, setFailedThumbs] = useState<ReadonlySet<string>>(new Set())

  if (slides.length === 0) return null

  const total = slides.length
  const slide = slides[activeIndex]
  const stage = photoStages.get(slide.imageSrc) ?? initialStage(slide)
  const hasControls = total > 1

  function handlePhotoError(event: SyntheticEvent<HTMLImageElement>): void {
    const nextStage = stageAfterError(slide, stage, event.currentTarget.currentSrc)
    setPhotoStages((current) => new Map(current).set(slide.imageSrc, nextStage))
  }

  function handleThumbError(thumbSrc: string): void {
    setFailedThumbs((current) => new Set(current).add(thumbSrc))
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={HERO_TEXT.carouselLabel}
      className={CAROUSEL_CLASSES.frame}
    >
      {hasControls && (
        <div className={CAROUSEL_CLASSES.strip}>
          <ArrowButton
            label={HERO_TEXT.previousSlide}
            iconSrc={PREVIOUS_ICON}
            sideClassName={CAROUSEL_CLASSES.arrowPrevious}
            controlsId={slidesId}
            onClick={prev}
          />
          <div role="group" aria-label={HERO_TEXT.pickerLabel} className={CAROUSEL_CLASSES.picker}>
            {slides.map((item, index) => {
              const isActive = index === activeIndex
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={HERO_TEXT.showSlide(index + 1, total)}
                  aria-disabled={isActive ? true : undefined}
                  onClick={() => goTo(index)}
                  className={cn(
                    CAROUSEL_CLASSES.thumb,
                    isActive ? CAROUSEL_CLASSES.thumbActive : CAROUSEL_CLASSES.thumbIdle,
                    CAROUSEL_CLASSES.focus,
                    !isActive && HOVER_OPACITY
                  )}
                >
                  {failedThumbs.has(item.thumbSrc) ? (
                    <span className={CAROUSEL_CLASSES.thumbFallback} />
                  ) : (
                    <img
                      src={item.thumbSrc}
                      alt=""
                      onError={() => handleThumbError(item.thumbSrc)}
                      className={CAROUSEL_CLASSES.thumbImage}
                    />
                  )}
                </button>
              )
            })}
          </div>
          <ArrowButton
            label={HERO_TEXT.nextSlide}
            iconSrc={NEXT_ICON}
            sideClassName={CAROUSEL_CLASSES.arrowNext}
            controlsId={slidesId}
            onClick={next}
          />
        </div>
      )}
      <div id={slidesId}>
        <div
          role="group"
          aria-roledescription="slide"
          aria-label={HERO_TEXT.slidePosition(activeIndex + 1, total)}
        >
          {stage === 'failed' ? (
            <div role="img" aria-label={slide.alt} className={CAROUSEL_CLASSES.photo} />
          ) : (
            <img
              src={slide.imageSrc}
              srcSet={photoSrcSet(slide, stage)}
              alt={slide.alt}
              width={PHOTO_WIDTH}
              height={PHOTO_HEIGHT}
              decoding="async"
              onError={handlePhotoError}
              className={CAROUSEL_CLASSES.photo}
            />
          )}
        </div>
      </div>
      {hasControls && (
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {HERO_TEXT.slideStatus(activeIndex + 1, total)}
        </p>
      )}
    </section>
  )
}
