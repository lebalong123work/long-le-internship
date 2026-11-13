import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AUTH_TEXT } from '@/constants/auth'
import * as authService from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { LoginForm } from './LoginForm'
import type { AuthResponse } from '@/types'

vi.mock('@/services/authService')

async function renderFilledForm(): Promise<HTMLFormElement> {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  const { container } = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/?auth=login']}>
        <LoginForm isAuthPending={false} autoFocusEmail />
      </MemoryRouter>
    </QueryClientProvider>
  )
  const user = userEvent.setup()
  await user.type(screen.getByLabelText(AUTH_TEXT.emailLabel), 'user@store.com')
  await user.type(screen.getByLabelText(AUTH_TEXT.passwordLabel), 'user123')
  const form = container.querySelector('form')
  if (!form) throw new Error('form not rendered')
  return form
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  useToastStore.setState({ toasts: [] })
  vi.mocked(authService.login).mockReturnValue(new Promise<AuthResponse>(() => {}))
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('LoginForm back-to-back submits', () => {
  it('one submit event sends one login', async () => {
    const form = await renderFilledForm()
    await act(async () => {
      fireEvent.submit(form)
    })
    await waitFor(() => expect(authService.login).toHaveBeenCalled())
    expect(authService.login).toHaveBeenCalledTimes(1)
  })

  it('two submit events in a row send one login', async () => {
    const form = await renderFilledForm()
    await act(async () => {
      fireEvent.submit(form)
      fireEvent.submit(form)
    })
    await waitFor(() => expect(authService.login).toHaveBeenCalled())
    expect(authService.login).toHaveBeenCalledTimes(1)
  })
})
