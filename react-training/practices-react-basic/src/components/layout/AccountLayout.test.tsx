import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ACCOUNT_NAV_ITEMS, HEADER_TEXT } from '@/constants/header'
import { ROUTES } from '@/constants/routes'
import { AccountLayout } from './AccountLayout'

function renderAccount(path: string) {
  const router = createMemoryRouter(
    [
      {
        element: <AccountLayout />,
        children: [
          { path: ROUTES.ACCOUNT.PROFILE, element: <p>Profile content</p> },
          { path: ROUTES.ACCOUNT.ORDERS, element: <p>Orders content</p> },
          { path: ROUTES.ACCOUNT.WISHLIST, element: <p>Wishlist content</p> },
        ],
      },
    ],
    { initialEntries: [path] }
  )
  render(<RouterProvider router={router} />)
}

function accountNav(): HTMLElement {
  return screen.getByRole('navigation', { name: HEADER_TEXT.accountNav })
}

function navLink(name: string): HTMLElement {
  return within(accountNav()).getByRole('link', { name })
}

describe('AccountLayout nav', () => {
  it('lists only the account nav items in order with their routes, without logout', () => {
    renderAccount(ROUTES.ACCOUNT.PROFILE)
    const links = within(accountNav()).getAllByRole('link')
    expect(links.map((link) => link.textContent)).toEqual(
      ACCOUNT_NAV_ITEMS.map((item) => item.label)
    )
    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      ACCOUNT_NAV_ITEMS.map((item) => item.to)
    )
    expect(within(accountNav()).queryByRole('button')).not.toBeInTheDocument()
    expect(within(accountNav()).queryByText(HEADER_TEXT.logout)).not.toBeInTheDocument()
    expect(within(accountNav()).getAllByRole('listitem')).toHaveLength(ACCOUNT_NAV_ITEMS.length)
  })
})

describe('AccountLayout active link', () => {
  it('marks only the link of the current route as current page', () => {
    renderAccount(ROUTES.ACCOUNT.ORDERS)
    expect(navLink(HEADER_TEXT.orders)).toHaveAttribute('aria-current', 'page')
    expect(navLink(HEADER_TEXT.profile)).not.toHaveAttribute('aria-current')
    expect(navLink(HEADER_TEXT.wishlist)).not.toHaveAttribute('aria-current')
  })

  it('moves the current page to the clicked link and shows its content', async () => {
    const user = userEvent.setup()
    renderAccount(ROUTES.ACCOUNT.ORDERS)
    await user.click(navLink(HEADER_TEXT.wishlist))
    expect(navLink(HEADER_TEXT.wishlist)).toHaveAttribute('aria-current', 'page')
    expect(navLink(HEADER_TEXT.orders)).not.toHaveAttribute('aria-current')
    expect(screen.getByText('Wishlist content')).toBeInTheDocument()
    expect(screen.queryByText('Orders content')).not.toBeInTheDocument()
  })

  it('gives the active link the active tab look and idle links the idle look', () => {
    renderAccount(ROUTES.ACCOUNT.ORDERS)
    expect(navLink(HEADER_TEXT.orders)).toHaveClass('font-bold', 'text-primary', 'after:bg-primary')
    expect(navLink(HEADER_TEXT.profile)).toHaveClass('font-normal', 'text-medium-dark')
    expect(navLink(HEADER_TEXT.profile)).not.toHaveClass('font-bold', 'after:bg-primary')
  })
})

describe('AccountLayout content', () => {
  it('renders the child route after the nav', () => {
    renderAccount(ROUTES.ACCOUNT.PROFILE)
    const content = screen.getByText('Profile content')
    expect(accountNav().compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })
})
