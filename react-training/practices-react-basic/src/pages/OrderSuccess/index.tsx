import { useParams } from 'react-router-dom'
import { OrderPage } from '@/components/shared/OrderPage'
import { ORDER_PAGE_LAYOUT } from '@/components/shared/orderPageLayout'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ORDER_TEXT } from '@/constants/order'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Order } from '@/types'

const SUCCESS_ICON = '/icons/check-circle.svg'

interface GuestOrderNoteProps {
  order: Order
}

interface ViewOrderTarget {
  to: string
  state?: { orderNumber: string }
}

function GuestOrderNote({ order }: GuestOrderNoteProps): JSX.Element {
  return (
    <>
      <p className={ORDER_PAGE_LAYOUT.subtitle}>
        {ORDER_TEXT.guestEmail(order.shippingAddress.email)}
      </p>
      <p className={ORDER_PAGE_LAYOUT.subtitle}>{ORDER_TEXT.saveOrderNumber}</p>
    </>
  )
}

function viewOrderTarget(order: Order, isAuthenticated: boolean): ViewOrderTarget {
  if (isAuthenticated) return { to: ROUTES.ACCOUNT.ORDERS }
  return { to: ROUTES.ORDER_LOOKUP, state: { orderNumber: ORDER_TEXT.orderNumber(order.id) } }
}

export default function OrderSuccess(): JSX.Element {
  const { orderId } = useParams()
  const { isAuthenticated } = useAuth()

  function renderActions(order: Order): JSX.Element {
    return (
      <>
        <ButtonLink to={ROUTES.SHOP} className={ORDER_PAGE_LAYOUT.action}>
          {ORDER_TEXT.continueShopping}
        </ButtonLink>
        <ButtonLink
          {...viewOrderTarget(order, isAuthenticated)}
          variant="light"
          className={ORDER_PAGE_LAYOUT.action}
        >
          {ORDER_TEXT.viewOrder}
        </ButtonLink>
      </>
    )
  }

  function renderNote(order: Order): JSX.Element | null {
    return isAuthenticated ? null : <GuestOrderNote order={order} />
  }

  return (
    <OrderPage
      orderId={orderId}
      title={ORDER_TEXT.successTitle}
      iconSrc={SUCCESS_ICON}
      renderActions={renderActions}
      renderNote={renderNote}
    />
  )
}
