import { useId } from 'react'
import { Link } from 'react-router-dom'
import { ProductThumbnail } from '@/components/shared/ProductThumbnail'
import { Button } from '@/components/ui/Button'
import { FOCUS_RING, LINK_HOVER_OPACITY } from '@/components/ui/interactionClasses'
import { CART_TEXT } from '@/constants/cart'
import { CHECKOUT_TEXT } from '@/constants/checkout'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { CHECKOUT_LAYOUT } from './checkoutLayout'
import { stockIssue } from './stockIssue'
import type { CartLine, CartSummary } from '@/hooks/useCartLines'

interface CheckoutSummaryProps {
  lines: CartLine[]
  summary: CartSummary
  isPlaceOrderBlocked: boolean
}

interface SummaryRowProps {
  line: CartLine
}

interface AmountRowProps {
  label: string
  value: string
  isTotal?: boolean
}

const SUMMARY_CLASSES = {
  section: 'flex flex-col gap-6 bg-light p-6',
  list: 'flex flex-col gap-4',
  row: 'flex gap-4',
  info: 'flex min-w-0 flex-col gap-1',
  name: 'break-words font-heading text-lg font-bold leading-normal text-dark',
  detail: 'font-body text-sm leading-normal text-medium-dark',
  issue: 'font-body text-sm font-bold leading-normal text-dark',
  divider: 'border-t-2 border-dashed border-light-medium',
  amounts: 'flex flex-col gap-2',
  amount: cn('flex justify-between gap-4', CHECKOUT_LAYOUT.bodyText),
  total: 'font-bold',
  blocked: 'flex flex-col gap-2 font-body text-sm leading-normal text-dark',
  cartLink: cn('w-fit font-bold underline', FOCUS_RING, LINK_HOVER_OPACITY),
}

function SummaryRow({ line }: SummaryRowProps): JSX.Element | null {
  const { item, product } = line
  if (product === null) return null
  const variant = CART_TEXT.variant(item.color, item.size)
  const issue = stockIssue(line)

  return (
    <li className={SUMMARY_CLASSES.row}>
      <ProductThumbnail product={product} />
      <div className={SUMMARY_CLASSES.info}>
        <p className={SUMMARY_CLASSES.name}>{product.name}</p>
        {variant && <p className={SUMMARY_CLASSES.detail}>{variant}</p>}
        <p className={SUMMARY_CLASSES.detail}>{CHECKOUT_TEXT.quantity(item.quantity)}</p>
        <p className={SUMMARY_CLASSES.name}>
          {formatCurrency(product.price * item.quantity, 'long')}
        </p>
        {issue && <p className={SUMMARY_CLASSES.issue}>{issue}</p>}
      </div>
    </li>
  )
}

function AmountRow({ label, value, isTotal = false }: AmountRowProps): JSX.Element {
  return (
    <div className={cn(SUMMARY_CLASSES.amount, isTotal && SUMMARY_CLASSES.total)}>
      <p>{label}</p>
      <p>{value}</p>
    </div>
  )
}

export function CheckoutSummary({
  lines,
  summary,
  isPlaceOrderBlocked,
}: CheckoutSummaryProps): JSX.Element {
  const blockedMessageId = useId()
  const shipping =
    summary.shippingFee === 0
      ? CHECKOUT_TEXT.freeShipping
      : formatCurrency(summary.shippingFee, 'long')

  return (
    <section aria-label={CART_TEXT.summaryLabel} className={SUMMARY_CLASSES.section}>
      <ul className={SUMMARY_CLASSES.list}>
        {lines.map((line) => (
          <SummaryRow key={line.item.id} line={line} />
        ))}
      </ul>
      <hr className={SUMMARY_CLASSES.divider} />
      <div className={SUMMARY_CLASSES.amounts}>
        <AmountRow
          label={CHECKOUT_TEXT.subtotal}
          value={formatCurrency(summary.subtotal, 'long')}
        />
        <AmountRow label={CHECKOUT_TEXT.shipping} value={shipping} />
        <AmountRow
          label={CHECKOUT_TEXT.total}
          value={formatCurrency(summary.total, 'long')}
          isTotal
        />
      </div>
      <Button
        type="submit"
        disabled={isPlaceOrderBlocked}
        aria-describedby={isPlaceOrderBlocked ? blockedMessageId : undefined}
        className="w-full"
      >
        {CHECKOUT_TEXT.placeOrder}
      </Button>
      {isPlaceOrderBlocked && (
        <div className={SUMMARY_CLASSES.blocked}>
          <p id={blockedMessageId}>{CHECKOUT_TEXT.stockProblem}</p>
          <Link to={ROUTES.CART} className={SUMMARY_CLASSES.cartLink}>
            {CHECKOUT_TEXT.backToCart}
          </Link>
        </div>
      )}
    </section>
  )
}
