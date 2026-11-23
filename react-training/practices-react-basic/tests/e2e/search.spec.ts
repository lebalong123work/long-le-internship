import { expect, test } from '@playwright/test'
import { BEST_SELLER_PRODUCT } from './support/cart'

const QUERY = 'shirt'
const NO_MATCH_QUERY = 'zzqx'

test('J8 guest searches from the header and sees results or a no-results message', async ({
  page,
}) => {
  await page.goto('/')
  const search = page.getByRole('combobox', { name: 'Search products' })
  await search.fill(QUERY)
  const suggestions = page.getByRole('listbox', { name: 'Search suggestions' })
  await expect(suggestions.getByRole('option', { name: BEST_SELLER_PRODUCT }).first()).toBeVisible()

  await search.press('Enter')
  await expect(page).toHaveURL(new RegExp(`/search\\?q=${QUERY}$`))
  await expect(
    page.getByRole('heading', { level: 1, name: `Results for "${QUERY}"` })
  ).toBeVisible()
  const main = page.getByRole('main')
  await expect(main.getByRole('link', { name: BEST_SELLER_PRODUCT }).first()).toBeVisible()

  await search.fill(NO_MATCH_QUERY)
  await search.press('Enter')
  await expect(main.getByText(`No results for '${NO_MATCH_QUERY}'`)).toBeVisible()
})
