import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_TEXT } from '@/constants/auth'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { VALIDATION_MESSAGES } from '@/schemas/common'
import { ApiError } from '@/services/apiClient'
import * as authService from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { LoginForm } from './LoginForm'
import type { AuthResponse, User } from '@/types'

vi.mock('@/services/authService')

const customer: User = {
  id: 'u1',
  name: 'Test Customer',
  email: 'user@store.com',
  role: 'customer',
}
const authResponse: AuthResponse = { user: customer, token: 'mock-token-u1' }
const VALID_EMAIL = 'user@store.com'
const VALID_PASSWORD = 'user123'

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function currentUrl(): URL {
  return new URL(screen.getByTestId('location').textContent ?? '', 'http://localhost')
}

function renderForm({ path = '/?auth=login', isLoginPending = false } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <LoginForm isLoginPending={isLoginPending} autoFocusEmail />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { ...view, user: userEvent.setup() }
}

function emailInput(): HTMLElement {
  return screen.getByLabelText(AUTH_TEXT.emailLabel)
}

function passwordInput(): HTMLElement {
  return screen.getByLabelText(AUTH_TEXT.passwordLabel)
}

function submitButton(name: string = AUTH_TEXT.logIn): HTMLElement {
  return screen.getByRole('button', { name })
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  email: string = VALID_EMAIL,
  password: string = VALID_PASSWORD
): Promise<void> {
  if (email) await user.type(emailInput(), email)
  if (password) await user.type(passwordInput(), password)
  await user.click(submitButton())
}

function neverSettlingLogin(): void {
  vi.mocked(authService.login).mockReturnValue(new Promise<AuthResponse>(() => {}))
}

function loginCalls(): unknown[] {
  return vi.mocked(authService.login).mock.calls.map(([credentials]) => credentials)
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  useToastStore.setState({ toasts: [] })
  localStorage.clear()
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('LoginForm email validation', () => {
  it('accepts a valid email without an inline error', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(emailInput()).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows Email is required for an empty email', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, '')
    expect(await screen.findByText(VALIDATION_MESSAGES.emailRequired)).toBeInTheDocument()
  })

  it('shows Enter a valid email for an invalid email', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, 'not-an-email')
    expect(await screen.findByText(VALIDATION_MESSAGES.emailInvalid)).toBeInTheDocument()
  })
})

describe('LoginForm password validation', () => {
  it('accepts a 6-character password without an inline error', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user, VALID_EMAIL, 'abc123')
    expect(passwordInput()).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows Password is required for an empty password', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, VALID_EMAIL, '')
    expect(await screen.findByText(VALIDATION_MESSAGES.passwordRequired)).toBeInTheDocument()
  })

  it('shows the min-length error for a 5-character password', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, VALID_EMAIL, 'abc12')
    expect(await screen.findByText(VALIDATION_MESSAGES.passwordMin)).toBeInTheDocument()
  })
})

describe('LoginForm submit', () => {
  it('sends the typed email and password to the service once', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() =>
      expect(loginCalls()).toEqual([{ email: VALID_EMAIL, password: VALID_PASSWORD }])
    )
  })

  it('sends nothing when a field is invalid', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, 'not-an-email', 'abc12')
    await screen.findByText(VALIDATION_MESSAGES.emailInvalid)
    expect(authService.login).not.toHaveBeenCalled()
  })

  it('focuses the first invalid field', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, '', '')
    await screen.findByText(VALIDATION_MESSAGES.emailRequired)
    expect(emailInput()).toHaveFocus()
  })
})

describe('LoginForm credential errors', () => {
  it('shows the credentials text at the top as an alert for a wrong password', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError(401, authService.AUTH_ERRORS.wrongPassword)
    )
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent(AUTH_TEXT.invalidCredentials)
  })

  it('shows the same credentials text for an unknown email', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError(404, authService.AUTH_ERRORS.emailNotFound)
    )
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent(AUTH_TEXT.invalidCredentials)
  })

  it('shows no toast for a wrong password', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError(401, authService.AUTH_ERRORS.wrongPassword)
    )
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(useToastStore.getState().toasts).toEqual([])
  })
})

describe('LoginForm retryable errors', () => {
  it('network error shows the network text and Try again', async () => {
    vi.mocked(authService.login).mockRejectedValue(new ApiError(0, 'Network error'))
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent(TOAST_MESSAGES.network.error)
    expect(submitButton(AUTH_TEXT.retry)).toHaveAttribute('type', 'submit')
  })

  it('credential error keeps the button text Log In', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError(401, authService.AUTH_ERRORS.wrongPassword)
    )
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(submitButton()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: AUTH_TEXT.retry })).toBeNull()
  })

  it('Try again resubmits and logs in', async () => {
    vi.mocked(authService.login)
      .mockRejectedValueOnce(new ApiError(0, 'Network error'))
      .mockResolvedValueOnce(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    await user.click(await screen.findByRole('button', { name: AUTH_TEXT.retry }))
    await waitFor(() => expect(useAuthStore.getState().user).toEqual(customer))
    expect(authService.login).toHaveBeenCalledTimes(2)
  })

  it('Try again with an emptied field shows the inline error and sends nothing', async () => {
    vi.mocked(authService.login).mockRejectedValue(new ApiError(0, 'Network error'))
    const { user } = renderForm()
    await fillAndSubmit(user)
    const retry = await screen.findByRole('button', { name: AUTH_TEXT.retry })
    await user.clear(emailInput())
    await user.click(retry)
    expect(await screen.findByText(VALIDATION_MESSAGES.emailRequired)).toBeInTheDocument()
    expect(authService.login).toHaveBeenCalledTimes(1)
  })
})

