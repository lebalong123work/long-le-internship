import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_TEXT } from '@/constants/auth'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { useAuthModal } from '@/hooks/useAuthModal'
import { ApiError } from '@/services/apiClient'
import * as authService from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { registerPendingActionHandler, usePendingActionStore } from '@/stores/pendingActionStore'
import { useToastStore } from '@/stores/toastStore'
import { installDialogStub } from '@/test/dialogStub'
import { AuthModal } from './AuthModal'
import type { AuthResponse, PendingAction, User } from '@/types'

vi.mock('@/services/authService')

const newCustomer: User = {
  id: 'u2',
  name: 'New Customer',
  email: 'new@store.test',
  role: 'customer',
}
const authResponse: AuthResponse = { user: newCustomer, token: 'mock-token-u2' }
const saveToWishlist: PendingAction = { type: 'toggleWishlist', productId: 'p1' }
const VALID_PASSWORD = 'secret1'
const REOPEN_LOGIN = 'Reopen login'
const REOPEN_REGISTER = 'Reopen sign up'
const CLOSE_DIALOG = 'Close dialog'

let unregisterHandler: (() => void) | null = null

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function ReopenButtons(): JSX.Element {
  const { open } = useAuthModal()
  return (
    <>
      <button type="button" onClick={() => open('login')}>
        {REOPEN_LOGIN}
      </button>
      <button type="button" onClick={() => open('register')}>
        {REOPEN_REGISTER}
      </button>
    </>
  )
}

function currentUrl(): URL {
  return new URL(screen.getByTestId('location').textContent ?? '', 'http://localhost')
}

function renderModal(path = '/?auth=register') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <AuthModal />
        <LocationProbe />
        <ReopenButtons />
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

function nameInput(): HTMLElement {
  return screen.getByLabelText(AUTH_TEXT.nameLabel)
}

function withPendingHandler(): ReturnType<typeof vi.fn> {
  const handler = vi.fn()
  unregisterHandler = registerPendingActionHandler('toggleWishlist', handler)
  usePendingActionStore.getState().setAction(saveToWishlist)
  return handler
}

function deferredRegister(): { resolve: (value: AuthResponse) => void } {
  const controls = { resolve: (value: AuthResponse): void => void value }
  const promise = new Promise<AuthResponse>((resolve) => {
    controls.resolve = resolve
  })
  vi.mocked(authService.register).mockReturnValue(promise)
  return controls
}

async function fillRegister(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.type(nameInput(), newCustomer.name)
  await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), newCustomer.email)
  await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), VALID_PASSWORD)
  await user.type(screen.getByLabelText(AUTH_TEXT.confirmPasswordLabel), VALID_PASSWORD)
}

async function submitValidRegister(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await fillRegister(user)
  await user.click(screen.getByRole('button', { name: AUTH_TEXT.signUp }))
}

function submitEventOn(button: HTMLElement): void {
  const form = button.closest('form')
  if (!form) throw new Error('form not rendered')
  fireEvent.submit(form)
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

describe('AuthModal register focus on open', () => {
  it('focuses the Full name field on open', () => {
    renderModal()
    expect(nameInput()).toHaveFocus()
  })

  it('does not focus the close button first', () => {
    renderModal()
    expect(screen.getByRole('button', { name: CLOSE_DIALOG })).not.toHaveFocus()
  })
})

describe('AuthModal focus after a form link switch', () => {
  it('the Sign up link focuses the Full name field', async () => {
    const { user } = renderModal('/?auth=login')
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.switchToSignUp }))
    expect(nameInput()).toHaveFocus()
  })

  it('the Log in link focuses the email field', async () => {
    const { user } = renderModal()
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.switchToLogIn }))
    expect(screen.getByLabelText(AUTH_TEXT.emailLabel)).toHaveFocus()
  })

  it('after a tab switch the Sign up link still focuses the Full name field', async () => {
    const { user } = renderModal('/?auth=login')
    await user.click(tab(AUTH_TEXT.signUp))
    await user.click(tab(AUTH_TEXT.logIn))
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.switchToSignUp }))
    expect(nameInput()).toHaveFocus()
  })

  it('after clicking the already active tab the Sign up link still focuses the Full name field', async () => {
    const { user } = renderModal('/?auth=login')
    await user.click(tab(AUTH_TEXT.logIn))
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.switchToSignUp }))
    expect(nameInput()).toHaveFocus()
  })

  it('a tab switch to Sign Up keeps focus on the tab', async () => {
    const { user } = renderModal('/?auth=login')
    await user.click(tab(AUTH_TEXT.signUp))
    expect(currentUrl().searchParams.get('auth')).toBe('register')
    expect(tab(AUTH_TEXT.signUp)).toHaveFocus()
  })

  it('clicking the already active tab keeps focus on it and changes nothing', async () => {
    const { user } = renderModal('/?auth=register&redirect=%2Fcart')
    await user.click(tab(AUTH_TEXT.signUp))
    expect(tab(AUTH_TEXT.signUp)).toHaveFocus()
    expect(currentUrl().search).toBe('?auth=register&redirect=%2Fcart')
  })
})

