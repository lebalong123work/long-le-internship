import { useParams } from 'react-router-dom'
import { OrderPage } from '@/components/shared/OrderPage'
import { ORDER_PAGE_LAYOUT } from '@/components/shared/orderPageLayout'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { ORDER_TEXT } from '@/constants/order'
import { ROUTES } from '@/constants/routes'

const ACTION_COUNT = 1

function renderActions(): JSX.Element {
  return (
    <ButtonLink to={ROUTES.SHOP} className={ORDER_PAGE_LAYOUT.action}>
      {ORDER_TEXT.continueShopping}
    </ButtonLink>
  )
}

export default function GuestOrderDetails(): JSX.Element {
  const { orderId } = useParams()

  return (
    <OrderPage
      orderId={orderId}
      title={ORDER_TEXT.detailsTitle}
      actionCount={ACTION_COUNT}
      renderActions={renderActions}
    />
  )
}
