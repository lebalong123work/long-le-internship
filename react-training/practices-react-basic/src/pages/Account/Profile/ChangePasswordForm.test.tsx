import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CHANGE_PASSWORD_TEXT, PROFILE_TEXT } from '@/constants/profile'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { VALIDATION_MESSAGES } from '@/schemas/common'
import { ApiError } from '@/services/apiClient'
import * as userService from '@/services/userService'
import { USER_ERRORS } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import Profile from './index'
import type { User } from '@/types'

vi.mock('@/services/userService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/userService')>()),
  getProfile: vi.fn(),
  changePassword: vi.fn(),
}))

const sessionUser: User = {
  id: 'u1',
  name: 'Test Customer',
  email: 'user@store.com',
  role: 'customer',
}
const CURRENT = 'secret1'
const NEXT = 'secret2'

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    </QueryClientProvider>
  )
}

async function showPage() {
  vi.mocked(userService.getProfile).mockResolvedValue(sessionUser)
  const view = renderPage()
  await screen.findByRole('button', { name: PROFILE_TEXT.save })
  return view
}

function passwordSection(): HTMLElement {
  return screen.getByRole('region', { name: CHANGE_PASSWORD_TEXT.heading })
}

function field(label: string): HTMLInputElement {
  return within(passwordSection()).getByLabelText(label)
}

function submitButton(): HTMLElement {
  return within(passwordSection()).getByRole('button', { name: CHANGE_PASSWORD_TEXT.submit })
}

async function fillAndSubmit(current = CURRENT, next = NEXT, confirm = next) {
  const user = userEvent.setup()
  if (current) await user.type(field(CHANGE_PASSWORD_TEXT.currentLabel), current)
  if (next) await user.type(field(CHANGE_PASSWORD_TEXT.newLabel), next)
  if (confirm) await user.type(field(CHANGE_PASSWORD_TEXT.confirmLabel), confirm)
  await user.click(submitButton())
  return user
}

function allValues(): string[] {
  return [
    CHANGE_PASSWORD_TEXT.currentLabel,
    CHANGE_PASSWORD_TEXT.newLabel,
    CHANGE_PASSWORD_TEXT.confirmLabel,
  ].map((label) => field(label).value)
}

function toastMessages(): string[] {
  return useToastStore.getState().toasts.map((toast) => toast.message)
}

beforeAll(() => {
  installMatchMediaStub(true)
})

beforeEach(() => {
  useAuthStore.setState({ user: sessionUser, token: 'mock-token-u1', isAuthenticated: true })
})

afterEach(() => {
  vi.mocked(userService.getProfile).mockReset()
  vi.mocked(userService.changePassword).mockReset()
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  useToastStore.setState({ toasts: [] })
})

