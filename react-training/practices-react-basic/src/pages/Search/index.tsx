import { useEffect, useRef } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PAGE_CONTAINER, PAGE_HEADING } from '@/components/shared/pageLayout'
import { Pagination } from '@/components/shared/Pagination'
import { ProductGrid, ProductGridSkeleton } from '@/components/shared/ProductGrid'
import { focusWithVisibleRing, isFocusFree } from '@/components/ui/focusWithVisibleRing'
import { ROUTES } from '@/constants/routes'
import { SEARCH_ICON_SRC, SEARCH_RESULTS_TEXT } from '@/constants/search'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useFirstLoadRetry } from '@/hooks/useFirstLoadRetry'
import { usePageParamSync } from '@/hooks/usePageParamSync'
import { useSearchResults } from '@/hooks/useSearch'
import { normalizeQuery, SEARCH_RESULTS_PER_PAGE } from '@/services/searchService'
import { cn } from '@/utils/cn'
import { pageHref, PAGE_PARAM } from '@/utils/pageSearchParams'
import { parsePageParam } from '@/utils/parsePageParam'
import type { ReactNode } from 'react'

const QUERY_PARAM = 'q'

export default function Search(): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [searchParams] = useSearchParams()
  const query = normalizeQuery(searchParams.get(QUERY_PARAM) ?? '')
  const page = parsePageParam(searchParams.get(PAGE_PARAM))
  const { data, isPending, isFetching, isPlaceholderData, refetch } = useSearchResults(query, page)
  const { isRetrying, hasRecovered, retry } = useFirstLoadRetry(`${query}\n${page}`, refetch)
  const shownPage = data !== undefined && !isPlaceholderData ? data.page : undefined
  const showSkeleton = data === undefined && isPending && !isRetrying

  usePageParamSync({ page, shownPage, scope: query, headingRef })

  useEffect(() => {
    if (hasRecovered && isFocusFree() && headingRef.current) {
      focusWithVisibleRing(headingRef.current)
    }
  }, [hasRecovered])

  if (query === '') return <Navigate to={ROUTES.HOME} replace />

  function renderContent(): ReactNode {
    if (data !== undefined) {
      if (data.data.length === 0) {
        return (
          <EmptyState
            iconSrc={SEARCH_ICON_SRC}
            message={UI_STATE_MESSAGES.noSearchResults(query)}
            hint={UI_STATE_MESSAGES.searchHint}
          />
        )
      }
      return (
        <>
          <h2 className="sr-only">{SEARCH_RESULTS_TEXT.gridHeading}</h2>
          <div aria-busy={isPlaceholderData || undefined}>
            <ProductGrid products={data.data} className={cn(isPlaceholderData && 'opacity-50')} />
          </div>
          <div className="mt-10">
            <Pagination
              page={data.page}
              totalPages={data.totalPages}
              hrefFor={(target) => pageHref(ROUTES.SEARCH, searchParams, target)}
            />
          </div>
        </>
      )
    }
    if (showSkeleton) {
      return (
        <div aria-busy="true">
          <ProductGridSkeleton count={SEARCH_RESULTS_PER_PAGE} />
        </div>
      )
    }
    return <ErrorState onRetry={retry} isRetrying={isRetrying || isFetching} />
  }

  const total = data !== undefined && data.total > 0 ? data.total : undefined

  return (
    <div className={PAGE_CONTAINER}>
      <h1 ref={headingRef} tabIndex={-1} className={cn(PAGE_HEADING, 'break-words')}>
        {SEARCH_RESULTS_TEXT.heading(query)}
      </h1>
      {total !== undefined && (
        <p className="mt-2 font-heading text-lg leading-normal text-medium-dark">
          {SEARCH_RESULTS_TEXT.count(total)}
        </p>
      )}
      <p role="status" className="sr-only">
        {showSkeleton ? SEARCH_RESULTS_TEXT.loading : ''}
      </p>
      <div className="mt-6">{renderContent()}</div>
    </div>
  )
}
