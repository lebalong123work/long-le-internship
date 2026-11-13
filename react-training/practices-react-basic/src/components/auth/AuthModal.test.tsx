import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_TEXT } from '@/constants/auth'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { useAuthModal } from '@/hooks/useAuthModal'
import * as authService from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { registerPendingActionHandler, usePendingActionStore } from '@/stores/pendingActionStore'
import { useToastStore } from '@/stores/toastStore'
import { installDialogStub } from '@/test/dialogStub'
import { AuthModal } from './AuthModal'
import type { AuthResponse, PendingAction, User } from '@/types'

vi.mock('@/services/authService')

const customer: User = {
  id: 'u1',
  name: 'Test Customer',
  email: 'user@store.com',
  role: 'customer',
}
const authResponse: AuthResponse = { user: customer, token: 'mock-token-u1' }
const saveToWishlist: PendingAction = { type: 'toggleWishlist', productId: 'p1' }
const REOPEN = 'Reopen login'
const CLOSE_DIALOG = 'Close dialog'

let unregisterHandler: (() => void) | null = null

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function ReopenButton(): JSX.Element {
  const { open } = useAuthModal()
  return (
    <button type="button" onClick={() => open('login')}>
      {REOPEN}
    </button>
  )
}

function currentUrl(): URL {
  return new URL(screen.getByTestId('location').textContent ?? '', 'http://localhost')
}

function renderModal(path = '/?auth=login') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AuthModal />
        <LocationProbe />
        <ReopenButton />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { user: userEvent.setup() }
}

function authDialog(): HTMLDialogElement {
  const dialog = document.querySelector('dialog')
  if (!(dialog instanceof HTMLDialogElement)) throw new Error('auth dialog not rendered')
  return dialog
}

function tab(name: string): HTMLElement {
  return screen.getByRole('tab', { name })
}

function withPendingHandler(): ReturnType<typeof vi.fn> {
  const handler = vi.fn()
  unregisterHandler = registerPendingActionHandler('toggleWishlist', handler)
  usePendingActionStore.getState().setAction(saveToWishlist)
  return handler
}

function deferredLogin(): { resolve: (value: AuthResponse) => void } {
  const controls = { resolve: (value: AuthResponse): void => void value }
  const promise = new Promise<AuthResponse>((resolve) => {
    controls.resolve = resolve
  })
  vi.mocked(authService.login).mockReturnValue(promise)
  return controls
}

async function submitValidLogin(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), customer.email)
  await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), 'user123')
  await user.click(screen.getByRole('button', { name: AUTH_TEXT.logIn }))
}

beforeAll(() => {
  installDialogStub()
})

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  useToastStore.setState({ toasts: [] })
  usePendingActionStore.setState({ action: null })
  localStorage.clear()
})

afterEach(() => {
  unregisterHandler?.()
  unregisterHandler = null
  vi.resetAllMocks()
})

