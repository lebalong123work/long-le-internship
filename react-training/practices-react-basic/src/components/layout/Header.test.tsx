import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { installDialogStub } from '@/test/dialogStub'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import { Header } from './Header'
import type { Cart, User } from '@/types'

vi.mock('@/services/cartService')

const customer: User = {
  id: 'u1',
  name: 'Test Customer',
  email: 'user@store.com',
  role: 'customer',
}

const ACCOUNT_BUTTON = 'Account menu for Test Customer'

function cartWith(...quantities: number[]): Cart {
  return {
    id: 'c1',
    userId: 'u1',
    items: quantities.map((quantity, index) => ({
      id: `p${index}__Black__S`,
      productId: `p${index}`,
      color: 'Black',
      size: 'S',
      quantity,
    })),
  }
}

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function currentUrl(): URL {
  return new URL(screen.getByTestId('location').textContent ?? '', 'http://localhost')
}

function renderHeader(path = '/') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const ui = (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Header />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  const view = render(ui)
  return { ...view, rerenderSame: () => view.rerender(ui) }
}

function logIn(user: User = customer): void {
  useAuthStore.getState().login(user, `mock-token-${user.id}`)
}

function mainNav(): HTMLElement {
  return screen.getByRole('navigation', { name: 'Main' })
}

function accountButton(): HTMLElement {
  return screen.getByRole('button', { name: ACCOUNT_BUTTON })
}

function accountPanel(): HTMLElement {
  const panel = document.getElementById(accountButton().getAttribute('aria-controls') ?? '')
  if (!panel) throw new Error('account panel not rendered')
  return panel
}

async function openAccountMenu() {
  const user = userEvent.setup()
  logIn()
  vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
  renderHeader()
  await user.click(accountButton())
  return user
}

let media: ReturnType<typeof installMatchMediaStub>

beforeAll(() => {
  installDialogStub()
})

