import { useId } from 'react'
import { useFormContext } from 'react-hook-form'
import { FORM_ERROR_TEXT } from '@/components/ui/formClasses'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { BANK_TRANSFER_DETAILS, CHECKOUT_TEXT, PAYMENT_OPTIONS } from '@/constants/checkout'
import { cn } from '@/utils/cn'
import { CHECKOUT_LAYOUT } from './checkoutLayout'
import type { CheckoutFormValues } from '@/schemas/checkout'
import type { PaymentMethod } from '@/types/order'

interface PaymentDetailsProps {
  method: PaymentMethod | undefined
}

const PAYMENT_CLASSES = {
  option: cn('flex items-center gap-4', CHECKOUT_LAYOUT.bodyText),
  radio: cn('size-5 shrink-0 accent-primary', FOCUS_RING),
  details: cn('flex flex-col gap-2 bg-light p-6', CHECKOUT_LAYOUT.bodyText),
  notice: 'font-bold',
}

function PaymentDetails({ method }: PaymentDetailsProps): JSX.Element | null {
  if (method === 'bank-transfer') {
    return (
      <div className={PAYMENT_CLASSES.details}>
        {BANK_TRANSFER_DETAILS.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p className={PAYMENT_CLASSES.notice}>{CHECKOUT_TEXT.demoPayment}</p>
      </div>
    )
  }
  if (method === 'credit-card') {
    return (
      <div className={PAYMENT_CLASSES.details}>
        <p className={PAYMENT_CLASSES.notice}>{CHECKOUT_TEXT.cardNotice}</p>
      </div>
    )
  }
  return null
}

interface PaymentFieldsProps {
  disabled?: boolean
}

export function PaymentFields({ disabled = false }: PaymentFieldsProps): JSX.Element {
  const errorId = useId()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>()
  const error = errors.paymentMethod?.message

  return (
    <fieldset
      disabled={disabled}
      aria-describedby={error ? errorId : undefined}
      className={CHECKOUT_LAYOUT.fieldset}
    >
      <legend className={CHECKOUT_LAYOUT.legend}>{CHECKOUT_TEXT.paymentLegend}</legend>
      {PAYMENT_OPTIONS.map(({ value, label }) => (
        <label key={value} className={PAYMENT_CLASSES.option}>
          <input
            {...register('paymentMethod')}
            type="radio"
            value={value}
            aria-invalid={Boolean(error)}
            className={PAYMENT_CLASSES.radio}
          />
          {label}
        </label>
      ))}
      {error && (
        <p id={errorId} className={FORM_ERROR_TEXT}>
          {error}
        </p>
      )}
      <PaymentDetails method={watch('paymentMethod')} />
    </fieldset>
  )
}
