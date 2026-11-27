import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ORDER_LOOKUP_TEXT } from '@/constants/order'
import { orderLookupSchema } from '@/schemas/orderLookup'
import type { OrderLookupFormValues } from '@/schemas/orderLookup'

interface OrderLookupFormProps {
  defaultOrderNumber: string
  isSubmitting: boolean
  onValidSubmit: (values: OrderLookupFormValues) => void
  onFieldChange: () => void
}

export function OrderLookupForm({
  defaultOrderNumber,
  isSubmitting,
  onValidSubmit,
  onFieldChange,
}: OrderLookupFormProps): JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderLookupFormValues>({
    resolver: zodResolver(orderLookupSchema),
    defaultValues: { email: '', orderNumber: defaultOrderNumber },
  })

  return (
    <form
      noValidate
      onSubmit={(event) => void handleSubmit(onValidSubmit)(event)}
      className="flex flex-col gap-6"
    >
      <Input
        label={ORDER_LOOKUP_TEXT.emailLabel}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email', { onChange: onFieldChange })}
      />
      <Input
        label={ORDER_LOOKUP_TEXT.orderNumberLabel}
        placeholder={ORDER_LOOKUP_TEXT.orderNumberPlaceholder}
        autoComplete="off"
        error={errors.orderNumber?.message}
        {...register('orderNumber', { onChange: onFieldChange })}
      />
      <Button type="submit" isLoading={isSubmitting} className="w-full">
        {ORDER_LOOKUP_TEXT.submit}
      </Button>
    </form>
  )
}
