import { CHECKOUT_TEXT } from '@/constants/checkout'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatCurrency'
import { ORDER_SUMMARY_CLASSES } from './orderSummaryClasses'

interface OrderAmountsProps {
  subtotal: number
  shippingFee: number
  total: number
}

interface AmountRowProps {
  label: string
  value: string
  isTotal?: boolean
}

function AmountRow({ label, value, isTotal = false }: AmountRowProps): JSX.Element {
  return (
    <div className={cn(ORDER_SUMMARY_CLASSES.amount, isTotal && ORDER_SUMMARY_CLASSES.total)}>
      <p>{label}</p>
      <p>{value}</p>
    </div>
  )
}

export function OrderAmounts({ subtotal, shippingFee, total }: OrderAmountsProps): JSX.Element {
  const shipping =
    shippingFee === 0 ? CHECKOUT_TEXT.freeShipping : formatCurrency(shippingFee, 'long')

  return (
    <div className={ORDER_SUMMARY_CLASSES.amounts}>
      <AmountRow label={CHECKOUT_TEXT.subtotal} value={formatCurrency(subtotal, 'long')} />
      <AmountRow label={CHECKOUT_TEXT.shipping} value={shipping} />
      <AmountRow label={CHECKOUT_TEXT.total} value={formatCurrency(total, 'long')} isTotal />
    </div>
  )
}
