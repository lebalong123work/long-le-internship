import { Skeleton } from '@/components/ui/Skeleton'
import { PROFILE_FORM_LAYOUT } from './profileFormClasses'

const FIELD_COUNT = 5

export function ProfileFormSkeleton(): JSX.Element {
  return (
    <div className={PROFILE_FORM_LAYOUT.columns}>
      <Skeleton className="size-20 shrink-0" />
      <div className={PROFILE_FORM_LAYOUT.fields}>
        {Array.from({ length: FIELD_COUNT }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
        <Skeleton className="h-12 w-full md:w-[180px]" />
      </div>
    </div>
  )
}
