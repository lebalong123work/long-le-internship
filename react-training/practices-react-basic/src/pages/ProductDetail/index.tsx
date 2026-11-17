import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { ROUTES } from '@/constants/routes'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useProduct } from '@/hooks/useProducts'
import { isNotFoundError } from '@/services/apiClient'
import { ProductDetailSkeleton } from './ProductDetailSkeleton'
import { ProductDetailView } from './ProductDetailView'
import { SameProductSection } from './SameProductSection'
import type { ReactNode } from 'react'

const NOT_FOUND_ICON = '/icons/search.svg'

interface RetryState {
  productId: string
  phase: 'retrying' | 'focusHeading'
}

function NotFoundState(): JSX.Element {
  return (
    <EmptyState
      iconSrc={NOT_FOUND_ICON}
      message={UI_STATE_MESSAGES.productNotFound}
      action={{ label: UI_STATE_MESSAGES.backToHome, to: ROUTES.HOME }}
    />
  )
}

function settledRetry(
  current: RetryState | null,
  productId: string,
  succeeded: boolean
): RetryState | null {
  if (current?.productId !== productId || current.phase !== 'retrying') return current
  return succeeded ? { productId, phase: 'focusHeading' } : null
}

export default function ProductDetail(): JSX.Element {
  const { productId } = useParams()
  const [shownProductId, setShownProductId] = useState(productId)
  const [retry, setRetry] = useState<RetryState | null>(null)
  const { data, isPending, isFetching, error, refetch } = useProduct(productId)

  if (productId !== shownProductId) {
    setShownProductId(productId)
    setRetry(null)
  }

  const isCurrentRetry = retry !== null && retry.productId === productId
  const isRetrying = isCurrentRetry && retry.phase === 'retrying'
  const showSkeleton = data === undefined && productId !== undefined && !isRetrying && isPending

  async function retryProduct(id: string): Promise<void> {
    setRetry({ productId: id, phase: 'retrying' })
    const result = await refetch()
    setRetry((current) => settledRetry(current, id, result.status === 'success'))
  }

  function renderContent(): ReactNode {
    if (data !== undefined) {
      return (
        <>
          <ProductDetailView
            key={data.id}
            product={data}
            focusHeadingOnMount={isCurrentRetry && retry.phase === 'focusHeading'}
          />
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
    return (
      <ErrorState
        onRetry={() => {
          void retryProduct(productId)
        }}
        isRetrying={isRetrying || isFetching}
      />
    )
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
