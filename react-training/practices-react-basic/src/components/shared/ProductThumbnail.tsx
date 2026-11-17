import { productImageSrc } from '@/utils/productImage'
import type { Product } from '@/types'

interface ProductThumbnailProps {
  product: Product | null
}

const THUMBNAIL_CLASSES = 'size-20 shrink-0 bg-[#C4C4C4] object-cover'

export function ProductThumbnail({ product }: ProductThumbnailProps): JSX.Element {
  const src = productImageSrc(product)
  if (src === undefined) return <div aria-hidden="true" className={THUMBNAIL_CLASSES} />
  return <img src={src} alt="" width={80} height={80} className={THUMBNAIL_CLASSES} />
}
