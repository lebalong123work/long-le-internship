import { expect, test } from '@playwright/test'
import { newCustomer, signUpNewCustomer } from './support/account'
import { addBestSellerToCart, BEST_SELLER_PRODUCT } from './support/cart'
import { expectToast } from './support/toast'

const QUANTITY_GROUP = new RegExp(`^Quantity of ${BEST_SELLER_PRODUCT}, Black`)
const REMOVE_BUTTON = new RegExp(`^Remove ${BEST_SELLER_PRODUCT}, Black.* from cart$`)

test('J11 customer changes the cart quantity, keeps it after reload, then removes the item', async ({
  page,
}, testInfo) => {
  const customer = newCustomer(testInfo, 'cart-quantity')
  await signUpNewCustomer(page, customer)
  await addBestSellerToCart(page)
  await page.getByRole('link', { name: 'Cart, 1 item' }).click()

  const stepper = page.getByRole('group', { name: QUANTITY_GROUP })
  const summary = page.getByRole('region', { name: 'Order summary' })
  await stepper.getByRole('button', { name: 'Increase quantity' }).click()
  await expect(stepper.getByText('2', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Cart, 2 items' })).toBeVisible()
  await expect(summary.getByText('$80 USD')).toBeVisible()

  await page.reload()
  await expect(stepper.getByText('2', { exact: true })).toBeVisible()

  await stepper.getByRole('button', { name: 'Decrease quantity' }).click()
  await expect(page.getByRole('link', { name: 'Cart, 1 item' })).toBeVisible()
  await expect(summary.getByText('$40 USD')).toBeVisible()

  await page.getByRole('button', { name: REMOVE_BUTTON }).click()
  await expectToast(page, 'Removed from cart')
  await expect(page.getByText('Your cart is empty')).toBeVisible()
})
