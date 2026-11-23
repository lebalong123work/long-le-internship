import { expect, test } from '@playwright/test'
import { addBestSellerToCart, BEST_SELLER_PRODUCT } from './support/cart'

test('J1 guest adds a best seller to the cart and sees it on the cart page', async ({ page }) => {
  await addBestSellerToCart(page)

  await page.getByRole('link', { name: 'Cart, 1 item' }).click()

  await expect(page).toHaveURL(/\/cart$/)
  await expect(page.getByRole('heading', { name: 'Cart Product' })).toBeVisible()
  await expect(page.getByRole('main').getByText(BEST_SELLER_PRODUCT).first()).toBeVisible()
})
