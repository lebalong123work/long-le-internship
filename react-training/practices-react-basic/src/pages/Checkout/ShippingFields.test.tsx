import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { checkoutSchema } from '@/schemas/checkout'
import { VALIDATION_MESSAGES } from '@/schemas/common'
import { ShippingFields } from './ShippingFields'
import type { CheckoutFormValues } from '@/schemas/checkout'

function Harness({ onValid }: { onValid: (values: CheckoutFormValues) => void }): JSX.Element {
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { fullName: '', phone: '', email: '', address: '', province: '', ward: '' },
  })
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(onValid)}>
        <ShippingFields />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  )
}

function renderFields() {
  const onValid = vi.fn()
  render(<Harness onValid={onValid} />)
  return { onValid }
}

function submit() {
  return userEvent.click(screen.getByRole('button', { name: 'Submit' }))
}

function optionNames(select: HTMLElement): string[] {
  return Array.from(select.querySelectorAll('option')).map((option) => option.textContent ?? '')
}

describe('ShippingFields', () => {
  it('shows an inline error under each required field on submit', async () => {
    const { onValid } = renderFields()
    await submit()
    expect(screen.getByLabelText('Full name')).toHaveAccessibleDescription(
      VALIDATION_MESSAGES.nameRequired
    )
    expect(screen.getByLabelText('Phone number')).toHaveAccessibleDescription(
      VALIDATION_MESSAGES.phoneRequired
    )
    expect(screen.getByLabelText('Address')).toHaveAccessibleDescription(
      VALIDATION_MESSAGES.addressRequired
    )
    expect(screen.getByLabelText('Province / City')).toHaveAccessibleDescription(
      VALIDATION_MESSAGES.provinceRequired
    )
    expect(onValid).not.toHaveBeenCalled()
  })

  it('keeps the ward / commune disabled until a province / city is chosen', async () => {
    renderFields()
    const ward = screen.getByLabelText('Ward / Commune')
    expect(ward).toBeDisabled()
    await userEvent.selectOptions(screen.getByLabelText('Province / City'), 'Hanoi')
    expect(ward).toBeEnabled()
  })

  it('lists the wards of the chosen province / city', async () => {
    renderFields()
    const province = screen.getByLabelText('Province / City')
    expect(optionNames(province)).toEqual([
      'Select a province / city',
      'Hanoi',
      'Ho Chi Minh City',
      'Da Nang',
      'Can Tho',
    ])
    await userEvent.selectOptions(province, 'Can Tho')
    expect(optionNames(screen.getByLabelText('Ward / Commune'))).toEqual([
      'Select a ward / commune',
      'Ninh Kieu',
      'Cai Khe',
      'Tan An',
      'An Binh',
    ])
  })

  it('resets the ward / commune and clears its error when the province / city changes', async () => {
    renderFields()
    const province = screen.getByLabelText('Province / City')
    const ward = screen.getByLabelText('Ward / Commune')
    await userEvent.selectOptions(province, 'Hanoi')
    await userEvent.selectOptions(ward, 'Ba Dinh')
    await userEvent.selectOptions(province, 'Da Nang')
    expect(ward).toHaveValue('')
    await submit()
    expect(ward).toHaveAccessibleDescription(VALIDATION_MESSAGES.wardRequired)
    await userEvent.selectOptions(province, 'Can Tho')
    expect(ward).toHaveValue('')
    expect(ward).not.toHaveAccessibleDescription(VALIDATION_MESSAGES.wardRequired)
    expect(ward).toHaveAttribute('aria-invalid', 'false')
  })

  it('gives the address fields autocomplete hints', () => {
    renderFields()
    expect(screen.getByLabelText('Full name')).toHaveAttribute('autocomplete', 'name')
    expect(screen.getByLabelText('Phone number')).toHaveAttribute('autocomplete', 'tel')
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'email')
    expect(screen.getByLabelText('Address')).toHaveAttribute('autocomplete', 'street-address')
  })
})
