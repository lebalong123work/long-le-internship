import { useId } from 'react'
import { Button } from '@/components/ui/Button'
import { ButtonLink } from '@/components/ui/ButtonLink'
import { CART_TEXT } from '@/constants/cart'
import { ROUTES } from '@/constants/routes'
import { formatCurrency } from '@/utils/formatCurrency'
import { CART_LAYOUT } from './cartLayout'
import type { CartSummary } from '@/hooks/useCartLines'

interface OrderSummaryProps {
  summary: CartSummary
  isCheckoutBlocked: boolean
}

const SUMMARY_CLASSES = {
  section: 'bg-light px-6 pb-9 pt-[43px] xl:w-[378px] xl:shrink-0',
  count: CART_LAYOUT.detailText,
  divider: 'mt-6 border-t-2 border-dashed border-light-medium',
  totalRow: 'mt-[22px] flex justify-between gap-4 font-heading text-lg leading-normal text-dark',
  action: 'mt-6 flex flex-col md:items-end',
  checkout: 'w-full md:w-[180px]',
  blocked: CART_LAYOUT.noticeText,
}

export function OrderSummary({ summary, isCheckoutBlocked }: OrderSummaryProps): JSX.Element {
  const blockedMessageId = useId()

  return (
    <section aria-label={CART_TEXT.summaryLabel} className={SUMMARY_CLASSES.section}>
      <p className={SUMMARY_CLASSES.count}>{CART_TEXT.productCount(summary.itemCount)}</p>
      <hr className={SUMMARY_CLASSES.divider} />
      <div className={SUMMARY_CLASSES.totalRow}>
        <p className="font-bold">{CART_TEXT.total}</p>
        <p>{formatCurrency(summary.total, 'long')}</p>
      </div>
      <div className={SUMMARY_CLASSES.action}>
        {isCheckoutBlocked ? (
          <>
            <Button
              disabled
              aria-describedby={blockedMessageId}
              className={SUMMARY_CLASSES.checkout}
            >
              {CART_TEXT.checkout}
            </Button>
            <p id={blockedMessageId} className={SUMMARY_CLASSES.blocked}>
              {CART_TEXT.checkoutBlocked}
            </p>
          </>
        ) : (
          <ButtonLink to={ROUTES.CHECKOUT} className={SUMMARY_CLASSES.checkout}>
            {CART_TEXT.checkout}
          </ButtonLink>
        )}
      </div>
    </section>
  )
}
