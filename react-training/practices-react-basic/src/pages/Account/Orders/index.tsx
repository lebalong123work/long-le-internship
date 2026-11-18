import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Pagination } from '@/components/shared/Pagination'
import {
  focusWithVisibleRing,
  isFocusFree,
  SCRIPT_FOCUS_RING,
} from '@/components/ui/focusWithVisibleRing'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { ORDER_HISTORY_TEXT } from '@/constants/order'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useFirstLoadRetry } from '@/hooks/useFirstLoadRetry'
import { useOrders } from '@/hooks/useOrders'
import { cn } from '@/utils/cn'
import { parsePageParam } from '@/utils/parsePageParam'
import { OrderCard } from './OrderCard'
import { OrderHistorySkeleton } from './OrderHistorySkeleton'
import type { ReactNode } from 'react'

const EMPTY_ORDERS_ICON = '/icons/bag-dark.svg'
const PAGE_PARAM = 'page'

function withPage(params: URLSearchParams, page: number): URLSearchParams {
  const next = new URLSearchParams(params)
  if (page > 1) next.set(PAGE_PARAM, String(page))
  else next.delete(PAGE_PARAM)
  return next
}

function pageHref(params: URLSearchParams, page: number): string {
  const search = withPage(params, page).toString()
  return search === '' ? ROUTES.ACCOUNT.ORDERS : `${ROUTES.ACCOUNT.ORDERS}?${search}`
}

export default function OrderHistory(): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePageParam(searchParams.get(PAGE_PARAM))
  const { data, isPending, isFetching, isPlaceholderData, refetch } = useOrders(page)
  const { isRetrying, hasRecovered, retry } = useFirstLoadRetry(String(page), refetch)
  const shownPage = data !== undefined && !isPlaceholderData ? data.page : undefined
  const lastShownPage = useRef(shownPage)
  const showSkeleton = data === undefined && isPending && !isRetrying

  useEffect(() => {
    if (shownPage === undefined || shownPage === page) return
    setSearchParams((current) => withPage(current, shownPage), { replace: true })
  }, [shownPage, page, setSearchParams])

  useEffect(() => {
    if (shownPage === undefined) return
    const previous = lastShownPage.current
    lastShownPage.current = shownPage
    if (previous !== undefined && previous !== shownPage && headingRef.current) {
      window.scrollTo({ top: 0 })
      focusWithVisibleRing(headingRef.current)
    }
  }, [shownPage])

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
              hrefFor={(target) => pageHref(searchParams, target)}
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
      <h1
        ref={headingRef}
        tabIndex={-1}
        className={cn('font-heading text-h3 font-bold text-dark', FOCUS_RING, SCRIPT_FOCUS_RING)}
      >
        {ORDER_HISTORY_TEXT.heading}
      </h1>
      <p role="status" className="sr-only">
        {showSkeleton ? ORDER_HISTORY_TEXT.loading : ''}
      </p>
      <div className="mt-6">{renderContent()}</div>
    </div>
  )
}