describe('LoginForm submitting state', () => {
  it('disables the button with a spinner while submitting', async () => {
    neverSettlingLogin()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() => expect(submitButton()).toHaveAttribute('aria-busy', 'true'))
    expect(submitButton()).toBeDisabled()
  })

  it('enables the button again after a failed submit', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError(401, authService.AUTH_ERRORS.wrongPassword)
    )
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(submitButton()).toBeEnabled()
    expect(submitButton()).not.toHaveAttribute('aria-busy')
  })
})

describe('LoginForm top error lifetime', () => {
  it('a new submit removes the old top error', async () => {
    vi.mocked(authService.login)
      .mockRejectedValueOnce(new ApiError(401, authService.AUTH_ERRORS.wrongPassword))
      .mockReturnValueOnce(new Promise<AuthResponse>(() => {}))
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    await user.click(submitButton())
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  })

  it('editing a field keeps the top error', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError(401, authService.AUTH_ERRORS.wrongPassword)
    )
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    await user.type(passwordInput(), '4')
    expect(screen.getByRole('alert')).toHaveTextContent(AUTH_TEXT.invalidCredentials)
  })
})

describe('LoginForm success redirect', () => {
  it('success goes to the redirect without auth params', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const { user } = renderForm({ path: '/shop?auth=login&redirect=%2Fcart' })
    await fillAndSubmit(user)
    await waitFor(() => expect(currentUrl().pathname).toBe('/cart'))
    expect(currentUrl().search).toBe('')
  })

  it('success with an unsafe redirect stays on the page without auth params', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const { user } = renderForm({
      path: '/shop?auth=login&redirect=https%3A%2F%2Fevil.example%2Fcart',
    })
    await fillAndSubmit(user)
    await waitFor(() => expect(currentUrl().search).toBe(''))
    expect(currentUrl().pathname).toBe('/shop')
  })
})

describe('LoginForm session', () => {
  it('success saves the session and shows Welcome back, {name}', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() => expect(useAuthStore.getState().user).toEqual(customer))
    expect(useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))).toEqual(
      [{ type: 'success', message: TOAST_MESSAGES.auth.welcomeBack(customer.name) }]
    )
  })

  it('failure keeps the session empty', async () => {
    vi.mocked(authService.login).mockRejectedValue(
      new ApiError(401, authService.AUTH_ERRORS.wrongPassword)
    )
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('LoginForm Sign up link', () => {
  it('Sign up switches to auth=register and keeps redirect', async () => {
    const { user } = renderForm({ path: '/?auth=login&redirect=%2Fcart' })
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.switchToSignUp }))
    expect(currentUrl().searchParams.get('auth')).toBe('register')
    expect(currentUrl().searchParams.get('redirect')).toBe('/cart')
  })

  it('Sign up does not submit the form', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.switchToSignUp }))
    expect(authService.login).not.toHaveBeenCalled()
    expect(screen.queryByText(VALIDATION_MESSAGES.emailRequired)).toBeNull()
  })

  it('Sign up is disabled while submitting', async () => {
    neverSettlingLogin()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: AUTH_TEXT.switchToSignUp })).toBeDisabled()
    )
  })
})

describe('LoginForm attributes', () => {
  it('uses email and current-password autocomplete with empty defaults', () => {
    renderForm()
    expect(emailInput()).toHaveAttribute('type', 'email')
    expect(emailInput()).toHaveAttribute('autocomplete', 'email')
    expect(emailInput()).toHaveValue('')
    expect(passwordInput()).toHaveAttribute('type', 'password')
    expect(passwordInput()).toHaveAttribute('autocomplete', 'current-password')
    expect(passwordInput()).toHaveValue('')
  })

  it('browser validation does not block an invalid email (noValidate)', async () => {
    const { user, container } = renderForm()
    expect(container.querySelector('form')).toHaveAttribute('novalidate')
    await fillAndSubmit(user, 'not-an-email')
    expect(await screen.findByText(VALIDATION_MESSAGES.emailInvalid)).toBeInTheDocument()
  })
})

describe('LoginForm isLoginPending', () => {
  it('submits normally when isLoginPending is false', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const { user } = renderForm({ isLoginPending: false })
    await fillAndSubmit(user)
    await waitFor(() => expect(authService.login).toHaveBeenCalledTimes(1))
  })

  it('shows the spinner and sends nothing when isLoginPending is true', async () => {
    const { user, container } = renderForm({ isLoginPending: true })
    expect(submitButton()).toHaveAttribute('aria-busy', 'true')
    await user.type(emailInput(), VALID_EMAIL)
    await user.type(passwordInput(), VALID_PASSWORD)
    const form = container.querySelector('form')
    if (!form) throw new Error('form not rendered')
    await act(async () => {
      fireEvent.submit(form)
    })
    expect(authService.login).not.toHaveBeenCalled()
  })
})
