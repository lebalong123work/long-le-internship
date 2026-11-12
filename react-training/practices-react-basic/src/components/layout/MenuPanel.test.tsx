import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthModal } from '@/components/auth/AuthModal'
import { useTopLayerHost } from '@/components/ui/topLayer'
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

const cart: Cart = {
  id: 'c1',
  userId: 'u1',
  items: [{ id: 'p1__Black__S', productId: 'p1', color: 'Black', size: 'S', quantity: 3 }],
}

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function TopLayerProbe(): JSX.Element {
  const host = useTopLayerHost()
  return <output data-testid="top-layer">{host?.tagName ?? 'none'}</output>
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
        <AuthModal />
        <LocationProbe />
        <TopLayerProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  const view = render(ui)
  return { ...view, rerenderSame: () => view.rerender(ui) }
}

function logIn(): void {
  useAuthStore.getState().login(customer, 'mock-token-u1')
  vi.mocked(cartService.getCart).mockResolvedValue(cart)
}

function menuDialog(): HTMLDialogElement {
  const dialog = document.querySelector('dialog')
  if (!(dialog instanceof HTMLDialogElement)) throw new Error('menu dialog not rendered')
  return dialog
}

function hamburger(): HTMLElement {
  return screen.getByRole('button', { name: 'Open menu' })
}

function panel(): HTMLElement {
  const navs = within(menuDialog()).getAllByRole('navigation', { name: 'Main' })
  const nav = navs[navs.length - 1]
  const container = nav?.parentElement
  if (!container) throw new Error('menu panel not rendered')
  return container
}

async function openMenu(path = '/') {
  const user = userEvent.setup()
  const view = renderHeader(path)
  await user.click(hamburger())
  return { user, ...view }
}

let media: ReturnType<typeof installMatchMediaStub>

beforeAll(() => {
  installDialogStub()
})

beforeEach(() => {
  media = installMatchMediaStub(false)
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  localStorage.clear()
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.resetAllMocks()
})

