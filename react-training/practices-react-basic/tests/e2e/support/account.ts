import { readFileSync } from 'node:fs'
import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

export const E2E_PASSWORD = 'e2e-pass-123'

export interface NewCustomer {
  name: string
  email: string
  password: string
}

export function seedCustomer(): NewCustomer {
  const seed: { users: NewCustomer[] } = JSON.parse(readFileSync('server/db.seed.json', 'utf8'))
  const [user] = seed.users
  if (!user) throw new Error('server/db.seed.json has no user')
  return user
}

export function uniqueEmail(testInfo: TestInfo, journey: string): string {
  return `e2e.${journey}.${testInfo.project.name}@example.com`
}

export function newCustomer(testInfo: TestInfo, journey: string): NewCustomer {
  return { name: `E2E ${journey}`, email: uniqueEmail(testInfo, journey), password: E2E_PASSWORD }
}

export function accountMenu(page: Page, name: string): Locator {
  return page.getByRole('button', { name: `Account menu for ${name}` })
}

export async function openSignUp(page: Page): Promise<void> {
  await page.goto('/')
  await page.getByRole('button', { name: 'Account menu', exact: true }).click()
  await page.getByRole('banner').getByRole('button', { name: 'Log In' }).click()
  await page
    .getByRole('dialog', { name: 'Log In' })
    .getByRole('button', { name: 'Sign up' })
    .click()
}

export async function submitSignUp(page: Page, customer: NewCustomer): Promise<void> {
  const dialog = page.getByRole('dialog', { name: 'Sign Up' })
  await dialog.getByLabel('Full name', { exact: true }).fill(customer.name)
  await dialog.getByLabel('Email', { exact: true }).fill(customer.email)
  await dialog.getByLabel('Password', { exact: true }).fill(customer.password)
  await dialog.getByLabel('Confirm Password', { exact: true }).fill(customer.password)
  await dialog.getByRole('button', { name: 'Sign Up' }).click()
}

export async function signUpNewCustomer(page: Page, customer: NewCustomer): Promise<void> {
  await openSignUp(page)
  await submitSignUp(page, customer)
  await expect(page.getByRole('dialog', { name: 'Sign Up' })).toBeHidden()
  await expect(accountMenu(page, customer.name)).toBeVisible()
}

export async function logIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/?auth=login')
  const dialog = page.getByRole('dialog', { name: 'Log In' })
  await dialog.getByLabel('Email').fill(email)
  await dialog.getByLabel('Password').fill(password)
  await dialog.getByRole('button', { name: 'Log In' }).click()
}

export async function logOut(page: Page, name: string): Promise<void> {
  await accountMenu(page, name).click()
  await page.getByRole('button', { name: 'Logout' }).click()
  await expect(page.getByRole('button', { name: 'Account menu', exact: true })).toBeVisible()
}

export async function openAccountPage(page: Page, name: string, link: string): Promise<void> {
  await accountMenu(page, name).click()
  await page
    .getByRole('banner')
    .getByRole('link', { name: link, exact: true })
    .filter({ hasText: link })
    .click()
}