describe('AuthModal success flow', () => {
  it('success runs the pending action once before the modal closes', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const handler = withPendingHandler()
    const { user } = renderModal('/shop?auth=login&redirect=%2Fcart')

    await submitValidLogin(user)

    await waitFor(() => expect(currentUrl().pathname).toBe('/cart'))
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(saveToWishlist, customer)
    expect(authDialog().open).toBe(false)
  })

  it('success with nothing pending runs no handler', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const handler = vi.fn()
    unregisterHandler = registerPendingActionHandler('toggleWishlist', handler)
    const { user } = renderModal('/shop?auth=login&redirect=%2Fcart')

    await submitValidLogin(user)

    await waitFor(() => expect(currentUrl().pathname).toBe('/cart'))
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('AuthModal open state', () => {
  it('opens the Log In dialog for ?auth=login', () => {
    renderModal()
    expect(screen.getByRole('dialog', { name: AUTH_TEXT.logIn })).toBeInTheDocument()
    expect(authDialog().open).toBe(true)
  })

  it('stays closed for an unknown auth value', () => {
    renderModal('/?auth=admin')
    expect(authDialog().open).toBe(false)
    expect(screen.queryByLabelText(AUTH_TEXT.emailLabel)).toBeNull()
  })

  it('stays closed for a logged-in user', () => {
    useAuthStore.getState().login(customer, authResponse.token)
    renderModal('/?auth=login&redirect=%2Fcart')
    expect(authDialog().open).toBe(false)
    expect(currentUrl().searchParams.get('redirect')).toBe('/cart')
  })
})

describe('AuthModal tabs', () => {
  it('marks the active tab selected and links it to the panel', () => {
    renderModal()
    const panel = screen.getByRole('tabpanel')
    expect(tab(AUTH_TEXT.logIn)).toHaveAttribute('aria-selected', 'true')
    expect(tab(AUTH_TEXT.logIn)).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', tab(AUTH_TEXT.logIn).id)
  })

  it('keeps the inactive tab unselected and out of the tab order', () => {
    renderModal()
    expect(tab(AUTH_TEXT.signUp)).toHaveAttribute('aria-selected', 'false')
    expect(tab(AUTH_TEXT.signUp)).toHaveAttribute('tabindex', '-1')
  })

  it('clicking Sign Up switches to auth=register and keeps redirect', async () => {
    const { user } = renderModal('/?auth=login&redirect=%2Fcart')
    await user.click(tab(AUTH_TEXT.signUp))
    expect(currentUrl().searchParams.get('auth')).toBe('register')
    expect(currentUrl().searchParams.get('redirect')).toBe('/cart')
  })

  it('clicking the selected tab keeps the URL', async () => {
    const { user } = renderModal('/?auth=login&redirect=%2Fcart')
    const before = currentUrl().href
    await user.click(tab(AUTH_TEXT.logIn))
    expect(currentUrl().href).toBe(before)
  })

  it('ArrowRight selects and focuses Sign Up', async () => {
    const { user } = renderModal()
    tab(AUTH_TEXT.logIn).focus()
    await user.keyboard('{ArrowRight}')
    expect(currentUrl().searchParams.get('auth')).toBe('register')
    expect(tab(AUTH_TEXT.signUp)).toHaveFocus()
  })

  it('End and Home select the last and first tab', async () => {
    const { user } = renderModal()
    tab(AUTH_TEXT.logIn).focus()
    await user.keyboard('{End}')
    expect(currentUrl().searchParams.get('auth')).toBe('register')
    await user.keyboard('{Home}')
    expect(currentUrl().searchParams.get('auth')).toBe('login')
    expect(tab(AUTH_TEXT.logIn)).toHaveFocus()
  })

  it('a letter key does not switch tabs', async () => {
    const { user } = renderModal()
    tab(AUTH_TEXT.logIn).focus()
    await user.keyboard('a')
    expect(currentUrl().searchParams.get('auth')).toBe('login')
  })
})

describe('AuthModal focus', () => {
  it('focuses the email field on open', () => {
    renderModal()
    expect(screen.getByLabelText(AUTH_TEXT.emailLabel)).toHaveFocus()
  })

  it('does not focus the close button first', () => {
    renderModal()
    expect(screen.getByRole('button', { name: CLOSE_DIALOG })).not.toHaveFocus()
  })
})

describe('AuthModal focus after a tab switch', () => {
  it('reopening after a tab switch focuses the email field again', async () => {
    const { user } = renderModal()
    await user.click(tab(AUTH_TEXT.signUp))
    await user.click(tab(AUTH_TEXT.logIn))
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    await user.click(screen.getByRole('button', { name: REOPEN }))
    expect(screen.getByLabelText(AUTH_TEXT.emailLabel)).toHaveFocus()
  })

  it('clicking the Log In tab from Sign Up keeps focus on the tab', async () => {
    const { user } = renderModal('/?auth=register')
    await user.click(tab(AUTH_TEXT.logIn))
    expect(currentUrl().searchParams.get('auth')).toBe('login')
    expect(tab(AUTH_TEXT.logIn)).toHaveFocus()
  })
})

describe('AuthModal close', () => {
  it('close removes auth and redirect from the URL', async () => {
    const { user } = renderModal('/shop?auth=login&redirect=%2Fcart')
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    expect(currentUrl().pathname).toBe('/shop')
    expect(currentUrl().search).toBe('')
  })

  it('close unmounts the login form', async () => {
    const { user } = renderModal()
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    expect(authDialog().open).toBe(false)
    expect(screen.queryByLabelText(AUTH_TEXT.emailLabel)).toBeNull()
  })

  it('closing drops the pending action and its handler never runs', async () => {
    const handler = withPendingHandler()
    const { user } = renderModal()
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    expect(usePendingActionStore.getState().action).toBeNull()
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('AuthModal native close event', () => {
  it('a browser close of the open modal still closes it', () => {
    renderModal('/shop?auth=login&redirect=%2Fcart')
    act(() => authDialog().close())
    expect(currentUrl().pathname).toBe('/shop')
    expect(currentUrl().search).toBe('')
  })

  it('a stale close event while the dialog is open again is ignored', () => {
    renderModal('/shop?auth=login&redirect=%2Fcart')
    act(() => {
      authDialog().dispatchEvent(new Event('close'))
    })
    expect(authDialog().open).toBe(true)
    expect(currentUrl().searchParams.get('auth')).toBe('login')
  })
})

describe('AuthModal close while submitting', () => {
  it('closing while submitting still saves the session', async () => {
    const login = deferredLogin()
    const { user } = renderModal()
    await submitValidLogin(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))

    await act(async () => login.resolve(authResponse))

    await waitFor(() => expect(useAuthStore.getState().user).toEqual(customer))
    expect(useToastStore.getState().toasts.map(({ message }) => message)).toEqual([
      TOAST_MESSAGES.auth.welcomeBack(customer.name),
    ])
  })

  it('closing while submitting neither redirects nor runs the pending action', async () => {
    const login = deferredLogin()
    const handler = withPendingHandler()
    const { user } = renderModal('/shop?auth=login&redirect=%2Fcart')
    await submitValidLogin(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))

    await act(async () => login.resolve(authResponse))

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true))
    expect(currentUrl().pathname).toBe('/shop')
    expect(currentUrl().search).toBe('')
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('AuthModal register tab', () => {
  it('?auth=register shows the Sign Up dialog and the register form', () => {
    renderModal('/?auth=register')
    expect(screen.getByRole('dialog', { name: AUTH_TEXT.signUp })).toBeInTheDocument()
    expect(
      within(screen.getByRole('tabpanel')).getByLabelText(AUTH_TEXT.nameLabel)
    ).toBeVisible()
  })

  it('?auth=register shows no login password field', () => {
    renderModal('/?auth=register')
    expect(authDialog().querySelector('[autocomplete="current-password"]')).toBeNull()
  })
})

describe('AuthModal while logging in', () => {
  it('disables the tabs while logging in', async () => {
    deferredLogin()
    const { user } = renderModal()
    await submitValidLogin(user)
    await waitFor(() => expect(tab(AUTH_TEXT.signUp)).toBeDisabled())
    expect(tab(AUTH_TEXT.logIn)).toBeDisabled()
  })

  it('keeps the close button working while logging in', async () => {
    deferredLogin()
    const { user } = renderModal()
    await submitValidLogin(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    expect(authDialog().open).toBe(false)
    expect(currentUrl().search).toBe('')
  })

  it('a reopened modal cannot submit a second login while the first is in flight', async () => {
    deferredLogin()
    const { user } = renderModal()
    await submitValidLogin(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    await user.click(screen.getByRole('button', { name: REOPEN }))

    const submit = screen.getByRole('button', { name: AUTH_TEXT.logIn })
    expect(submit).toHaveAttribute('aria-busy', 'true')
    await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), customer.email)
    await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), 'user123')
    const form = submit.closest('form')
    if (!form) throw new Error('login form not rendered')
    await act(async () => {
      fireEvent.submit(form)
    })
    expect(authService.login).toHaveBeenCalledTimes(1)
  })
})
