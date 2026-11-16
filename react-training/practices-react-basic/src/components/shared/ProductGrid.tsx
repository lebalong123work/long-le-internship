import { ProductCard } from '@/components/shared/ProductCard'
import { CARD_INFO_PADDING } from '@/components/shared/productCardClasses'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn } from '@/utils/cn'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  className?: string
}

interface ProductGridSkeletonProps {
  count: number
  className?: string
}

const GRID_CLASSES =
  'grid grid-cols-[repeat(2,minmax(0,theme(maxWidth.card)))] justify-center gap-4 md:grid-cols-[repeat(3,minmax(0,theme(maxWidth.card)))] md:gap-6 xl:grid-cols-[repeat(4,minmax(0,theme(maxWidth.card)))] xl:gap-10'

const SKELETON_BAR = 'h-[21px]'

function skeletonCount(count: number): number {
  return Number.isFinite(count) && count >= 1 ? Math.floor(count) : 0
}

function SkeletonCard(): JSX.Element {
  return (
    <div className="w-full max-w-card bg-white shadow-card">
      <Skeleton className="aspect-card w-full" />
      <div className={CARD_INFO_PADDING}>
        <Skeleton className={cn(SKELETON_BAR, 'w-2/3')} />
        <Skeleton className={cn(SKELETON_BAR, 'mt-1 w-1/3')} />
        <Skeleton className="mt-[13px] h-[18px] w-[106px]" />
      </div>
    </div>
  )
}

export function ProductGrid({ products, className }: ProductGridProps): JSX.Element | null {
  if (products.length === 0) return null

  return (
    <ul className={cn(GRID_CLASSES, className)}>
      {products.map((product) => (
        <li key={product.id} className="flex">
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  )
}

export function ProductGridSkeleton({
  count,
  className,
}: ProductGridSkeletonProps): JSX.Element | null {
  const cards = skeletonCount(count)
  if (cards === 0) return null

  return (
    <div aria-hidden="true" className={cn(GRID_CLASSES, className)}>
      {Array.from({ length: cards }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}
