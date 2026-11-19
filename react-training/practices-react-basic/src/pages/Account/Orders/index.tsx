import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { ACCOUNT_HEADING } from '@/components/shared/pageLayout'
import { Pagination } from '@/components/shared/Pagination'
import { focusWithVisibleRing, isFocusFree } from '@/components/ui/focusWithVisibleRing'
import { ORDER_HISTORY_TEXT } from '@/constants/order'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useFirstLoadRetry } from '@/hooks/useFirstLoadRetry'
import { useOrders } from '@/hooks/useOrders'
import { usePageParamSync } from '@/hooks/usePageParamSync'
import { cn } from '@/utils/cn'
import { pageHref, PAGE_PARAM } from '@/utils/pageSearchParams'
import { parsePageParam } from '@/utils/parsePageParam'
import { OrderCard } from './OrderCard'
import { OrderHistorySkeleton } from './OrderHistorySkeleton'
import type { ReactNode } from 'react'

const EMPTY_ORDERS_ICON = '/icons/bag-dark.svg'

export default function OrderHistory(): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [searchParams] = useSearchParams()
  const page = parsePageParam(searchParams.get(PAGE_PARAM))
  const { data, isPending, isFetching, isPlaceholderData, refetch } = useOrders(page)
  const { isRetrying, hasRecovered, retry } = useFirstLoadRetry(String(page), refetch)
  const shownPage = data !== undefined && !isPlaceholderData ? data.page : undefined
  const showSkeleton = data === undefined && isPending && !isRetrying

  usePageParamSync({ page, shownPage, scope: '', headingRef })

  useEffect(() => {
    if (hasRecovered && isFocusFree() && headingRef.current) {
      focusWithVisibleRing(headingRef.current)
    }
  }, [hasRecovered])

  function renderContent(): ReactNode {
    if (data !== undefined) {
      if (data.data.length === 0) {
        return (
          <EmptyState
            iconSrc={EMPTY_ORDERS_ICON}
            message={UI_STATE_MESSAGES.emptyOrders}
            action={{ label: ORDER_HISTORY_TEXT.shopNow, to: ROUTES.HOME }}
          />
        )
      }
      return (
        <>
          <ul
            aria-busy={isPlaceholderData || undefined}
            className={cn('flex flex-col gap-6', isPlaceholderData && 'opacity-50')}
          >
            {data.data.map((order) => (
              <li key={order.id}>
                <OrderCard order={order} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              hrefFor={(target) => pageHref(ROUTES.ACCOUNT.ORDERS, searchParams, target)}
            />
          </div>
        </>
      )
    }
    if (showSkeleton) {
      return (
        <div aria-busy="true">
          <OrderHistorySkeleton />
        </div>
      )
    }
    return <ErrorState onRetry={retry} isRetrying={isRetrying || isFetching} />
  }

  return (
    <div>
      <h1 ref={headingRef} tabIndex={-1} className={ACCOUNT_HEADING}>
        {ORDER_HISTORY_TEXT.heading}
      </h1>
      <p role="status" className="sr-only">
        {showSkeleton ? ORDER_HISTORY_TEXT.loading : ''}
      </p>
      <div className="mt-6">{renderContent()}</div>
    </div>
  )
}
