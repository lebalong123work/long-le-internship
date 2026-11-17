import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { SCRIPT_FOCUS_RING } from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { cn } from '@/utils/cn'
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb'
import type { Ref } from 'react'

interface PageBannerProps {
  title: string
  breadcrumb: BreadcrumbItem[]
  headingRef?: Ref<HTMLHeadingElement>
}

export function PageBanner({ title, breadcrumb, headingRef }: PageBannerProps): JSX.Element {
  const isFocusTarget = headingRef !== undefined

  return (
    <div className="rounded-5 bg-brand">
      <div className="container px-4 py-10 md:px-6 xl:h-[348px] xl:px-0 xl:pb-0 xl:pt-[31px]">
        <Breadcrumb items={breadcrumb} variant="light" />
        <h1
          ref={headingRef}
          tabIndex={isFocusTarget ? -1 : undefined}
          className={cn(
            'mt-6 font-heading text-h2 font-bold text-white xl:mt-8',
            isFocusTarget && [FOCUS_RING, SCRIPT_FOCUS_RING]
          )}
        >
          {title}
        </h1>
      </div>
    </div>
  )
}
