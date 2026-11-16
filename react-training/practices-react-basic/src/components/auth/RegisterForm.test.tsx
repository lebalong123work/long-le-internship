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
import { registerPendingActionHandler, usePendingActionStore } from '@/stores/pendingActionStore'
import { useToastStore } from '@/stores/toastStore'
import { RegisterForm } from './RegisterForm'
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
const VALID_NAME = 'New Customer'
const VALID_EMAIL = 'new@store.test'
const VALID_PASSWORD = 'secret1'

interface RegisterInput {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

let unregisterHandler: (() => void) | null = null

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function currentUrl(): URL {
  return new URL(screen.getByTestId('location').textContent ?? '', 'http://localhost')
}

function renderForm({ path = '/?auth=register', isAuthPending = false } = {}) {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <RegisterForm isAuthPending={isAuthPending} autoFocusName />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { ...view, user: userEvent.setup() }
}

function nameInput(): HTMLElement {
  return screen.getByLabelText(AUTH_TEXT.nameLabel)
}

function emailInput(): HTMLElement {
  return screen.getByLabelText(AUTH_TEXT.emailLabel)
}

function passwordInput(): HTMLElement {
  return screen.getByLabelText(AUTH_TEXT.passwordLabel)
}

function confirmInput(): HTMLElement {
  return screen.getByLabelText(AUTH_TEXT.confirmPasswordLabel)
}

function submitButton(name: string = AUTH_TEXT.signUp): HTMLElement {
  return screen.getByRole('button', { name })
}

function formElement(container: HTMLElement): HTMLFormElement {
  const form = container.querySelector('form')
  if (!form) throw new Error('form not rendered')
  return form
}

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  {
    name = VALID_NAME,
    email = VALID_EMAIL,
    password = VALID_PASSWORD,
    confirmPassword = password,
  }: RegisterInput = {}
): Promise<void> {
  if (name) await user.type(nameInput(), name)
  if (email) await user.type(emailInput(), email)
  if (password) await user.type(passwordInput(), password)
  if (confirmPassword) await user.type(confirmInput(), confirmPassword)
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  input: RegisterInput = {}
): Promise<void> {
  await fillForm(user, input)
  await user.click(submitButton())
}

function neverSettlingRegister(): void {
  vi.mocked(authService.register).mockReturnValue(new Promise<AuthResponse>(() => {}))
}

function rejectWithEmailExists(): void {
  vi.mocked(authService.register).mockRejectedValue(
    new ApiError(409, authService.AUTH_ERRORS.emailExists)
  )
}

function registerCalls(): unknown[] {
  return vi.mocked(authService.register).mock.calls.map(([credentials]) => credentials)
}

function withPendingHandler(): ReturnType<typeof vi.fn> {
  const handler = vi.fn()
  unregisterHandler = registerPendingActionHandler('toggleWishlist', handler)
  usePendingActionStore.getState().setAction(saveToWishlist)
  return handler
}

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

describe('RegisterForm name validation', () => {
  it('accepts a full name without an inline error', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(nameInput()).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows Full name is required for an empty name', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { name: '' })
    expect(await screen.findByText(VALIDATION_MESSAGES.nameRequired)).toBeInTheDocument()
  })

  it('shows Full name is required for a name of only spaces', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { name: '   ' })
    expect(await screen.findByText(VALIDATION_MESSAGES.nameRequired)).toBeInTheDocument()
  })
})

describe('RegisterForm email validation', () => {
  it('accepts a valid email without an inline error', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(emailInput()).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows Email is required for an empty email', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { email: '' })
    expect(await screen.findByText(VALIDATION_MESSAGES.emailRequired)).toBeInTheDocument()
  })

  it('shows Enter a valid email for an invalid email', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { email: 'not-an-email' })
    expect(await screen.findByText(VALIDATION_MESSAGES.emailInvalid)).toBeInTheDocument()
  })
})

describe('RegisterForm password validation', () => {
  it('accepts a 6-character password without an inline error', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user, { password: 'abc123' })
    expect(passwordInput()).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows Password is required for an empty password', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { password: '', confirmPassword: '' })
    expect(await screen.findByText(VALIDATION_MESSAGES.passwordRequired)).toBeInTheDocument()
  })

  it('shows the min-length error for a 5-character password', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { password: 'abc12' })
    expect(await screen.findByText(VALIDATION_MESSAGES.passwordMin)).toBeInTheDocument()
  })
})

describe('RegisterForm confirm password', () => {
  it('accepts a matching confirm password', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(confirmInput()).toHaveAttribute('aria-invalid', 'false')
  })

  it('shows Passwords do not match for a different confirm password', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { confirmPassword: 'secret2' })
    expect(await screen.findByText(VALIDATION_MESSAGES.confirmPasswordMismatch)).toBeInTheDocument()
  })

  it('shows Passwords do not match for an empty confirm password', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { confirmPassword: '' })
    expect(await screen.findByText(VALIDATION_MESSAGES.confirmPasswordMismatch)).toBeInTheDocument()
  })
})

