import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { SIDEBAR_LAYOUT } from '@/components/shared/pageLayout'
import { checkoutSchema } from '@/schemas/checkout'
import { cn } from '@/utils/cn'
import { CheckoutSummary } from './CheckoutSummary'
import { PaymentFields } from './PaymentFields'
import { ShippingFields } from './ShippingFields'
import type { DefaultValues } from 'react-hook-form'
import type { CartLine, CartSummary } from '@/hooks/useCartLines'
import type { CheckoutFormValues } from '@/schemas/checkout'

interface CheckoutFormProps {
  lines: CartLine[]
  summary: CartSummary
  isPlaceOrderBlocked: boolean
  defaultValues: DefaultValues<CheckoutFormValues>
  onValidSubmit: (values: CheckoutFormValues) => void
}

export function CheckoutForm({
  lines,
  summary,
  isPlaceOrderBlocked,
  defaultValues,
  onValidSubmit,
}: CheckoutFormProps): JSX.Element {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  })

  return (
    <FormProvider {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onValidSubmit)}
        className={SIDEBAR_LAYOUT.columns}
      >
        <div className={cn(SIDEBAR_LAYOUT.main, 'gap-10')}>
          <ShippingFields />
          <PaymentFields />
        </div>
        <div className={SIDEBAR_LAYOUT.aside}>
          <CheckoutSummary
            lines={lines}
            summary={summary}
            isPlaceOrderBlocked={isPlaceOrderBlocked}
          />
        </div>
      </form>
    </FormProvider>
  )
}
