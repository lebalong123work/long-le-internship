import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { ErrorState } from '@/components/shared/ErrorState'
import { ORDER_PAGE_LAYOUT } from '@/components/shared/orderPageLayout'
import { focusWithVisibleRing, isFocusFree } from '@/components/ui/focusWithVisibleRing'
import { FORM_ERROR_TEXT } from '@/components/ui/formClasses'
import { ORDER_LOOKUP_TEXT } from '@/constants/order'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { useGuestOrderLookup } from '@/hooks/useOrders'
import { useSubmitLock } from '@/hooks/useSubmitLock'
import { isNotFoundError } from '@/services/apiClient'
import { parseOrderNumber } from '@/utils/orderNumber'
import { orderNumberFromState } from './orderLookupState'
import { OrderLookupForm } from './OrderLookupForm'
import { OrderLookupResult } from './OrderLookupResult'
import type { ReactNode } from 'react'
import type { OrderLookupFormValues } from '@/schemas/orderLookup'
import type { GuestOrderLookup } from '@/types'

export default function OrderLookup(): JSX.Element {
  const location = useLocation()
  const submitLock = useSubmitLock()
  const formAreaRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { data, error, isError, isIdle, isPending, variables, mutateAsync, reset } =
    useGuestOrderLookup()

  useEffect(() => {
    if (!data || !headingRef.current) return
    const focused = document.activeElement
    const isFocusInForm = focused !== null && formAreaRef.current?.contains(focused) === true
    if (isFocusFree() || isFocusInForm) focusWithVisibleRing(headingRef.current)
  }, [data])

  function runLookup(request: GuestOrderLookup): void {
    if (!submitLock.acquire()) return
    void mutateAsync(request)
      .catch(() => undefined)
      .finally(() => submitLock.release())
  }

  function submit({ email, orderNumber }: OrderLookupFormValues): void {
    runLookup({ email, orderId: parseOrderNumber(orderNumber) })
  }

  function clearOutcome(): void {
    if (!isIdle) reset()
  }

  function retry(): void {
    if (variables) runLookup(variables)
  }

  function renderOutcome(): ReactNode {
    if (data) return <OrderLookupResult order={data} headingRef={headingRef} />
    if (!isError) return null
    if (isNotFoundError(error)) {
      return (
        <p role="alert" className={FORM_ERROR_TEXT}>
          {UI_STATE_MESSAGES.orderNotFound}
        </p>
      )
    }
    return <ErrorState onRetry={retry} />
  }

  return (
    <div className={ORDER_PAGE_LAYOUT.container}>
      <div className={ORDER_PAGE_LAYOUT.column}>
        <div className={ORDER_PAGE_LAYOUT.header}>
          <h1 className={ORDER_PAGE_LAYOUT.title}>{ORDER_LOOKUP_TEXT.title}</h1>
          <p className={ORDER_PAGE_LAYOUT.subtitle}>{ORDER_LOOKUP_TEXT.intro}</p>
        </div>
        <div ref={formAreaRef}>
          <OrderLookupForm
            defaultOrderNumber={orderNumberFromState(location.state)}
            isSubmitting={isPending}
            onValidSubmit={submit}
            onFieldChange={clearOutcome}
          />
        </div>
        {renderOutcome()}
      </div>
    </div>
  )
}
