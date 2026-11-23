import { expect, type Page } from '@playwright/test'

export async function expectToast(page: Page, message: string): Promise<void> {
  await expect(page.getByRole('region', { name: 'Notifications' }).getByText(message)).toBeVisible()
}
