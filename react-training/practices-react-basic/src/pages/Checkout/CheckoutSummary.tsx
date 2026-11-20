import { useId } from 'react'
import { Link } from 'react-router-dom'
import { OrderAmounts } from '@/components/shared/OrderAmounts'
import { OrderLineItem } from '@/components/shared/OrderLineItem'
import { ORDER_SUMMARY_CLASSES } from '@/components/shared/orderSummaryClasses'
import { Button } from '@/components/ui/Button'
import { FOCUS_RING, LINK_HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { CART_TEXT } from '@/constants/cart'
import { CHECKOUT_TEXT } from '@/constants/checkout'
import { ROUTES } from '@/constants/routes'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { productImageSrc } from '@/utils/productImage'
import { stockIssue } from './stockIssue'
import type { CartLine, CartSummary } from '@/hooks/useCartLines'

export type PlaceOrderBlock = 'stock' | 'mergePending' | null

interface CheckoutSummaryProps {
  lines: CartLine[]
  summary: CartSummary
  placeOrderBlock: PlaceOrderBlock
  isPlacing?: boolean
}

interface SummaryRowProps {
  line: CartLine
}

interface BlockedMessageProps {
  block: Exclude<PlaceOrderBlock, null>
  messageId: string
}

const SUMMARY_CLASSES = {
  issue: 'font-body text-sm font-bold leading-normal text-dark',
  blocked: 'flex flex-col gap-2 font-body text-sm leading-normal text-dark',
  cartLink: cn('w-fit font-bold underline', FOCUS_RING, LINK_HOVER_OPACITY),
}

function SummaryRow({ line }: SummaryRowProps): JSX.Element | null {
  const { item, product } = line
  if (product === null) return null
  const issue = stockIssue(line)

  return (
    <OrderLineItem
      imageSrc={productImageSrc(product)}
      name={product.name}
      variantLabel={CART_TEXT.variant(item.color, item.size)}
      quantityLabel={CHECKOUT_TEXT.quantity(item.quantity)}
      lineTotalLabel={formatCurrency(product.price * item.quantity, 'long')}
    >
      {issue && <p className={SUMMARY_CLASSES.issue}>{issue}</p>}
    </OrderLineItem>
  )
}

function BlockedMessage({ block, messageId }: BlockedMessageProps): JSX.Element {
  if (block === 'mergePending') {
    return (
      <p id={messageId} className={SUMMARY_CLASSES.blocked}>
        {TOAST_MESSAGES.cart.mergePending}
      </p>
    )
  }
  return (
    <div className={SUMMARY_CLASSES.blocked}>
      <p id={messageId}>{CHECKOUT_TEXT.stockProblem}</p>
      <Link to={ROUTES.CART} className={SUMMARY_CLASSES.cartLink}>
        {CHECKOUT_TEXT.backToCart}
      </Link>
    </div>
  )
}

export function CheckoutSummary({
  lines,
  summary,
  placeOrderBlock,
  isPlacing = false,
}: CheckoutSummaryProps): JSX.Element {
  const blockedMessageId = useId()

  return (
    <section aria-label={CART_TEXT.summaryLabel} className={ORDER_SUMMARY_CLASSES.section}>
      <ul className={ORDER_SUMMARY_CLASSES.list}>
        {lines.map((line) => (
          <SummaryRow key={line.item.id} line={line} />
        ))}
      </ul>
      <hr className={ORDER_SUMMARY_CLASSES.divider} />
      <OrderAmounts
        subtotal={summary.subtotal}
        shippingFee={summary.shippingFee}
        total={summary.total}
      />
      <Button
        type="submit"
        disabled={placeOrderBlock !== null}
        isLoading={isPlacing}
        aria-describedby={placeOrderBlock ? blockedMessageId : undefined}
        className="w-full"
      >
        {CHECKOUT_TEXT.placeOrder}
      </Button>
      {placeOrderBlock && <BlockedMessage block={placeOrderBlock} messageId={blockedMessageId} />}
    </section>
  )
}
