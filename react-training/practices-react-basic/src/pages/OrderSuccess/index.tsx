import { useParams } from 'react-router-dom'
import { OrderPage } from '@/components/shared/OrderPage'
import { ORDER_PAGE_LAYOUT } from '@/components/shared/orderPageLayout'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ORDER_TEXT } from '@/constants/order'
import { ROUTES } from '@/constants/routes'
import { useAuth } from '@/hooks/useAuth'
import type { Order } from '@/types'

const SUCCESS_ICON = '/icons/check-circle.svg'
const ACTION_COUNT = 2

export default function OrderSuccess(): JSX.Element {
  const { orderId } = useParams()
  const { isAuthenticated } = useAuth()

  function renderActions(order: Order): JSX.Element {
    const viewOrderPath = isAuthenticated ? ROUTES.ACCOUNT.ORDERS : ROUTES.ORDER(order.id)
    return (
      <>
        <ButtonLink to={ROUTES.SHOP} className={ORDER_PAGE_LAYOUT.action}>
          {ORDER_TEXT.continueShopping}
        </ButtonLink>
        <ButtonLink to={viewOrderPath} variant="light" className={ORDER_PAGE_LAYOUT.action}>
          {ORDER_TEXT.viewOrder}
        </ButtonLink>
      </>
    )
  }

  return (
    <OrderPage
      orderId={orderId}
      title={ORDER_TEXT.successTitle}
      iconSrc={SUCCESS_ICON}
      actionCount={ACTION_COUNT}
      renderActions={renderActions}
    />
  )
}
