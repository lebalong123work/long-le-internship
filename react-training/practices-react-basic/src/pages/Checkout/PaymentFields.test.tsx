import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { checkoutSchema } from '@/schemas/checkout'
import { VALIDATION_MESSAGES } from '@/schemas/common'
import { PaymentFields } from './PaymentFields'
import type { CheckoutFormValues } from '@/schemas/checkout'

function Harness(): JSX.Element {
  const form = useForm<CheckoutFormValues>({ resolver: zodResolver(checkoutSchema) })
  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={form.handleSubmit(() => undefined)}>
        <PaymentFields />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  )
}

function group() {
  return screen.getByRole('group', { name: 'Payment method' })
}

describe('PaymentFields', () => {
  it('offers three payment methods with none selected', () => {
    render(<Harness />)
    const radios = within(group()).getAllByRole('radio')
    expect(radios.map((radio) => radio.getAttribute('value'))).toEqual([
      'cod',
      'bank-transfer',
      'credit-card',
    ])
    for (const radio of radios) expect(radio).not.toBeChecked()
    expect(screen.getByRole('radio', { name: 'Cash on delivery (COD)' })).toBeInTheDocument()
  })

  it('reports a missing payment method on the group', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }))
    expect(group()).toHaveAccessibleDescription(VALIDATION_MESSAGES.paymentMethodRequired)
    expect(screen.getByRole('radio', { name: 'Bank transfer' })).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })

  it('shows the mock bank details only for bank transfer', async () => {
    render(<Harness />)
    expect(screen.queryByText('Bank: Mock Bank')).toBeNull()
    await userEvent.click(screen.getByRole('radio', { name: 'Bank transfer' }))
    expect(screen.getByText('Bank: Mock Bank')).toBeInTheDocument()
    expect(screen.getByText('Account number: 0000 0000 0000')).toBeInTheDocument()
    expect(screen.getByText('Demo only — no real payment')).toBeInTheDocument()
  })

  it('shows the credit card option as a notice without any card field', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: 'Credit card (mock)' }))
    expect(
      screen.getByText('Demo only — no real payment. Card details are not collected.')
    ).toBeInTheDocument()
    expect(within(group()).queryAllByRole('textbox')).toHaveLength(0)
    expect(group().querySelectorAll('input:not([type="radio"])')).toHaveLength(0)
  })

  it('shows no extra details for cash on delivery', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('radio', { name: 'Cash on delivery (COD)' }))
    expect(screen.queryByText('Bank: Mock Bank')).toBeNull()
    expect(screen.queryByText(/Card details are not collected/)).toBeNull()
  })
})
