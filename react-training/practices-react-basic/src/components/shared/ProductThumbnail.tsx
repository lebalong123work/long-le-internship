import { productImageSrc, usableImageSrc } from '@/utils/productImage'
import type { Product } from '@/types'

interface ImageThumbnailProps {
  src: string | undefined
}

interface ProductThumbnailProps {
  product: Product | null
}

const THUMBNAIL_CLASSES = 'size-20 shrink-0 bg-[#C4C4C4] object-cover'

export function ImageThumbnail({ src }: ImageThumbnailProps): JSX.Element {
  const usableSrc = usableImageSrc(src)
  if (usableSrc === undefined) return <div aria-hidden="true" className={THUMBNAIL_CLASSES} />
  return <img src={usableSrc} alt="" width={80} height={80} className={THUMBNAIL_CLASSES} />
}

export function ProductThumbnail({ product }: ProductThumbnailProps): JSX.Element {
  return <ImageThumbnail src={productImageSrc(product)} />
}
