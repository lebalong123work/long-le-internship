import { expect, test } from '@playwright/test'
import { newCustomer, openAccountPage, signUpNewCustomer } from './support/account'
import { BEST_SELLER_PRODUCT } from './support/cart'
import { expectToast } from './support/toast'

test('J5 customer saves a best seller to the wishlist, sees it, then removes it', async ({
  page,
}, testInfo) => {
  const customer = newCustomer(testInfo, 'wishlist')
  await signUpNewCustomer(page, customer)

  const bestSeller = page.getByRole('region', { name: 'Our Best Seller' })
  await bestSeller
    .getByRole('button', { name: `Save ${BEST_SELLER_PRODUCT} to wishlist` })
    .first()
    .click()
  await expectToast(page, 'Saved to wishlist')

  await openAccountPage(page, customer.name, 'Wishlist')
  await expect(page).toHaveURL(/\/account\/wishlist$/)
  await expect(page.getByRole('heading', { level: 1, name: 'My Wishlist' })).toBeVisible()
  const main = page.getByRole('main')
  await expect(main.getByText(BEST_SELLER_PRODUCT).first()).toBeVisible()

  await main.getByRole('button', { name: `Remove ${BEST_SELLER_PRODUCT} from wishlist` }).click()
  await expect(main.getByText('No saved items')).toBeVisible()
})
