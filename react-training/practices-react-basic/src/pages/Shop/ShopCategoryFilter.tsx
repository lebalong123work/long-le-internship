import { Link } from 'react-router-dom'
import { TAB_LOOK } from '@/components/ui/tabClasses'
import { CATEGORY_LIST_LABEL } from '@/constants/categories'
import { SHOP_FILTERS } from '@/constants/shop'
import { cn } from '@/utils/cn'
import { shopHref } from '@/utils/shopSearchParams'
import type { CategorySlug } from '@/constants/categories'

interface ShopCategoryFilterProps {
  active: CategorySlug | undefined
}

const FILTER_CLASSES = {
  list: 'flex flex-wrap gap-x-6 gap-y-4 md:gap-x-10',
  link: [TAB_LOOK.base, 'can-hover:hover:text-primary'],
} as const

export function ShopCategoryFilter({ active }: ShopCategoryFilterProps): JSX.Element {
  return (
    <nav aria-label={CATEGORY_LIST_LABEL}>
      <ul className={FILTER_CLASSES.list}>
        {SHOP_FILTERS.map((item) => {
          const isActive = item.category === active
          return (
            <li key={item.id}>
              <Link
                to={shopHref(item.category)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(FILTER_CLASSES.link, isActive ? TAB_LOOK.active : TAB_LOOK.idle)}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
