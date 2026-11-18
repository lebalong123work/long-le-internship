import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CHECKOUT_TEXT } from '@/constants/checkout'
import { OrderAmounts } from './OrderAmounts'

function amountOf(label: string): string {
  return screen.getByText(label).nextElementSibling?.textContent ?? ''
}

describe('OrderAmounts', () => {
  it('shows the subtotal and the total in the long format', () => {
    render(<OrderAmounts subtotal={80} shippingFee={0} total={80} />)
    expect(amountOf(CHECKOUT_TEXT.subtotal)).toBe('$80 USD')
    expect(amountOf(CHECKOUT_TEXT.total)).toBe('$80 USD')
  })

  it('shows Free shipping when the fee is 0', () => {
    render(<OrderAmounts subtotal={80} shippingFee={0} total={80} />)
    expect(amountOf(CHECKOUT_TEXT.shipping)).toBe(CHECKOUT_TEXT.freeShipping)
  })

  it('shows the shipping amount when the fee is above 0', () => {
    render(<OrderAmounts subtotal={80} shippingFee={5} total={85} />)
    expect(amountOf(CHECKOUT_TEXT.shipping)).toBe('$5 USD')
  })
})
