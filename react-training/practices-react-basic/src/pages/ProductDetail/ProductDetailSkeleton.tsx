import { Skeleton } from '@/components/ui/Skeleton'
import { PRODUCT_DETAIL_LAYOUT } from './productDetailLayout'

export function ProductDetailSkeleton(): JSX.Element {
  return (
    <div aria-hidden="true">
      <div className="py-[9px]">
        <Skeleton className="h-[21px] w-[253px] max-w-full" />
      </div>
      <div className={PRODUCT_DETAIL_LAYOUT.columns}>
        <div className={PRODUCT_DETAIL_LAYOUT.gallery}>
          <Skeleton className="aspect-[588/400] w-full" />
          <div className="mt-6 grid grid-cols-3 gap-6">
            <Skeleton className="aspect-square" />
            <Skeleton className="aspect-square" />
            <Skeleton className="aspect-square" />
          </div>
        </div>
        <div className={PRODUCT_DETAIL_LAYOUT.info}>
          <Skeleton className="h-[52px] w-2/3" />
          <Skeleton className="mt-6 h-[90px] w-full" />
          <Skeleton className="mt-4 h-[18px] w-[122px]" />
          <Skeleton className="mt-6 h-[59px] w-[68px]" />
          <Skeleton className="mt-6 h-[67px] w-[132px]" />
          <Skeleton className="mt-6 h-[93px] w-[142px]" />
        </div>
      </div>
    </div>
  )
}