describe('RegisterForm password change re-checks confirm', () => {
  it('fixing the password to match clears the mismatch error', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { password: 'secret1', confirmPassword: 'secret12' })
    await screen.findByText(VALIDATION_MESSAGES.confirmPasswordMismatch)
    await user.type(passwordInput(), '2')
    await waitFor(() =>
      expect(screen.queryByText(VALIDATION_MESSAGES.confirmPasswordMismatch)).toBeNull()
    )
  })

  it('changing the password after a match shows the mismatch error', async () => {
    rejectWithEmailExists()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    await user.type(passwordInput(), 'x')
    expect(await screen.findByText(VALIDATION_MESSAGES.confirmPasswordMismatch)).toBeInTheDocument()
  })
})

describe('RegisterForm submit', () => {
  it('sends name, email and password without confirmPassword once', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() =>
      expect(registerCalls()).toEqual([
        { name: VALID_NAME, email: VALID_EMAIL, password: VALID_PASSWORD },
      ])
    )
  })

  it('trims the name and email but not the password', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user, {
      name: `  ${VALID_NAME}  `,
      email: `  ${VALID_EMAIL}  `,
      password: ' secret1 ',
    })
    await waitFor(() =>
      expect(registerCalls()).toEqual([
        { name: VALID_NAME, email: VALID_EMAIL, password: ' secret1 ' },
      ])
    )
  })

  it('sends nothing when a field is invalid', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { email: 'not-an-email' })
    await screen.findByText(VALIDATION_MESSAGES.emailInvalid)
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('focuses the first invalid field', async () => {
    const { user } = renderForm()
    await fillAndSubmit(user, { name: '', email: '', password: '', confirmPassword: '' })
    await screen.findByText(VALIDATION_MESSAGES.nameRequired)
    expect(nameInput()).toHaveFocus()
  })
})

describe('RegisterForm existing email', () => {
  it('shows Email already exists at the top as an alert', async () => {
    rejectWithEmailExists()
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent(authService.AUTH_ERRORS.emailExists)
  })

  it('shows no toast for an existing email', async () => {
    rejectWithEmailExists()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(useToastStore.getState().toasts).toEqual([])
  })

  it('keeps the button text Sign Up for an existing email', async () => {
    rejectWithEmailExists()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(submitButton()).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: AUTH_TEXT.retry })).toBeNull()
  })
})

describe('RegisterForm retryable errors', () => {
  it('network error shows the network text and Try again', async () => {
    vi.mocked(authService.register).mockRejectedValue(new ApiError(0, 'Network error'))
    const { user } = renderForm()
    await fillAndSubmit(user)
    expect(await screen.findByRole('alert')).toHaveTextContent(TOAST_MESSAGES.network.error)
    expect(submitButton(AUTH_TEXT.retry)).toHaveAttribute('type', 'submit')
  })

  it('Try again resubmits and signs up', async () => {
    vi.mocked(authService.register)
      .mockRejectedValueOnce(new ApiError(0, 'Network error'))
      .mockResolvedValueOnce(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    await user.click(await screen.findByRole('button', { name: AUTH_TEXT.retry }))
    await waitFor(() => expect(useAuthStore.getState().user).toEqual(newCustomer))
    expect(authService.register).toHaveBeenCalledTimes(2)
  })

  it('Try again with an emptied field shows the inline error and sends nothing', async () => {
    vi.mocked(authService.register).mockRejectedValue(new ApiError(0, 'Network error'))
    const { user } = renderForm()
    await fillAndSubmit(user)
    const retry = await screen.findByRole('button', { name: AUTH_TEXT.retry })
    await user.clear(nameInput())
    await user.click(retry)
    expect(await screen.findByText(VALIDATION_MESSAGES.nameRequired)).toBeInTheDocument()
    expect(authService.register).toHaveBeenCalledTimes(1)
  })
})

describe('RegisterForm submitting state', () => {
  it('disables the button with a spinner while submitting', async () => {
    neverSettlingRegister()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() => expect(submitButton()).toHaveAttribute('aria-busy', 'true'))
    expect(submitButton()).toBeDisabled()
  })

  it('enables the button again after a failed submit', async () => {
    rejectWithEmailExists()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(submitButton()).toBeEnabled()
    expect(submitButton()).not.toHaveAttribute('aria-busy')
  })
})

describe('RegisterForm top error lifetime', () => {
  it('a new submit removes the old top error', async () => {
    vi.mocked(authService.register)
      .mockRejectedValueOnce(new ApiError(409, authService.AUTH_ERRORS.emailExists))
      .mockReturnValueOnce(new Promise<AuthResponse>(() => {}))
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    await user.click(submitButton())
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  })

  it('editing a field keeps the top error', async () => {
    rejectWithEmailExists()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    await user.type(emailInput(), 'x')
    expect(screen.getByRole('alert')).toHaveTextContent(authService.AUTH_ERRORS.emailExists)
  })
})

