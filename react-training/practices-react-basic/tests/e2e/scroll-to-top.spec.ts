import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

function scrollY(page: Page): Promise<number> {
  return page.evaluate<number>('window.scrollY')
}

test('J12 a link to another page opens it at the top', async ({ page }) => {
  await page.goto('/shop/p2')
  const sameProduct = page.getByRole('region', { name: 'Same Product' })
  const nextProduct = sameProduct.getByRole('link', { name: 'Smart T-Shirt' }).first()
  await nextProduct.scrollIntoViewIfNeeded()
  await expect.poll(() => scrollY(page)).toBeGreaterThan(0)

  await nextProduct.click()

  await expect(page).not.toHaveURL(/\/shop\/p2$/)
  await expect(page.getByRole('button', { name: 'Add To Cart' })).toBeVisible()
  await expect.poll(() => scrollY(page)).toBe(0)
})
