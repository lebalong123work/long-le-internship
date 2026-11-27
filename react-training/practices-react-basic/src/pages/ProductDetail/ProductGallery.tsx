import { useEffect, useId, useRef, useState } from 'react'
import { CarouselArrowButton } from '@/components/ui/CarouselArrowButton'
import { FOCUS_RING, HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { useCarouselIndex } from '@/hooks/useCarouselIndex'
import { cn } from '@/utils/cn'
import { scrollLeftToShow } from '@/utils/stripScroll'
import type { SyntheticEvent } from 'react'
import type { ProductImage } from '@/types'

type PhotoStage = 'responsive' | 'single' | 'failed'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

interface MainPhotoProps {
  image: ProductImage
  alt: string
}

const EAGER_THUMB_COUNT = 3

const GALLERY_CLASSES = {
  main: 'relative aspect-[588/400] w-full bg-[#C4C4C4]',
  mainImage:
    'size-full object-cover transition-opacity duration-300 ease-out motion-reduce:transition-none',
  stripFrame: 'relative mt-5',
  strip:
    'relative -m-1 flex gap-6 overflow-x-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  arrowPrevious: 'left-1',
  arrowNext: 'right-1',
  thumb: 'aspect-square w-[calc((100%-48px)/3)] shrink-0 bg-[#C4C4C4]',
  thumbCurrent: 'outline outline-1 -outline-offset-1 outline-black',
  thumbImage: 'block size-full object-cover',
}

function initialStage(image: ProductImage): PhotoStage {
  return image.src2x === undefined ? 'single' : 'responsive'
}

function absoluteUrl(path: string): string {
  return new URL(path, window.location.href).href
}

function stageAfterError(image: ProductImage, stage: PhotoStage, failedUrl: string): PhotoStage {
  if (stage === 'responsive' && failedUrl !== absoluteUrl(image.src)) return 'single'
  return 'failed'
}

function photoSrcSet(image: ProductImage, stage: PhotoStage): string | undefined {
  if (stage !== 'responsive' || image.src2x === undefined) return undefined
  return `${image.src} 1x, ${image.src2x} 2x`
}

function MainPhoto({ image, alt }: MainPhotoProps): JSX.Element {
  const [stage, setStage] = useState<PhotoStage>(() => initialStage(image))
  const [isLoaded, setIsLoaded] = useState(false)

  function handleError(event: SyntheticEvent<HTMLImageElement>): void {
    setStage(stageAfterError(image, stage, event.currentTarget.currentSrc))
  }

  if (stage === 'failed') {
    return <div role="img" aria-label={alt} className="size-full" />
  }

  return (
    <img
      key={stage}
      src={image.src}
      srcSet={photoSrcSet(image, stage)}
      alt={alt}
      width={588}
      height={400}
      decoding="async"
      onLoad={() => setIsLoaded(true)}
      onError={handleError}
      className={cn(GALLERY_CLASSES.mainImage, isLoaded ? 'opacity-100' : 'opacity-0')}
    />
  )
}

export function ProductGallery({ images, productName }: ProductGalleryProps): JSX.Element {
  const total = images.length
  const mainPhotoId = useId()
  const stripRef = useRef<HTMLDivElement>(null)
  const { activeIndex, next, prev, goTo } = useCarouselIndex(total)
  const [failedThumbs, setFailedThumbs] = useState<ReadonlySet<string>>(new Set())
  const image = images[activeIndex]
  const position = activeIndex + 1

  useEffect(() => {
    const strip = stripRef.current
    const thumb = strip?.children.item(activeIndex)
    if (strip === null || !(thumb instanceof HTMLElement)) return
    strip.scrollLeft = scrollLeftToShow(
      { left: thumb.offsetLeft, width: thumb.offsetWidth },
      { scrollLeft: strip.scrollLeft, width: strip.clientWidth }
    )
  }, [activeIndex])

  function handleThumbError(thumbSrc: string): void {
    setFailedThumbs((current) => new Set(current).add(thumbSrc))
  }

  return (
    <div className="flex flex-col">
      <div id={mainPhotoId} className={GALLERY_CLASSES.main}>
        <MainPhoto
          key={image.src}
          image={image}
          alt={PRODUCT_DETAIL_TEXT.mainPhotoAlt(productName, position, total)}
        />
      </div>
      {total > 1 && (
        <>
          <div className={GALLERY_CLASSES.stripFrame}>
            <CarouselArrowButton
              label={PRODUCT_DETAIL_TEXT.previousPhoto}
              direction="previous"
              controlsId={mainPhotoId}
              onClick={prev}
              className={GALLERY_CLASSES.arrowPrevious}
            />
            <div
              ref={stripRef}
              role="group"
              aria-label={PRODUCT_DETAIL_TEXT.choosePhoto}
              className={GALLERY_CLASSES.strip}
            >
              {images.map((thumbImage, index) => {
                const thumbSrc = thumbImage.thumbnailSrc ?? thumbImage.src
                const isCurrent = index === activeIndex
                return (
                  <button
                    key={`${index}-${thumbImage.src}`}
                    type="button"
                    aria-label={PRODUCT_DETAIL_TEXT.showPhoto(index + 1, total)}
                    aria-disabled={isCurrent ? true : undefined}
                    onClick={() => goTo(index)}
                    className={cn(
                      GALLERY_CLASSES.thumb,
                      isCurrent ? GALLERY_CLASSES.thumbCurrent : HOVER_OPACITY,
                      FOCUS_RING
                    )}
                  >
                    {!failedThumbs.has(thumbSrc) && (
                      <img
                        src={thumbSrc}
                        alt=""
                        width={180}
                        height={180}
                        loading={index < EAGER_THUMB_COUNT ? undefined : 'lazy'}
                        onError={() => handleThumbError(thumbSrc)}
                        className={GALLERY_CLASSES.thumbImage}
                      />
                    )}
                  </button>
                )
              })}
            </div>
            <CarouselArrowButton
              label={PRODUCT_DETAIL_TEXT.nextPhoto}
              direction="next"
              controlsId={mainPhotoId}
              onClick={next}
              className={GALLERY_CLASSES.arrowNext}
            />
          </div>
          <p role="status" aria-atomic="true" className="sr-only">
            {PRODUCT_DETAIL_TEXT.photoStatus(position, total)}
          </p>
        </>
      )}
    </div>
  )
}
