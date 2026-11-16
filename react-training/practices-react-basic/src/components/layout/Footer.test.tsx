import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, MemoryRouter, RouterProvider, useLocation } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { installDialogStub } from '@/test/dialogStub'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import { Footer } from './Footer'
import { RootLayout } from './RootLayout'
import { SAFE_AREA_X } from './safeArea'
import type { User } from '@/types'

const customer: User = {
  id: 'u1',
  name: 'Test Customer',
  email: 'user@store.com',
  role: 'customer',
}

const SAFE_AREA_X_CLASSES = SAFE_AREA_X.split(' ')

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

function currentUrl(): URL {
  return new URL(screen.getByTestId('location').textContent ?? '', 'http://localhost')
}

function renderFooter(path = '/'): void {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Footer />
      <LocationProbe />
    </MemoryRouter>
  )
}

function renderLayout(): void {
  const router = createMemoryRouter([
    { element: <RootLayout />, children: [{ path: '/', element: <p>Page content</p> }] },
  ])
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

function footer(): HTMLElement {
  return screen.getByRole('contentinfo')
}

function footerNav(): HTMLElement {
  return within(footer()).getByRole('navigation', { name: 'Footer' })
}

function socialList(): HTMLElement {
  return within(footer()).getByRole('list', { name: 'Social media' })
}

function logIn(): void {
  useAuthStore.setState({ user: customer, token: 'mock-token-u1', isAuthenticated: true })
}

beforeAll(() => {
  installDialogStub()
})

beforeEach(() => {
  installMatchMediaStub(true)
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
})

describe('Footer in RootLayout', () => {
  it('RootLayout renders the footer after main, outside it', () => {
    renderLayout()
    const main = screen.getByRole('main')
    expect(main).not.toContainElement(footer())
    expect(main.compareDocumentPosition(footer()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('RootLayout renders only one contentinfo landmark', () => {
    renderLayout()
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })
})

describe('Footer brand', () => {
  it('shows the logo link to / and the description', () => {
    renderFooter()
    expect(within(footer()).getByRole('link', { name: 'mangcoding Store' })).toHaveAttribute(
      'href',
      '/'
    )
    expect(
      within(footer()).getByText(
        'Explore everyday clothing at Mangcoding Store, from T-shirts and shirts to jackets and jeans. Find pieces that fit your personal style.'
      )
    ).toBeInTheDocument()
  })

  it('footer logo image is decorative', () => {
    renderFooter()
    const logo = within(footer()).getByRole('link', { name: 'mangcoding Store' })
    expect(logo.querySelector('img')).toHaveAttribute('alt', '')
  })
})

describe('Footer groups', () => {
  it('renders headings Home, Shop, Categories, Contact in order inside the Footer nav', () => {
    renderFooter()
    const headings = within(footerNav()).getAllByRole('heading', { level: 2 })
    expect(headings.map((heading) => heading.textContent)).toEqual([
      'Home',
      'Shop',
      'Categories',
      'Contact',
    ])
  })

  it('renders no button for the hidden Figma layer when logged in', () => {
    logIn()
    renderFooter()
    expect(within(footer()).queryAllByRole('button')).toHaveLength(0)
  })
})

describe('Footer links', () => {
  it('every footer text link except the email points to /shop', () => {
    renderFooter()
    const links = within(footerNav())
      .getAllByRole('link')
      .filter((link) => !link.getAttribute('href')?.startsWith('mailto:'))
    expect(links).toHaveLength(10)
    for (const link of links) expect(link).toHaveAttribute('href', '/shop')
  })

  it('renders Jeans and Women, never Jens or Woman', () => {
    renderFooter()
    const nav = within(footerNav())
    expect(nav.getByRole('link', { name: 'Jeans' })).toBeInTheDocument()
    expect(nav.getByRole('link', { name: 'Women' })).toBeInTheDocument()
    expect(nav.queryByText('Jens')).toBeNull()
    expect(nav.queryByText('Woman')).toBeNull()
  })
})

describe('Footer Log In', () => {
  it('guest clicking Log In opens ?auth=login on the current page and keeps the query', async () => {
    renderFooter('/search?q=shirt')
    await userEvent.click(within(footer()).getByRole('button', { name: 'Log In' }))
    const url = currentUrl()
    expect(url.pathname).toBe('/search')
    expect(url.searchParams.get('q')).toBe('shirt')
    expect(url.searchParams.get('auth')).toBe('login')
  })

  it('logged-in user sees no Log In', () => {
    logIn()
    renderFooter()
    expect(within(footer()).queryByRole('button', { name: 'Log In' })).toBeNull()
  })

  it('Log In adds no redirect param', async () => {
    renderFooter('/')
    await userEvent.click(within(footer()).getByRole('button', { name: 'Log In' }))
    expect(currentUrl().searchParams.has('redirect')).toBe(false)
  })

  it('Log In does not change the current path', async () => {
    renderFooter('/shop/p1')
    await userEvent.click(within(footer()).getByRole('button', { name: 'Log In' }))
    expect(currentUrl().pathname).toBe('/shop/p1')
  })
})

describe('Footer contact', () => {
  it('email link is mailto:mangcoding@gmail.com named by the address', () => {
    renderFooter()
    expect(within(footer()).getByRole('link', { name: 'mangcoding@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:mangcoding@gmail.com'
    )
  })

  it('shows Facebook, Twitter, LinkedIn, Instagram images named in the Social media list', () => {
    renderFooter()
    const images = within(socialList()).getAllByRole('img')
    expect(images.map((image) => image.getAttribute('alt'))).toEqual([
      'Facebook',
      'Twitter',
      'LinkedIn',
      'Instagram',
    ])
  })

  it('renders no link or focusable element for a social item without a URL', () => {
    renderFooter()
    expect(within(socialList()).queryAllByRole('link')).toHaveLength(0)
    expect(socialList().querySelectorAll('a, button, [tabindex]')).toHaveLength(0)
  })
})

describe('Footer Contact layout', () => {
  function contactGroup(): HTMLElement | null {
    return within(footerNav()).getByRole('heading', { name: 'Contact' }).parentElement
  }

  it('Contact group spans both columns below md', () => {
    renderFooter()
    expect(contactGroup()).toHaveClass('col-span-2')
  })

  it('Contact group does not span two columns from md', () => {
    renderFooter()
    expect(contactGroup()).toHaveClass('md:col-span-1')
  })
})

describe('Footer interaction classes', () => {
  it('footer links and Log In use the white focus ring and link hover opacity', () => {
    renderFooter()
    const controls = [
      ...within(footer()).getAllByRole('link'),
      within(footer()).getByRole('button', { name: 'Log In' }),
    ]
    for (const control of controls) {
      expect(control).toHaveClass(
        'focus-visible:ring-2',
        'focus-visible:ring-white',
        'can-hover:hover:opacity-90'
      )
    }
  })

  it('no footer control keeps the primary focus ring color', () => {
    renderFooter()
    expect(footer().querySelectorAll('.focus-visible\\:ring-primary')).toHaveLength(0)
  })
})

describe('Footer safe area', () => {
  it('footer pads the bottom and side safe areas', () => {
    renderFooter()
    expect(footer()).toHaveClass('pb-[env(safe-area-inset-bottom)]')
    expect(footer().firstElementChild).toHaveClass(...SAFE_AREA_X_CLASSES)
  })

  it('footer background element has no side safe-area padding', () => {
    renderFooter()
    for (const className of SAFE_AREA_X_CLASSES) expect(footer()).not.toHaveClass(className)
  })
})
