import { expect, type Page } from '@playwright/test'

export const BEST_SELLER_PRODUCT = 'Smart T-Shirt'

export async function addBestSellerToCart(page: Page): Promise<void> {
  await page.goto('/')
  const bestSeller = page.getByRole('region', { name: 'Our Best Seller' })
  await bestSeller.getByRole('link', { name: BEST_SELLER_PRODUCT }).first().click()

  await expect(page.getByRole('heading', { level: 1, name: BEST_SELLER_PRODUCT })).toBeVisible()
  const colorGroup = page.getByRole('group', { name: 'Color' })
  const black = page.getByRole('radio', { name: 'Black' })
  await colorGroup.locator('label', { has: black }).click()
  await expect(colorGroup.getByRole('radio', { name: 'Black' })).toBeChecked()
  await page.getByRole('button', { name: 'Add To Cart' }).click()

  await expect(page.getByRole('link', { name: 'Cart, 1 item' })).toBeVisible()
}
