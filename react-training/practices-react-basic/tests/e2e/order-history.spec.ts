import { expect, test } from '@playwright/test'
import { newCustomer, openAccountPage, signUpNewCustomer } from './support/account'
import { addBestSellerToCart, BEST_SELLER_PRODUCT } from './support/cart'
import { checkoutFromCart, fillShippingAndPlaceOrder } from './support/checkout'

test('J9 customer finds a placed order in the order history and opens its detail', async ({
  page,
}, testInfo) => {
  const customer = newCustomer(testInfo, 'order-history')
  await signUpNewCustomer(page, customer)
  await addBestSellerToCart(page)
  await checkoutFromCart(page)
  const orderNumber = await fillShippingAndPlaceOrder(page)

  await openAccountPage(page, customer.name, 'Order History')
  await expect(page.getByRole('heading', { level: 1, name: 'My Orders' })).toBeVisible()
  const order = page.getByRole('article', { name: orderNumber })
  await expect(order).toBeVisible()

  const toggle = order.getByRole('button', { name: 'View Detail' })
  await toggle.click()
  await expect(order.getByText(BEST_SELLER_PRODUCT).first()).toBeVisible()
  await expect(order.getByLabel('Order status')).toBeVisible()

  await order.getByRole('button', { name: 'Hide Detail' }).click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
})
