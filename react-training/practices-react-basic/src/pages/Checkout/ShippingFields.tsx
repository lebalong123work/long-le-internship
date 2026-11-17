import { useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { CHECKOUT_TEXT } from '@/constants/checkout'
import { PROVINCE_CITY_NAMES, wardsOf } from '@/constants/provinceCities'
import { CHECKOUT_LAYOUT } from './checkoutLayout'
import type { CheckoutFormValues } from '@/schemas/checkout'

export function ShippingFields(): JSX.Element {
  const {
    register,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext<CheckoutFormValues>()
  const wards = wardsOf(watch('province') ?? '')

  function resetWard(): void {
    setValue('ward', '')
    clearErrors('ward')
  }

  return (
    <fieldset className={CHECKOUT_LAYOUT.fieldset}>
      <legend className={CHECKOUT_LAYOUT.legend}>{CHECKOUT_TEXT.shippingLegend}</legend>
      <Input
        {...register('fullName')}
        label={CHECKOUT_TEXT.fullName}
        autoComplete="name"
        error={errors.fullName?.message}
      />
      <Input
        {...register('phone')}
        label={CHECKOUT_TEXT.phone}
        type="tel"
        autoComplete="tel"
        error={errors.phone?.message}
      />
      <Input
        {...register('email')}
        label={CHECKOUT_TEXT.email}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
      />
      <Input
        {...register('address')}
        label={CHECKOUT_TEXT.address}
        autoComplete="street-address"
        error={errors.address?.message}
      />
      <div className={CHECKOUT_LAYOUT.pair}>
        <Select
          {...register('province', { onChange: resetWard })}
          label={CHECKOUT_TEXT.province}
          placeholder={CHECKOUT_TEXT.provincePlaceholder}
          options={PROVINCE_CITY_NAMES}
          error={errors.province?.message}
        />
        <Select
          {...register('ward')}
          label={CHECKOUT_TEXT.ward}
          placeholder={CHECKOUT_TEXT.wardPlaceholder}
          options={wards}
          disabled={wards.length === 0}
          error={errors.ward?.message}
        />
      </div>
      <Input {...register('note')} label={CHECKOUT_TEXT.note} error={errors.note?.message} />
    </fieldset>
  )
}
