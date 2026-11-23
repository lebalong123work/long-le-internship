import { expect, type Page } from '@playwright/test'

export interface CheckoutContact {
  fullName: string
  email: string
}

export const SHIPPING = {
  phone: '0901234567',
  address: '1 Test Street',
  province: 'Hanoi',
  ward: 'Ba Dinh',
  payment: 'Cash on delivery (COD)',
} as const

const ORDER_SUCCESS_HEADING = 'Order Placed Successfully!'

export async function fillShippingAndPlaceOrder(
  page: Page,
  contact?: CheckoutContact
): Promise<string> {
  await expect(page.getByRole('heading', { level: 1, name: 'Checkout' })).toBeVisible()
  if (contact) {
    await page.getByLabel('Full name').fill(contact.fullName)
    await page.getByLabel('Email').fill(contact.email)
  }
  await page.getByLabel('Phone number').fill(SHIPPING.phone)
  await page.getByLabel('Address').fill(SHIPPING.address)
  await page.getByLabel('Province / City').selectOption(SHIPPING.province)
  await page.getByLabel('Ward / Commune').selectOption(SHIPPING.ward)
  const payment = page.getByRole('group', { name: 'Payment method' })
  await payment.getByText(SHIPPING.payment, { exact: true }).click()
  await expect(payment.getByRole('radio', { name: SHIPPING.payment })).toBeChecked()
  await page.getByRole('button', { name: 'Place Order' }).click()

  await expect(page.getByRole('heading', { name: ORDER_SUCCESS_HEADING })).toBeVisible()
  const orderIdLine = await page.getByText(/^Order ID: /).textContent()
  const orderNumber = orderIdLine?.replace('Order ID: ', '').trim() ?? ''
  expect(orderNumber).not.toBe('')
  return orderNumber
}

export async function checkoutFromCart(page: Page): Promise<void> {
  await page.getByRole('link', { name: 'Cart, 1 item' }).click()
  await page.getByRole('link', { name: 'Checkout' }).click()
}
