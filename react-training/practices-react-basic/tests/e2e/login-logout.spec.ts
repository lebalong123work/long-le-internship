import { expect, test } from '@playwright/test'
import { accountMenu, logIn, logOut, seedCustomer } from './support/account'

test('J2 seed customer logs in, sees the account menu, then logs out', async ({ page }) => {
  const user = seedCustomer()
  await logIn(page, user.email, user.password)

  await expect(page.getByRole('dialog', { name: 'Log In' })).toBeHidden()
  await expect(accountMenu(page, user.name)).toBeVisible()

  await logOut(page, user.name)
})
