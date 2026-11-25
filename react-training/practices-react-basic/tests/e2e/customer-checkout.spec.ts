import { expect, test } from '@playwright/test'
import { newCustomer, signUpNewCustomer } from './support/account'
import { addBestSellerToCart } from './support/cart'
import { checkoutFromCart, fillShippingAndPlaceOrder } from './support/checkout'

test('J10 logged-in customer checks out with prefilled contact details', async ({
  page,
}, testInfo) => {
  const customer = newCustomer(testInfo, 'customer-checkout')
  await signUpNewCustomer(page, customer)
  await addBestSellerToCart(page)
  await checkoutFromCart(page)

  await expect(page.getByLabel('Full name')).toHaveValue(customer.name)
  await expect(page.getByLabel('Email')).toHaveValue(customer.email)
  await fillShippingAndPlaceOrder(page)

  await expect(page.getByRole('link', { name: 'Cart', exact: true })).toBeVisible()
  await expect(page.getByText('Save your order number to look up your order later.')).toBeHidden()
})
