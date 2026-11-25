import { expect, test } from '@playwright/test'
import { accountMenu, newCustomer, openAccountPage, signUpNewCustomer } from './support/account'
import { expectToast } from './support/toast'

const UPDATED = { name: 'E2E Profile Edited', phone: '0912345678' } as const

test('J6 customer edits the profile and the new values stay after reload', async ({
  page,
}, testInfo) => {
  const customer = newCustomer(testInfo, 'edit-profile')
  await signUpNewCustomer(page, customer)

  await openAccountPage(page, customer.name, 'Profile')
  await expect(page.getByRole('heading', { level: 1, name: 'My Profile' })).toBeVisible()
  await expect(page.getByLabel('Email', { exact: true })).toHaveValue(customer.email)
  await expect(page.getByText('Email cannot be changed')).toBeVisible()

  await page.getByLabel('Full name', { exact: true }).fill(UPDATED.name)
  await page.getByLabel('Phone number', { exact: true }).fill(UPDATED.phone)
  await page.getByRole('button', { name: 'Save Changes' }).click()
  await expectToast(page, 'Profile updated successfully')
  await expect(accountMenu(page, UPDATED.name)).toBeVisible()

  await page.reload()
  await expect(page.getByLabel('Full name', { exact: true })).toHaveValue(UPDATED.name)
  await expect(page.getByLabel('Phone number', { exact: true })).toHaveValue(UPDATED.phone)
})
