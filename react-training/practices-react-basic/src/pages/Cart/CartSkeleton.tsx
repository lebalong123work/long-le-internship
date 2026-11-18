import { Skeleton } from '@/components/ui/Skeleton'
import { CART_LAYOUT } from './cartLayout'

const SKELETON_ROWS = [0, 1]

export function CartSkeleton(): JSX.Element {
  return (
    <div className={CART_LAYOUT.columns}>
      <div className={CART_LAYOUT.list}>
        {SKELETON_ROWS.map((row) => (
          <Skeleton key={row} className="h-[245px]" />
        ))}
      </div>
      <Skeleton className="h-[245px] xl:w-[378px] xl:shrink-0" />
    </div>
  )
}