describe('MenuPanel open', () => {
  it('Open menu opens the Main menu dialog and sets aria-expanded', async () => {
    await openMenu()
    expect(menuDialog().open).toBe(true)
    expect(menuDialog()).toHaveAccessibleName('Main menu')
    expect(hamburger()).toHaveAttribute('aria-expanded', 'true')
    expect(hamburger()).toHaveAttribute('aria-controls', menuDialog().id)
  })

  it('dialog is closed at start with aria-expanded false', () => {
    renderHeader()
    expect(menuDialog().open).toBe(false)
    expect(hamburger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('Main menu dialog is opened with showModal', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
    await openMenu()
    expect(showModal).toHaveBeenCalledTimes(1)
  })

  it('Main menu dialog has no aria-modal attribute', async () => {
    await openMenu()
    expect(menuDialog()).not.toHaveAttribute('aria-modal')
  })

  it('focuses the Home link when the menu opens', async () => {
    await openMenu()
    expect(within(panel()).getByRole('link', { name: 'Home' })).toHaveFocus()
  })

  it('does not focus the logo link on open', async () => {
    await openMenu()
    expect(within(menuDialog()).getByRole('link', { name: 'mangcoding Store' })).not.toHaveFocus()
  })
})

describe('MenuPanel close', () => {
  it('Close menu button closes the dialog', async () => {
    const { user } = await openMenu()
    await user.click(within(menuDialog()).getByRole('button', { name: 'Close menu' }))
    expect(menuDialog().open).toBe(false)
    expect(hamburger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('a non-cancelable cancel closes it only once', async () => {
    await openMenu()
    fireEvent(menuDialog(), new Event('cancel', { cancelable: false }))
    expect(hamburger()).toHaveAttribute('aria-expanded', 'true')
    act(() => menuDialog().close())
    expect(hamburger()).toHaveAttribute('aria-expanded', 'false')
    act(() => menuDialog().close())
    expect(menuDialog().open).toBe(false)
    expect(hamburger()).toHaveAttribute('aria-expanded', 'false')
  })

  it('backdrop click closes the dialog', async () => {
    await openMenu()
    fireEvent.mouseDown(menuDialog())
    fireEvent.click(menuDialog())
    expect(menuDialog().open).toBe(false)
  })

  it('press that starts in the panel and ends on the backdrop keeps it open', async () => {
    await openMenu()
    fireEvent.mouseDown(panel())
    fireEvent.click(menuDialog())
    expect(menuDialog().open).toBe(true)
  })

  it('clicking Shop navigates and closes the menu', async () => {
    const { user } = await openMenu()
    await user.click(within(panel()).getByRole('link', { name: 'Shop' }))
    expect(currentUrl().pathname).toBe('/shop')
    expect(menuDialog().open).toBe(false)
  })

  it('a re-render without a route change keeps the menu open', async () => {
    const { rerenderSame } = await openMenu()
    rerenderSame()
    expect(menuDialog().open).toBe(true)
  })

  it('menu closes when the screen reaches xl', async () => {
    await openMenu()
    act(() => media.setMatches(true))
    expect(menuDialog().open).toBe(false)
  })

  it('menu stays open while the screen stays below xl', async () => {
    await openMenu()
    act(() => media.setMatches(false))
    expect(menuDialog().open).toBe(true)
  })
})

describe('MenuPanel items', () => {
  it('guest sees the main links and Log In opening login', async () => {
    const { user } = await openMenu('/about')
    const items = within(panel())
    expect(items.getAllByRole('link').map((link) => link.textContent)).toEqual([
      'Home',
      'Shop',
      'About Us',
      'Contact',
    ])
    await user.click(items.getByRole('button', { name: 'Log In' }))
    expect(currentUrl().pathname).toBe('/about')
    expect(currentUrl().searchParams.get('auth')).toBe('login')
  })

  it('guest sees no Profile, Orders, Wishlist or Logout', async () => {
    await openMenu()
    const items = within(panel())
    expect(items.queryByRole('link', { name: 'Profile' })).toBeNull()
    expect(items.queryByRole('link', { name: 'Orders' })).toBeNull()
    expect(items.queryByRole('link', { name: 'Wishlist' })).toBeNull()
    expect(items.queryByRole('button', { name: 'Logout' })).toBeNull()
  })

  it('logged-in user sees Profile, Orders, Wishlist and Logout', async () => {
    logIn()
    await openMenu()
    const items = within(panel())
    expect(items.getByRole('link', { name: 'Profile' })).toHaveAttribute('href', '/account/profile')
    expect(items.getByRole('link', { name: 'Orders' })).toHaveAttribute('href', '/account/orders')
    expect(items.getByRole('link', { name: 'Wishlist' })).toHaveAttribute(
      'href',
      '/account/wishlist'
    )
    expect(items.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
  })

  it('logged-in user sees no Log In', async () => {
    logIn()
    await openMenu()
    expect(within(panel()).queryByRole('button', { name: 'Log In' })).toBeNull()
  })

  it('Logout in the menu logs out and closes the menu', async () => {
    logIn()
    const { user } = await openMenu('/about')
    await user.click(within(panel()).getByRole('button', { name: 'Logout' }))
    expect(useAuthStore.getState().user).toBeNull()
    expect(currentUrl().pathname).toBe('/')
    expect(menuDialog().open).toBe(false)
  })

  it('the cart badge is gone after Logout', async () => {
    logIn()
    const { user } = await openMenu()
    await screen.findAllByRole('link', { name: 'Cart, 3 items' })
    await user.click(within(panel()).getByRole('button', { name: 'Logout' }))
    expect(screen.getByRole('link', { name: 'Cart' })).toHaveTextContent('')
  })
})

describe('MenuPanel top layer and other overlays', () => {
  it('registers the dialog as the top-layer host while open', async () => {
    await openMenu()
    expect(screen.getByTestId('top-layer')).toHaveTextContent('DIALOG')
  })

  it('clears the top-layer host after close', async () => {
    const { user } = await openMenu()
    await user.click(within(menuDialog()).getByRole('button', { name: 'Close menu' }))
    expect(screen.getByTestId('top-layer')).toHaveTextContent('none')
  })

  it('Log In closes the menu and opens the auth modal', async () => {
    const { user } = await openMenu()
    await user.click(within(panel()).getByRole('button', { name: 'Log In' }))
    expect(menuDialog().open).toBe(false)
    expect(screen.getByRole('dialog', { name: 'Log In' })).toBeInTheDocument()
  })

  it('opening the menu does not change the URL', async () => {
    await openMenu('/about')
    expect(currentUrl().pathname).toBe('/about')
    expect(currentUrl().search).toBe('')
  })
})