describe('RegisterForm success redirect', () => {
  it('success goes to the redirect without auth params', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm({ path: '/shop?auth=register&redirect=%2Fcart' })
    await fillAndSubmit(user)
    await waitFor(() => expect(currentUrl().pathname).toBe('/cart'))
    expect(currentUrl().search).toBe('')
  })

  it('success with an unsafe redirect stays on the page without auth params', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm({
      path: '/shop?auth=register&redirect=https%3A%2F%2Fevil.example%2Fcart',
    })
    await fillAndSubmit(user)
    await waitFor(() => expect(currentUrl().search).toBe(''))
    expect(currentUrl().pathname).toBe('/shop')
  })
})

describe('RegisterForm session', () => {
  it('success saves the session and shows Account created', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() => expect(useAuthStore.getState().user).toEqual(newCustomer))
    expect(useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))).toEqual(
      [{ type: 'success', message: TOAST_MESSAGES.auth.accountCreated }]
    )
  })

  it('failure keeps the session empty', async () => {
    rejectWithEmailExists()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})

describe('RegisterForm pending action', () => {
  it('success runs the pending action with the new user', async () => {
    const handler = withPendingHandler()
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() => expect(handler).toHaveBeenCalledTimes(1))
    expect(handler).toHaveBeenCalledWith(saveToWishlist, newCustomer)
    expect(usePendingActionStore.getState().action).toBeNull()
  })

  it('failure keeps the pending action and runs no handler', async () => {
    const handler = withPendingHandler()
    rejectWithEmailExists()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await screen.findByRole('alert')
    expect(handler).not.toHaveBeenCalled()
    expect(usePendingActionStore.getState().action).toEqual(saveToWishlist)
  })
})

describe('RegisterForm Log in link', () => {
  it('Log in switches to auth=login and keeps redirect', async () => {
    const { user } = renderForm({ path: '/?auth=register&redirect=%2Fcart' })
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.switchToLogIn }))
    expect(currentUrl().searchParams.get('auth')).toBe('login')
    expect(currentUrl().searchParams.get('redirect')).toBe('/cart')
  })

  it('Log in does not submit the form', async () => {
    const { user } = renderForm()
    await user.click(screen.getByRole('button', { name: AUTH_TEXT.switchToLogIn }))
    expect(authService.register).not.toHaveBeenCalled()
    expect(screen.queryByText(VALIDATION_MESSAGES.nameRequired)).toBeNull()
  })

  it('Log in is disabled while submitting', async () => {
    neverSettlingRegister()
    const { user } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: AUTH_TEXT.switchToLogIn })).toBeDisabled()
    )
  })
})

describe('RegisterForm attributes', () => {
  it('uses name, email and new-password autocomplete with empty defaults', () => {
    renderForm()
    expect(nameInput()).toHaveAttribute('autocomplete', 'name')
    expect(emailInput()).toHaveAttribute('type', 'email')
    expect(emailInput()).toHaveAttribute('autocomplete', 'email')
    expect(passwordInput()).toHaveAttribute('type', 'password')
    expect(passwordInput()).toHaveAttribute('autocomplete', 'new-password')
    expect(confirmInput()).toHaveAttribute('type', 'password')
    expect(confirmInput()).toHaveAttribute('autocomplete', 'new-password')
    for (const input of [nameInput(), emailInput(), passwordInput(), confirmInput()]) {
      expect(input).toHaveValue('')
    }
  })

  it('browser validation does not block an invalid email (noValidate)', async () => {
    const { user, container } = renderForm()
    expect(formElement(container)).toHaveAttribute('novalidate')
    await fillAndSubmit(user, { email: 'not-an-email' })
    expect(await screen.findByText(VALIDATION_MESSAGES.emailInvalid)).toBeInTheDocument()
  })
})

describe('RegisterForm isAuthPending', () => {
  it('submits normally when isAuthPending is false', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { user } = renderForm({ isAuthPending: false })
    await fillAndSubmit(user)
    await waitFor(() => expect(authService.register).toHaveBeenCalledTimes(1))
  })

  it('shows the spinner and sends nothing when isAuthPending is true', async () => {
    const { user, container } = renderForm({ isAuthPending: true })
    expect(submitButton()).toHaveAttribute('aria-busy', 'true')
    await fillForm(user)
    await act(async () => {
      fireEvent.submit(formElement(container))
    })
    expect(authService.register).not.toHaveBeenCalled()
  })

  it('a submit event while its own sign up is pending sends nothing', async () => {
    neverSettlingRegister()
    const { user, container } = renderForm()
    await fillAndSubmit(user)
    await waitFor(() => expect(submitButton()).toHaveAttribute('aria-busy', 'true'))
    await act(async () => {
      fireEvent.submit(formElement(container))
    })
    expect(authService.register).toHaveBeenCalledTimes(1)
  })

  it('two submit events in a row send one request', async () => {
    neverSettlingRegister()
    const { user, container } = renderForm()
    await fillForm(user)
    await act(async () => {
      fireEvent.submit(formElement(container))
      fireEvent.submit(formElement(container))
    })
    await waitFor(() => expect(authService.register).toHaveBeenCalled())
    expect(authService.register).toHaveBeenCalledTimes(1)
  })
})
