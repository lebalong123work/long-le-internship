import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { product } from '@/test/fixtures'
import { CheckoutForm } from './CheckoutForm'
import type { CartLine, CartSummary } from '@/hooks/useCartLines'
import type { CheckoutFormValues } from '@/schemas/checkout'

const LINES: CartLine[] = [
  {
    item: { id: 'p1__Black__S', productId: 'p1', color: 'Black', size: 'S', quantity: 2 },
    product: { ...product('p1'), name: 'Tee One', price: 40 },
  },
]
const SUMMARY: CartSummary = { itemCount: 2, subtotal: 80, shippingFee: 0, total: 80 }

function renderForm() {
  const onValidSubmit = vi.fn<(values: CheckoutFormValues) => void>()
  render(
    <MemoryRouter>
      <CheckoutForm
        lines={LINES}
        summary={SUMMARY}
        placeOrderBlock={null}
        defaultValues={{ fullName: 'Test Customer', email: 'user@store.com', phone: '' }}
        onValidSubmit={onValidSubmit}
      />
    </MemoryRouter>
  )
  return { onValidSubmit }
}

function placeOrder() {
  return userEvent.click(screen.getByRole('button', { name: 'Place Order' }))
}

describe('CheckoutForm', () => {
  it('starts from the given defaults with no payment method selected', () => {
    renderForm()
    expect(screen.getByLabelText('Full name')).toHaveValue('Test Customer')
    expect(screen.getByLabelText('Email')).toHaveValue('user@store.com')
    expect(screen.getByLabelText('Phone number')).toHaveValue('')
    for (const radio of screen.getAllByRole('radio')) expect(radio).not.toBeChecked()
  })

  it('focuses the first invalid field and does not submit invalid values', async () => {
    const { onValidSubmit } = renderForm()
    await placeOrder()
    expect(screen.getByLabelText('Phone number')).toHaveFocus()
    expect(onValidSubmit).not.toHaveBeenCalled()
  })

  it('hands the parsed values to onValidSubmit once', async () => {
    const { onValidSubmit } = renderForm()
    await userEvent.type(screen.getByLabelText('Phone number'), '0901234567')
    await userEvent.type(screen.getByLabelText('Address'), ' 1 Le Loi ')
    await userEvent.selectOptions(screen.getByLabelText('Province / City'), 'Hanoi')
    await userEvent.selectOptions(screen.getByLabelText('Ward / Commune'), 'Cua Nam')
    await userEvent.click(screen.getByRole('radio', { name: 'Bank transfer' }))
    await placeOrder()
    expect(onValidSubmit).toHaveBeenCalledTimes(1)
    expect(onValidSubmit.mock.calls[0][0]).toEqual({
      fullName: 'Test Customer',
      phone: '0901234567',
      email: 'user@store.com',
      address: '1 Le Loi',
      province: 'Hanoi',
      ward: 'Cua Nam',
      note: '',
      paymentMethod: 'bank-transfer',
    })
  })

  it('has exactly one submit button for both columns', () => {
    renderForm()
    const form = screen.getByRole('button', { name: 'Place Order' }).closest('form')
    expect(form?.querySelectorAll('[type="submit"]')).toHaveLength(1)
    expect(form).toContainElement(screen.getByRole('region', { name: 'Order summary' }))
    expect(form).toContainElement(screen.getByRole('group', { name: 'Shipping address' }))
  })
})
