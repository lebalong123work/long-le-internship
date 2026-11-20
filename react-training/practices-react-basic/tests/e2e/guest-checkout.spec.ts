import { expect, test } from '@playwright/test'
import { addBestSellerToCart, BEST_SELLER_PRODUCT } from './support/cart'

const GUEST = {
  fullName: 'E2E Guest',
  phone: '0901234567',
  email: 'e2e.guest@example.com',
  address: '1 Test Street',
  province: 'Hanoi',
  ward: 'Ba Dinh',
  payment: 'Cash on delivery (COD)',
} as const

test('J3 guest places an order and finds it with order lookup', async ({ page }) => {
  await addBestSellerToCart(page)
  await page.getByRole('link', { name: 'Cart, 1 item' }).click()
  await page.getByRole('link', { name: 'Checkout' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Checkout' })).toBeVisible()
  await page.getByLabel('Full name').fill(GUEST.fullName)
  await page.getByLabel('Phone number').fill(GUEST.phone)
  await page.getByLabel('Email').fill(GUEST.email)
  await page.getByLabel('Address').fill(GUEST.address)
  await page.getByLabel('Province / City').selectOption(GUEST.province)
  await page.getByLabel('Ward / Commune').selectOption(GUEST.ward)
  const payment = page.getByRole('group', { name: 'Payment method' })
  await payment.getByText(GUEST.payment, { exact: true }).click()
  await expect(payment.getByRole('radio', { name: GUEST.payment })).toBeChecked()
  await page.getByRole('button', { name: 'Place Order' }).click()

  await expect(page.getByRole('heading', { name: 'Order Placed Successfully!' })).toBeVisible()
  const orderIdLine = await page.getByText(/^Order ID: /).textContent()
  const orderNumber = orderIdLine?.replace('Order ID: ', '').trim() ?? ''
  expect(orderNumber).not.toBe('')

  await page.goto('/order-lookup')
  await page.getByLabel('Email').fill(GUEST.email)
  await page.getByLabel('Order number').fill(orderNumber)
  await page.getByRole('button', { name: 'Find Order' }).click()

  const main = page.getByRole('main')
  await expect(main.getByText(orderNumber).first()).toBeVisible()
  await expect(main.getByText(BEST_SELLER_PRODUCT).first()).toBeVisible()
})