describe('Change Password — section', () => {
  it('F1 shows the section with its h2 below the loaded profile form', async () => {
    await showPage()
    const heading = within(passwordSection()).getByRole('heading', {
      level: 2,
      name: CHANGE_PASSWORD_TEXT.heading,
    })
    const saveButton = screen.getByRole('button', { name: PROFILE_TEXT.save })
    expect(
      saveButton.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy()
  })

  it('F1 shows the section while the profile is loading', () => {
    vi.mocked(userService.getProfile).mockReturnValue(new Promise<User>(() => {}))
    renderPage()
    expect(passwordSection()).toBeInTheDocument()
    expect(submitButton()).toBeEnabled()
  })

  it('F1 shows the section when the profile cannot be loaded', async () => {
    vi.mocked(userService.getProfile).mockRejectedValue(new ApiError(404, USER_ERRORS.notFound))
    renderPage()
    await screen.findByRole('button', { name: /try again/i })
    expect(passwordSection()).toBeInTheDocument()
  })

  it('F2 has three empty password fields with autocomplete hints', async () => {
    await showPage()
    const expected = [
      [CHANGE_PASSWORD_TEXT.currentLabel, 'current-password'],
      [CHANGE_PASSWORD_TEXT.newLabel, 'new-password'],
      [CHANGE_PASSWORD_TEXT.confirmLabel, 'new-password'],
    ]
    for (const [label, autoComplete] of expected) {
      const input = field(label)
      expect(input).toHaveAttribute('type', 'password')
      expect(input).toHaveAttribute('autocomplete', autoComplete)
      expect(input).toHaveValue('')
    }
  })
})

describe('Change Password — validation', () => {
  it('F3 empty current, short new and a mismatched confirm show inline errors and send nothing', async () => {
    await showPage()
    await fillAndSubmit('', '12345', '12346')
    expect(await screen.findByText(VALIDATION_MESSAGES.currentPasswordRequired)).toBeInTheDocument()
    expect(screen.getByText(VALIDATION_MESSAGES.passwordMin)).toBeInTheDocument()
    expect(screen.getByText(VALIDATION_MESSAGES.confirmPasswordMismatch)).toBeInTheDocument()
    expect(field(CHANGE_PASSWORD_TEXT.currentLabel)).toHaveAttribute('aria-invalid', 'true')
    expect(userService.changePassword).not.toHaveBeenCalled()
  })

  it('F3 F6 valid values send only the current and new password, untrimmed', async () => {
    vi.mocked(userService.changePassword).mockResolvedValue()
    await showPage()
    await fillAndSubmit(' secret1', '123456')
    await waitFor(() => expect(userService.changePassword).toHaveBeenCalledTimes(1))
    expect(vi.mocked(userService.changePassword).mock.calls[0]).toEqual([
      'u1',
      { currentPassword: ' secret1', newPassword: '123456' },
    ])
  })
})

describe('Change Password — server answers', () => {
  it('F4 a wrong current password shows the inline error on that field, focuses it and keeps the values', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(
      new ApiError(400, USER_ERRORS.wrongCurrentPassword)
    )
    await showPage()
    await fillAndSubmit()
    expect(await screen.findByText(USER_ERRORS.wrongCurrentPassword)).toBeInTheDocument()
    const current = field(CHANGE_PASSWORD_TEXT.currentLabel)
    expect(current).toHaveAttribute('aria-invalid', 'true')
    await waitFor(() => expect(current).toHaveFocus())
    expect(allValues()).toEqual([CURRENT, NEXT, NEXT])
    expect(toastMessages()).toEqual([])
  })

  it('F5 a new password equal to the current one shows the inline error under New password and focuses it', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(
      new ApiError(400, USER_ERRORS.samePassword)
    )
    await showPage()
    await fillAndSubmit(CURRENT, CURRENT)
    expect(await screen.findByText(USER_ERRORS.samePassword)).toBeInTheDocument()
    const next = field(CHANGE_PASSWORD_TEXT.newLabel)
    expect(next).toHaveAttribute('aria-invalid', 'true')
    expect(field(CHANGE_PASSWORD_TEXT.currentLabel)).toHaveAttribute('aria-invalid', 'false')
    await waitFor(() => expect(next).toHaveFocus())
    expect(allValues()).toEqual([CURRENT, CURRENT, CURRENT])
    expect(toastMessages()).toEqual([])
  })

  it('F6 success shows the toast and clears every field', async () => {
    vi.mocked(userService.changePassword).mockResolvedValue()
    await showPage()
    await fillAndSubmit()
    await waitFor(() => expect(toastMessages()).toEqual([TOAST_MESSAGES.profile.passwordChanged]))
    await waitFor(() => expect(allValues()).toEqual(['', '', '']))
    expect(submitButton()).toBeEnabled()
  })

  it('F7 another failure shows the error toast, keeps the values and allows a new submit', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(new ApiError(500, 'Server error'))
    await showPage()
    const user = await fillAndSubmit()
    await waitFor(() =>
      expect(toastMessages()).toEqual([TOAST_MESSAGES.profile.passwordChangeFailed])
    )
    expect(allValues()).toEqual([CURRENT, NEXT, NEXT])
    expect(screen.queryByText(USER_ERRORS.wrongCurrentPassword)).not.toBeInTheDocument()
    await waitFor(() => expect(submitButton()).toBeEnabled())
    await user.click(submitButton())
    await waitFor(() => expect(userService.changePassword).toHaveBeenCalledTimes(2))
  })
})

describe('Change Password — pending', () => {
  it('F8 two submits in a row send one request (disabled-button bypass)', async () => {
    const pending = deferred<void>()
    vi.mocked(userService.changePassword).mockReturnValue(pending.promise)
    await showPage()
    await fillAndSubmit()
    await waitFor(() => expect(userService.changePassword).toHaveBeenCalledTimes(1))
    const form = submitButton().closest('form')
    act(() => {
      form?.requestSubmit()
      form?.requestSubmit()
    })
    await act(async () => {
      await Promise.resolve()
    })
    expect(userService.changePassword).toHaveBeenCalledTimes(1)
    await act(async () => {
      pending.resolve()
      await pending.promise
    })
  })

  it('F9 while saving the fields are disabled and the button is busy; unmounting mid-request is safe', async () => {
    const pending = deferred<void>()
    vi.mocked(userService.changePassword).mockReturnValue(pending.promise)
    const view = await showPage()
    await fillAndSubmit()
    await waitFor(() => expect(submitButton()).toHaveAttribute('aria-busy', 'true'))
    expect(field(CHANGE_PASSWORD_TEXT.currentLabel)).toBeDisabled()
    expect(field(CHANGE_PASSWORD_TEXT.confirmLabel)).toBeDisabled()
    view.unmount()
    await act(async () => {
      pending.resolve()
      await pending.promise
    })
    expect(toastMessages()).toEqual([TOAST_MESSAGES.profile.passwordChanged])
  })
})
