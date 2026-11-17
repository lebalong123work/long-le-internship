import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { CART_TEXT } from '@/constants/cart'
import { ROUTES } from '@/constants/routes'
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb'

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: CART_TEXT.breadcrumbHome, to: ROUTES.HOME },
  { label: CART_TEXT.breadcrumbCart },
]

export function CartBanner(): JSX.Element {
  return (
    <div className="rounded-5 bg-brand">
      <div className="container px-4 py-10 md:px-6 xl:h-[348px] xl:px-0 xl:pb-0 xl:pt-[31px]">
        <Breadcrumb items={BREADCRUMB_ITEMS} variant="light" />
        <h1 className="mt-6 font-heading text-h2 font-bold text-white xl:mt-8">
          {CART_TEXT.title}
        </h1>
      </div>
    </div>
  )
}
