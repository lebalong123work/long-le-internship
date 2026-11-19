import { cn } from '@/utils/cn'
import { productImageSrc, usableImageSrc } from '@/utils/productImage'
import type { Product } from '@/types'

interface ImageThumbnailProps {
  src: string | undefined
  className?: string
}

interface ProductThumbnailProps {
  product: Product | null
}

const THUMBNAIL_CLASSES = 'size-20 shrink-0 bg-[#C4C4C4] object-cover'

export function ImageThumbnail({ src, className }: ImageThumbnailProps): JSX.Element {
  const usableSrc = usableImageSrc(src)
  const classes = cn(THUMBNAIL_CLASSES, className)
  if (usableSrc === undefined) return <div aria-hidden="true" className={classes} />
  return <img src={usableSrc} alt="" width={80} height={80} className={classes} />
}

export function ProductThumbnail({ product }: ProductThumbnailProps): JSX.Element {
  return <ImageThumbnail src={productImageSrc(product)} />
}
