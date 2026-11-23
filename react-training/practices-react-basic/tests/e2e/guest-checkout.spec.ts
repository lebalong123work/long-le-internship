import { expect, test } from '@playwright/test'
import { addBestSellerToCart, BEST_SELLER_PRODUCT } from './support/cart'
import { checkoutFromCart, fillShippingAndPlaceOrder } from './support/checkout'

const GUEST = {
  fullName: 'E2E Guest',
  email: 'e2e.guest@example.com',
} as const

test('J3 guest places an order and finds it with order lookup', async ({ page }) => {
  await addBestSellerToCart(page)
  await checkoutFromCart(page)
  const orderNumber = await fillShippingAndPlaceOrder(page, GUEST)

  await page.goto('/order-lookup')
  await page.getByLabel('Email').fill(GUEST.email)
  await page.getByLabel('Order number').fill(orderNumber)
  await page.getByRole('button', { name: 'Find Order' }).click()

  const main = page.getByRole('main')
  await expect(main.getByText(orderNumber).first()).toBeVisible()
  await expect(main.getByText(BEST_SELLER_PRODUCT).first()).toBeVisible()
})
