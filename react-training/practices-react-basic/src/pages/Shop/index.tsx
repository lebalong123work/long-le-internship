import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PAGE_CONTAINER, PAGE_HEADING } from '@/components/shared/pageLayout'
import { Pagination } from '@/components/shared/Pagination'
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/ProductGrid'
import { focusWithVisibleRing, isFocusFree } from '@/components/ui/focusWithVisibleRing'
import { ROUTES } from '@/constants/routes'
import { SHOP_TEXT } from '@/constants/shop'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useFirstLoadRetry } from '@/hooks/useFirstLoadRetry'
import { usePageParamSync } from '@/hooks/usePageParamSync'
import { useShopProducts } from '@/hooks/useProducts'
import { PRODUCTS_PER_PAGE } from '@/services/productService'
import { cn } from '@/utils/cn'
import { pageHref, PAGE_PARAM } from '@/utils/pageSearchParams'
import { parsePageParam } from '@/utils/parsePageParam'
import { CATEGORY_PARAM, parseCategoryParam } from '@/utils/shopSearchParams'
import { ShopCategoryFilter } from './ShopCategoryFilter'
import type { ReactNode } from 'react'

const EMPTY_ICON = '/icons/cart.svg'

export default function Shop(): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [searchParams] = useSearchParams()
  const category = parseCategoryParam(searchParams.get(CATEGORY_PARAM))
  const page = parsePageParam(searchParams.get(PAGE_PARAM))
  const scope = category ?? ''
  const { data, isPending, isFetching, isPlaceholderData, refetch } = useShopProducts(
    category,
    page
  )
  const { isRetrying, hasRecovered, retry } = useFirstLoadRetry(`${scope}\n${page}`, refetch)
  const shownPage = data !== undefined && !isPlaceholderData ? data.page : undefined
  const showSkeleton = data === undefined && isPending && !isRetrying

  usePageParamSync({ page, shownPage, scope, headingRef })

  useEffect(() => {
    if (hasRecovered && isFocusFree() && headingRef.current) {
      focusWithVisibleRing(headingRef.current)
    }
  }, [hasRecovered])

  function renderContent(): ReactNode {
    if (data !== undefined) {
      if (data.data.length === 0) {
        return <EmptyState iconSrc={EMPTY_ICON} message={UI_STATE_MESSAGES.emptyCategory} />
      }
      return (
        <>
          <h2 className="sr-only">{SHOP_TEXT.gridHeading}</h2>
          <div aria-busy={isPlaceholderData || undefined}>
            <ProductGrid
              products={data.data}
              className={cn('justify-start', isPlaceholderData && 'opacity-50')}
            />
          </div>
          <div className="mt-10">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              hrefFor={(target) => pageHref(ROUTES.SHOP, searchParams, target)}
            />
          </div>
        </>
      )
    }
    if (showSkeleton) {
      return (
        <div aria-busy="true">
          <ProductGridSkeleton count={PRODUCTS_PER_PAGE} className="justify-start" />
        </div>
      )
    }
    return <ErrorState onRetry={retry} isRetrying={isRetrying || isFetching} />
  }

  return (
    <div className={PAGE_CONTAINER}>
      <h1 ref={headingRef} tabIndex={-1} className={PAGE_HEADING}>
        {SHOP_TEXT.heading}
      </h1>
      <div className="mt-6">
        <ShopCategoryFilter active={category} />
      </div>
      <p role="status" className="sr-only">
        {showSkeleton ? UI_STATE_MESSAGES.loadingProducts : ''}
      </p>
      <div className="mt-10">{renderContent()}</div>
    </div>
  )
}
