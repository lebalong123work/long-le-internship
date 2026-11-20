import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

interface SeedUser {
  email: string
  password: string
  name: string
}

function seedAccount(): SeedUser {
  const seed: { users: SeedUser[] } = JSON.parse(readFileSync('server/db.seed.json', 'utf8'))
  const [user] = seed.users
  if (!user) throw new Error('server/db.seed.json has no user')
  return user
}

test('J2 seed customer logs in, sees the account menu, then logs out', async ({ page }) => {
  const user = seedAccount()
  await page.goto('/?auth=login')

  const dialog = page.getByRole('dialog', { name: 'Log In' })
  await dialog.getByLabel('Email').fill(user.email)
  await dialog.getByLabel('Password').fill(user.password)
  await dialog.getByRole('button', { name: 'Log In' }).click()

  await expect(dialog).toBeHidden()
  const accountMenu = page.getByRole('button', { name: `Account menu for ${user.name}` })
  await expect(accountMenu).toBeVisible()

  await accountMenu.click()
  await page.getByRole('button', { name: 'Logout' }).click()

  await expect(page.getByRole('button', { name: 'Account menu', exact: true })).toBeVisible()
})
