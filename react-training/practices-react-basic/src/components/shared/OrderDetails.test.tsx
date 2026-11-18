import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { CHECKOUT_TEXT, PAYMENT_METHOD_LABELS } from '@/constants/checkout'
import { ORDER_TEXT } from '@/constants/order'
import { OrderDetails } from './OrderDetails'
import type { Order, OrderItem, PaymentMethod } from '@/types'

const ITEM: OrderItem = {
  productId: 'p1',
  name: 'Smart T-Shirt',
  price: 40,
  image: '/images/products/p1.jpg',
  color: 'Black',
  size: 'S',
  quantity: 2,
}

const ORDER: Order = {
  id: 'MHY_ZdStguw',
  userId: 'u1',
  items: [ITEM],
  shippingAddress: {
    fullName: 'Test Customer',
    phone: '0912345678',
    email: 'user@store.com',
    address: '1 Trang Tien',
    province: 'Hanoi',
    ward: 'Hoan Kiem',
  },
  paymentMethod: 'cod',
  subtotal: 80,
  shippingFee: 0,
  total: 80,
  status: 'pending',
  createdAt: '2026-11-17T08:00:00.000Z',
}

function withItem(changes: Partial<OrderItem>): Order {
  return { ...ORDER, items: [{ ...ITEM, ...changes }] }
}

function withNote(note: string | undefined): Order {
  return { ...ORDER, shippingAddress: { ...ORDER.shippingAddress, note } }
}

function productList(): HTMLElement {
  return screen.getByRole('list')
}

function amountOf(label: string): string {
  return screen.getByText(label).nextElementSibling?.textContent ?? ''
}

describe('OrderDetails', () => {
  it('shows each line with name, variant, quantity and line total', () => {
    render(<OrderDetails order={ORDER} />)
    const line = within(productList()).getByRole('listitem')
    expect(within(line).getByText('Smart T-Shirt')).toBeInTheDocument()
    expect(within(line).getByText('Color : Black · Size : S')).toBeInTheDocument()
    expect(within(line).getByText('Qty 2')).toBeInTheDocument()
    expect(within(line).getByText('$80 USD')).toBeInTheDocument()
  })

  it('hides the variant line when the item has no color and no size', () => {
    render(<OrderDetails order={withItem({ color: '', size: '' })} />)
    const line = within(productList()).getByRole('listitem')
    expect(within(line).queryByText(/Color :|Size :/)).toBeNull()
  })

  it('shows the stored item image', () => {
    const { container } = render(<OrderDetails order={ORDER} />)
    expect(container.querySelector('img')).toHaveAttribute('src', '/images/products/p1.jpg')
  })

  it('shows the neutral box when the stored image is empty', () => {
    const { container } = render(<OrderDetails order={withItem({ image: '' })} />)
    expect(container.querySelector('img')).toBeNull()
  })

  it('shows the shipping address lines under their heading', () => {
    render(<OrderDetails order={ORDER} />)
    expect(
      screen.getByRole('heading', { level: 2, name: CHECKOUT_TEXT.shippingLegend })
    ).toBeInTheDocument()
    expect(screen.getByText('Test Customer')).toBeInTheDocument()
    expect(screen.getByText('0912345678')).toBeInTheDocument()
    expect(screen.getByText('user@store.com')).toBeInTheDocument()
    expect(screen.getByText('1 Trang Tien, Hoan Kiem, Hanoi')).toBeInTheDocument()
  })

  it('hides the note line when the note is blank', () => {
    render(<OrderDetails order={withNote('   ')} />)
    expect(screen.queryByText(/^Note:/)).toBeNull()
  })

  it('shows the note line when the note is filled', () => {
    render(<OrderDetails order={withNote('Leave at the door')} />)
    expect(screen.getByText(ORDER_TEXT.note('Leave at the door'))).toBeInTheDocument()
  })

  it('shows the label of every payment method', () => {
    const methods: PaymentMethod[] = ['cod', 'bank-transfer', 'credit-card']
    const { rerender } = render(<OrderDetails order={ORDER} />)
    for (const paymentMethod of methods) {
      rerender(<OrderDetails order={{ ...ORDER, paymentMethod }} />)
      expect(screen.getByText(PAYMENT_METHOD_LABELS[paymentMethod])).toBeInTheDocument()
    }
  })

  it('shows the stored totals instead of recomputing them from the items', () => {
    render(<OrderDetails order={{ ...ORDER, subtotal: 75, shippingFee: 5, total: 80 }} />)
    expect(amountOf(CHECKOUT_TEXT.subtotal)).toBe('$75 USD')
    expect(amountOf(CHECKOUT_TEXT.shipping)).toBe('$5 USD')
    expect(amountOf(CHECKOUT_TEXT.total)).toBe('$80 USD')
  })
})
