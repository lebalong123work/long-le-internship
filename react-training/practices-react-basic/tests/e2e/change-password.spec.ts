import { expect, test } from '@playwright/test'
import {
  accountMenu,
  logIn,
  logOut,
  newCustomer,
  openAccountPage,
  signUpNewCustomer,
} from './support/account'
import { expectToast } from './support/toast'

const NEW_PASSWORD = 'e2e-pass-456'

test('J7 customer changes the password and only the new password logs in', async ({
  page,
}, testInfo) => {
  const customer = newCustomer(testInfo, 'change-password')
  await signUpNewCustomer(page, customer)

  await openAccountPage(page, customer.name, 'Profile')
  await page.getByLabel('Current password', { exact: true }).fill(customer.password)
  await page.getByLabel('New password', { exact: true }).fill(NEW_PASSWORD)
  await page.getByLabel('Confirm new password', { exact: true }).fill(NEW_PASSWORD)
  await page.getByRole('button', { name: 'Update Password' }).click()
  await expectToast(page, 'Password changed successfully')

  await logOut(page, customer.name)
  await logIn(page, customer.email, customer.password)
  const dialog = page.getByRole('dialog', { name: 'Log In' })
  await expect(dialog.getByText('Incorrect email or password')).toBeVisible()

  await logIn(page, customer.email, NEW_PASSWORD)
  await expect(dialog).toBeHidden()
  await expect(accountMenu(page, customer.name)).toBeVisible()
})
