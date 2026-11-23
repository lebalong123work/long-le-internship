import { expect, test } from '@playwright/test'
import {
  accountMenu,
  logOut,
  newCustomer,
  openSignUp,
  seedCustomer,
  signUpNewCustomer,
  submitSignUp,
} from './support/account'
import { expectToast } from './support/toast'

test('J4 guest signs up, stays logged in after reload, and cannot reuse a taken email', async ({
  page,
}, testInfo) => {
  const customer = newCustomer(testInfo, 'sign-up')
  await signUpNewCustomer(page, customer)
  await expectToast(page, 'Account created')

  await page.reload()
  await expect(accountMenu(page, customer.name)).toBeVisible()

  await logOut(page, customer.name)
  await openSignUp(page)
  await submitSignUp(page, { ...customer, email: seedCustomer().email })

  const dialog = page.getByRole('dialog', { name: 'Sign Up' })
  await expect(dialog.getByText('Email already exists')).toBeVisible()
  await expect(dialog).toBeVisible()
})
