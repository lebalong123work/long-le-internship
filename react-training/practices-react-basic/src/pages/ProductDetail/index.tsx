import { useParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useFirstLoadRetry } from '@/hooks/useFirstLoadRetry'
import { useProduct } from '@/hooks/useProducts'
import { isNotFoundError } from '@/services/apiClient'
import { ProductDetailSkeleton } from './ProductDetailSkeleton'
import { ProductDetailView } from './ProductDetailView'
import { SameProductSection } from './SameProductSection'
import type { ReactNode } from 'react'

const NOT_FOUND_ICON = '/icons/search.svg'

function NotFoundState(): JSX.Element {
  return (
    <EmptyState
      iconSrc={NOT_FOUND_ICON}
      message={UI_STATE_MESSAGES.productNotFound}
      action={{ label: UI_STATE_MESSAGES.backToHome, to: ROUTES.HOME }}
    />
  )
}

export default function ProductDetail(): JSX.Element {
  const { productId } = useParams()
  const { data, isPending, isFetching, error, refetch } = useProduct(productId)
  const { isRetrying, hasRecovered, retry } = useFirstLoadRetry(productId, refetch)
  const showSkeleton = data === undefined && productId !== undefined && !isRetrying && isPending

  function renderContent(): ReactNode {
    if (data !== undefined) {
      return (
        <>
          <ProductDetailView key={data.id} product={data} focusHeadingOnMount={hasRecovered} />
          <SameProductSection product={data} />
        </>
      )
    }
    if (productId === undefined) return <NotFoundState />
    if (showSkeleton) {
      return (
        <div aria-busy="true">
          <ProductDetailSkeleton />
        </div>
      )
    }
    if (!isRetrying && isNotFoundError(error)) return <NotFoundState />
    return <ErrorState onRetry={retry} isRetrying={isRetrying || isFetching} />
  }

  return (
    <div className="container px-4 pb-10 pt-[31px] md:px-6 xl:px-0 xl:pb-16">
      <p role="status" className="sr-only">
        {showSkeleton ? PRODUCT_DETAIL_TEXT.loading : ''}
      </p>
      {renderContent()}
    </div>
  )
}