beforeEach(() => {
  media = installMatchMediaStub(true)
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  localStorage.clear()
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('Header nav', () => {
  it('marks Home active on /', () => {
    renderHeader('/')
    expect(within(mainNav()).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('does not mark Home active on /about', () => {
    renderHeader('/about')
    expect(within(mainNav()).getByRole('link', { name: 'Home' })).not.toHaveAttribute(
      'aria-current'
    )
    expect(within(mainNav()).getByRole('link', { name: 'About Us' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('marks Shop active on /shop/p1', () => {
    renderHeader('/shop/p1')
    expect(within(mainNav()).getByRole('link', { name: 'Shop' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('marks no main nav item active on /cart', () => {
    renderHeader('/cart')
    const current = within(mainNav())
      .getAllByRole('link')
      .filter((link) => link.hasAttribute('aria-current'))
    expect(current).toHaveLength(0)
  })

  it('header has a nav named Main', () => {
    renderHeader()
    expect(
      within(mainNav())
        .getAllByRole('link')
        .map((link) => link.textContent)
    ).toEqual(['Home', 'Shop', 'About Us', 'Contact'])
  })

  it('header nav has no account links', () => {
    renderHeader()
    expect(within(mainNav()).queryByRole('link', { name: 'Profile' })).toBeNull()
    expect(within(mainNav()).queryByRole('link', { name: 'Orders' })).toBeNull()
  })
})

describe('Header logo', () => {
  it('logo links to / with the name mangcoding Store', () => {
    renderHeader('/about')
    expect(screen.getByRole('link', { name: 'mangcoding Store' })).toHaveAttribute('href', '/')
  })

  it('logo image is decorative', () => {
    renderHeader()
    const logo = screen.getByRole('link', { name: 'mangcoding Store' }).querySelector('img')
    expect(logo).toHaveAttribute('alt', '')
  })
})

describe('Header cart link', () => {
  it('guest cart click opens login with redirect /cart on the current page', async () => {
    renderHeader('/shop/p1')
    await userEvent.click(screen.getByRole('link', { name: 'Cart' }))
    expect(currentUrl().searchParams.get('auth')).toBe('login')
    expect(currentUrl().searchParams.get('redirect')).toBe('/cart')
  })

  it('guest cart click does not leave the current page', async () => {
    renderHeader('/shop/p1')
    await userEvent.click(screen.getByRole('link', { name: 'Cart' }))
    expect(currentUrl().pathname).toBe('/shop/p1')
  })

  it('logged-in cart click goes to /cart', async () => {
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith(1))
    renderHeader('/shop/p1')
    await userEvent.click(await screen.findByRole('link', { name: 'Cart, 1 item' }))
    expect(currentUrl().pathname).toBe('/cart')
  })

  it('logged-in cart click does not open the login modal', async () => {
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith(1))
    renderHeader('/shop/p1')
    await userEvent.click(await screen.findByRole('link', { name: 'Cart, 1 item' }))
    expect(currentUrl().searchParams.has('auth')).toBe(false)
  })

  it('shows badge 3 and the name Cart, 3 items', async () => {
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith(1, 2))
    renderHeader()
    const link = await screen.findByRole('link', { name: 'Cart, 3 items' })
    expect(link).toHaveTextContent('3')
  })

  it('guest has no badge, the name Cart and no cart request', () => {
    renderHeader()
    expect(screen.getByRole('link', { name: 'Cart' })).toHaveTextContent('')
    expect(cartService.getCart).not.toHaveBeenCalled()
  })

  it('names the link Cart, 120 items while the badge shows 99+', async () => {
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith(100, 20))
    renderHeader()
    const link = await screen.findByRole('link', { name: 'Cart, 120 items' })
    expect(link).toHaveTextContent('99+')
  })

  it('shows no badge and the name Cart when the cart request fails', async () => {
    logIn()
    vi.mocked(cartService.getCart).mockRejectedValue(new ApiError(500, 'Server error'))
    renderHeader()
    await waitFor(() => expect(cartService.getCart).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByRole('link', { name: 'Cart' })).toHaveTextContent(''))
  })
})

describe('Header wishlist link', () => {
  it('guest heart click opens login with redirect /account/wishlist', async () => {
    renderHeader('/about')
    await userEvent.click(screen.getByRole('link', { name: 'Wishlist' }))
    expect(currentUrl().searchParams.get('auth')).toBe('login')
    expect(currentUrl().searchParams.get('redirect')).toBe('/account/wishlist')
  })

  it('guest heart click does not leave the current page', async () => {
    renderHeader('/about')
    await userEvent.click(screen.getByRole('link', { name: 'Wishlist' }))
    expect(currentUrl().pathname).toBe('/about')
  })

  it('logged-in heart click goes to /account/wishlist', async () => {
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    renderHeader('/about')
    await userEvent.click(screen.getByRole('link', { name: 'Wishlist' }))
    expect(currentUrl().pathname).toBe('/account/wishlist')
  })

  it('logged-in heart click does not open the login modal', async () => {
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    renderHeader('/about')
    await userEvent.click(screen.getByRole('link', { name: 'Wishlist' }))
    expect(currentUrl().searchParams.has('auth')).toBe(false)
  })
})

describe('Header user menu', () => {
  it('guest Log In button opens login without redirect', async () => {
    renderHeader('/about')
    await userEvent.click(screen.getByRole('button', { name: 'Log In' }))
    expect(currentUrl().pathname).toBe('/about')
    expect(currentUrl().searchParams.get('auth')).toBe('login')
    expect(currentUrl().searchParams.has('redirect')).toBe(false)
  })

  it('guest Log In button has no aria-expanded', () => {
    renderHeader()
    expect(screen.getByRole('button', { name: 'Log In' })).not.toHaveAttribute('aria-expanded')
  })

  it('account button opens Profile, Orders, Wishlist and Logout', async () => {
    await openAccountMenu()
    expect(accountButton()).toHaveAttribute('aria-expanded', 'true')
    const panel = within(accountPanel())
    expect(panel.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Profile',
      'Orders',
      'Wishlist',
    ])
    expect(panel.getByRole('button', { name: 'Logout' })).toBeVisible()
  })

  it('account menu is closed at start', () => {
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    renderHeader()
    expect(accountButton()).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('link', { name: 'Profile' })).toBeNull()
  })

  it('account button name includes the user name', () => {
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    renderHeader()
    expect(accountButton()).toBeInTheDocument()
  })

  it('account button name has no name part for a blank name', () => {
    logIn({ ...customer, name: '   ' })
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    renderHeader()
    expect(screen.getByRole('button', { name: 'Account menu' })).toBeInTheDocument()
  })

  it('Esc closes the account menu and focuses the button', async () => {
    const user = await openAccountMenu()
    within(accountPanel()).getByRole('link', { name: 'Profile' }).focus()
    await user.keyboard('{Escape}')
    expect(accountButton()).toHaveAttribute('aria-expanded', 'false')
    expect(accountButton()).toHaveFocus()
  })

  it('Esc with the menu closed keeps focus on the button', async () => {
    const user = userEvent.setup()
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    renderHeader()
    accountButton().focus()
    await user.keyboard('{Escape}')
    expect(accountButton()).toHaveFocus()
    expect(accountButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('pointer down outside closes the account menu', async () => {
    await openAccountMenu()
    fireEvent.pointerDown(document.body)
    expect(accountButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('pointer down inside the account menu keeps it open', async () => {
    await openAccountMenu()
    fireEvent.pointerDown(within(accountPanel()).getByRole('link', { name: 'Profile' }))
    expect(accountButton()).toHaveAttribute('aria-expanded', 'true')
  })

  it('Tab out of the last item closes the account menu', async () => {
    const user = await openAccountMenu()
    within(accountPanel()).getByRole('button', { name: 'Logout' }).focus()
    await user.tab()
    expect(screen.getByRole('searchbox', { name: 'Search products' })).toHaveFocus()
    expect(accountButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('moving focus between items keeps the account menu open', async () => {
    const user = await openAccountMenu()
    within(accountPanel()).getByRole('link', { name: 'Profile' }).focus()
    await user.tab()
    expect(within(accountPanel()).getByRole('link', { name: 'Orders' })).toHaveFocus()
    expect(accountButton()).toHaveAttribute('aria-expanded', 'true')
  })

  it('clicking Orders goes to /account/orders and closes the menu', async () => {
    const user = await openAccountMenu()
    await user.click(within(accountPanel()).getByRole('link', { name: 'Orders' }))
    expect(currentUrl().pathname).toBe('/account/orders')
    expect(accountButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('a re-render without a route change keeps the menu open', async () => {
    const user = userEvent.setup()
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    const { rerenderSame } = renderHeader()
    await user.click(accountButton())
    rerenderSame()
    expect(accountButton()).toHaveAttribute('aria-expanded', 'true')
  })

  it('Logout logs out, goes to /, shows the info toast and focuses the user button', async () => {
    const user = userEvent.setup()
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    renderHeader('/about')
    await user.click(accountButton())
    await user.click(within(accountPanel()).getByRole('button', { name: 'Logout' }))
    expect(useAuthStore.getState().user).toBeNull()
    expect(currentUrl().pathname).toBe('/')
    expect(useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))).toEqual(
      [{ type: 'info', message: TOAST_MESSAGES.auth.loggedOut }]
    )
    expect(screen.getByRole('button', { name: 'Log In' })).toHaveFocus()
  })

  it('guest sees no Logout', () => {
    renderHeader()
    expect(screen.queryByRole('button', { name: 'Logout' })).toBeNull()
  })

  it('account menu closes when the screen goes below xl', async () => {
    await openAccountMenu()
    act(() => media.setMatches(false))
    expect(accountButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('account menu stays open while the screen stays xl', async () => {
    await openAccountMenu()
    act(() => media.setMatches(true))
    expect(accountButton()).toHaveAttribute('aria-expanded', 'true')
  })

  it('Profile item is current on /account/profile', async () => {
    const user = userEvent.setup()
    logIn()
    vi.mocked(cartService.getCart).mockResolvedValue(cartWith())
    renderHeader('/account/profile')
    await user.click(accountButton())
    expect(within(accountPanel()).getByRole('link', { name: 'Profile' })).toHaveAttribute(
      'aria-current',
      'page'
    )
  })

  it('no account item is current on /', async () => {
    await openAccountMenu()
    const current = within(accountPanel())
      .getAllByRole('link')
      .filter((link) => link.hasAttribute('aria-current'))
    expect(current).toHaveLength(0)
  })
})

describe('Header safe area', () => {
  it('bar row keeps h-16 xl:h-20 inside the header', () => {
    renderHeader()
    const bar = screen.getByRole('banner').firstElementChild
    expect(bar).toHaveClass('h-16', 'xl:h-20')
  })

  it('header itself has no height class, only the safe-area top padding', () => {
    renderHeader()
    const header = screen.getByRole('banner')
    expect(header).toHaveClass('pt-[env(safe-area-inset-top)]')
    expect([...header.classList].some((name) => /^(xl:)?h-/.test(name))).toBe(false)
  })
})