describe('AuthModal sign up success flow', () => {
  it('sign up success runs the pending action once before the modal closes', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const handler = withPendingHandler()
    const dialogOpenAtRun: boolean[] = []
    handler.mockImplementation(() => dialogOpenAtRun.push(authDialog().open))
    const { user } = renderModal()

    await submitValidRegister(user)

    await waitFor(() => expect(authDialog().open).toBe(false))
    expect(handler).toHaveBeenCalledTimes(1)
    expect(handler).toHaveBeenCalledWith(saveToWishlist, newCustomer)
    expect(dialogOpenAtRun).toEqual([true])
  })

  it('sign up success with nothing pending runs no handler', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const handler = vi.fn()
    unregisterHandler = registerPendingActionHandler('toggleWishlist', handler)
    const { user } = renderModal()

    await submitValidRegister(user)

    await waitFor(() => expect(authDialog().open).toBe(false))
    expect(handler).not.toHaveBeenCalled()
  })

  it('sign up success closes the modal and goes to the redirect', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderModal('/shop?auth=register&redirect=%2Fcart')

    await submitValidRegister(user)

    await waitFor(() => expect(currentUrl().pathname).toBe('/cart'))
    expect(currentUrl().search).toBe('')
    expect(authDialog().open).toBe(false)
  })

  it('sign up failure keeps the modal open with the top error', async () => {
    vi.mocked(authService.register).mockRejectedValue(
      new ApiError(409, authService.AUTH_ERRORS.emailExists)
    )
    const { user } = renderModal()

    await submitValidRegister(user)

    expect(await screen.findByRole('alert')).toHaveTextContent(authService.AUTH_ERRORS.emailExists)
    expect(authDialog().open).toBe(true)
    expect(currentUrl().searchParams.get('auth')).toBe('register')
  })
})

describe('AuthModal close while signing up', () => {
  it('closing while signing up still saves the session and shows Account created', async () => {
    const signUp = deferredRegister()
    const { user } = renderModal()
    await submitValidRegister(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))

    await act(async () => signUp.resolve(authResponse))

    await waitFor(() => expect(useAuthStore.getState().user).toEqual(newCustomer))
    expect(useToastStore.getState().toasts.map(({ message }) => message)).toEqual([
      TOAST_MESSAGES.auth.accountCreated,
    ])
  })

  it('closing while signing up neither redirects nor runs the pending action', async () => {
    const signUp = deferredRegister()
    const handler = withPendingHandler()
    const { user } = renderModal('/shop?auth=register&redirect=%2Fcart')
    await submitValidRegister(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))

    await act(async () => signUp.resolve(authResponse))

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(true))
    expect(currentUrl().pathname).toBe('/shop')
    expect(currentUrl().search).toBe('')
    expect(handler).not.toHaveBeenCalled()
  })
})

describe('AuthModal while signing up', () => {
  it('disables the tabs while signing up', async () => {
    deferredRegister()
    const { user } = renderModal()
    await submitValidRegister(user)
    await waitFor(() => expect(tab(AUTH_TEXT.logIn)).toBeDisabled())
    expect(tab(AUTH_TEXT.signUp)).toBeDisabled()
  })

  it('keeps the close button working while signing up', async () => {
    deferredRegister()
    const { user } = renderModal()
    await submitValidRegister(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    expect(authDialog().open).toBe(false)
    expect(currentUrl().search).toBe('')
  })

  it('a reopened Sign Up form cannot submit a second sign up while the first is in flight', async () => {
    deferredRegister()
    const { user } = renderModal()
    await submitValidRegister(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    await user.click(screen.getByRole('button', { name: REOPEN_REGISTER }))

    const submit = screen.getByRole('button', { name: AUTH_TEXT.signUp })
    expect(submit).toHaveAttribute('aria-busy', 'true')
    await fillRegister(user)
    await act(async () => {
      submitEventOn(submit)
    })
    expect(authService.register).toHaveBeenCalledTimes(1)
  })

  it('a reopened Log In form cannot log in while a sign up is in flight', async () => {
    deferredRegister()
    const { user } = renderModal()
    await submitValidRegister(user)
    await user.click(screen.getByRole('button', { name: CLOSE_DIALOG }))
    await user.click(screen.getByRole('button', { name: REOPEN_LOGIN }))

    const submit = screen.getByRole('button', { name: AUTH_TEXT.logIn })
    expect(submit).toHaveAttribute('aria-busy', 'true')
    await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), newCustomer.email)
    await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), VALID_PASSWORD)
    await act(async () => {
      submitEventOn(submit)
    })
    expect(authService.login).not.toHaveBeenCalled()
  })
})
