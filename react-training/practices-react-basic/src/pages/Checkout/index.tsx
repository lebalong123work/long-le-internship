import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { ErrorState } from '@/components/shared/ErrorState'
import { PageBanner } from '@/components/shared/PageBanner'
import { focusWithVisibleRing, isFocusFree } from '@/components/ui/focusWithVisibleRing'
import { CHECKOUT_TEXT } from '@/constants/checkout'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import { useCartLines } from '@/hooks/useCartLines'
import { CheckoutForm } from './CheckoutForm'
import { CheckoutSkeleton } from './CheckoutSkeleton'
import { hasStockIssue } from './stockIssue'
import type { BreadcrumbItem } from '@/components/ui/Breadcrumb'
import type { ReactNode } from 'react'
import type { DefaultValues } from 'react-hook-form'
import type { CheckoutFormValues } from '@/schemas/checkout'
import type { User } from '@/types'

const BREADCRUMB_ITEMS: BreadcrumbItem[] = [
  { label: CHECKOUT_TEXT.breadcrumbHome, to: ROUTES.HOME },
  { label: CHECKOUT_TEXT.breadcrumbCart, to: ROUTES.CART },
  { label: CHECKOUT_TEXT.breadcrumbCheckout },
]

function checkoutDefaults(user: User | null): DefaultValues<CheckoutFormValues> {
  return {
    fullName: user?.name ?? '',
    phone: '',
    email: user?.email ?? '',
    address: '',
    province: '',
    ward: '',
    note: '',
  }
}

function submitCheckout(): void {}

export default function Checkout(): JSX.Element {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const retryRequested = useRef(false)
  const { user } = useAuth()
  const { status, lines, summary, hasUnavailableItems, retry, isRetrying } = useCartLines()

  useEffect(() => {
    if (!retryRequested.current || isRetrying) return
    retryRequested.current = false
    if (status !== 'error' && isFocusFree() && headingRef.current) {
      focusWithVisibleRing(headingRef.current)
    }
  }, [status, isRetrying])

  function retryLoading(): void {
    retryRequested.current = true
    retry()
  }

  function renderContent(): ReactNode {
    if (status === 'loading') {
      return (
        <div aria-busy="true">
          <CheckoutSkeleton />
        </div>
      )
    }
    if (status === 'error') return <ErrorState onRetry={retryLoading} isRetrying={isRetrying} />
    if (status === 'empty' || hasUnavailableItems) return <Navigate to={ROUTES.CART} replace />
    return (
      <CheckoutForm
        lines={lines}
        summary={summary}
        isPlaceOrderBlocked={hasStockIssue(lines)}
        defaultValues={checkoutDefaults(user)}
        onValidSubmit={submitCheckout}
      />
    )
  }

  return (
    <div className="pb-10 xl:pb-16">
      <PageBanner
        title={CHECKOUT_TEXT.title}
        breadcrumb={BREADCRUMB_ITEMS}
        headingRef={headingRef}
      />
      <div className="container px-4 md:px-6 xl:px-0">
        <p role="status" className="sr-only">
          {status === 'loading' ? CHECKOUT_TEXT.loading : ''}
        </p>
        <div className="mt-10 xl:mt-20">{renderContent()}</div>
      </div>
    </div>
  )
}
