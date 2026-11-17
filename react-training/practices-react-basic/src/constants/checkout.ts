import type { PaymentMethod } from '@/types/order'

export interface PaymentOption {
  value: PaymentMethod
  label: string
}

export const PAYMENT_OPTIONS: readonly PaymentOption[] = [
  { value: 'cod', label: 'Cash on delivery (COD)' },
  { value: 'bank-transfer', label: 'Bank transfer' },
  { value: 'credit-card', label: 'Credit card (mock)' },
]

export const BANK_TRANSFER_DETAILS = [
  'Bank: Mock Bank',
  'Account number: 0000 0000 0000',
  'Account name: MANGCODING STORE',
] as const

export const CHECKOUT_TEXT = {
  title: 'Checkout',
  breadcrumbHome: 'Home',
  breadcrumbCart: 'Cart',
  breadcrumbCheckout: 'Checkout',
  loading: 'Loading checkout',
  shippingLegend: 'Shipping address',
  paymentLegend: 'Payment method',
  fullName: 'Full name',
  phone: 'Phone number',
  email: 'Email',
  address: 'Address',
  province: 'Province / City',
  provincePlaceholder: 'Select a province / city',
  ward: 'Ward / Commune',
  wardPlaceholder: 'Select a ward / commune',
  note: 'Note (optional)',
  demoPayment: 'Demo only — no real payment',
  cardNotice: 'Demo only — no real payment. Card details are not collected.',
  subtotal: 'Subtotal',
  shipping: 'Shipping',
  freeShipping: 'Free',
  total: 'Total',
  stockProblem: 'Some products are out of stock. Update your cart to continue.',
  backToCart: 'Back to cart',
  placeOrder: 'Place Order',
  quantity: (quantity: number): string => `Qty ${quantity}`,
  onlyLeft: (stock: number): string => `Only ${stock} left`,
} as const
