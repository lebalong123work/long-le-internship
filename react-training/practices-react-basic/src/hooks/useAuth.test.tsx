import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import ProtectedRoute from '@/router/ProtectedRoute'
import { ApiError } from '@/services/apiClient'
import * as authService from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { useAuth, useLogin, useLogout, useRegister } from './useAuth'
import type { ReactNode } from 'react'
import type { AuthResponse, User } from '@/types'

vi.mock('@/services/authService')

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const authResponse: AuthResponse = { user, token: 'mock-token-u1' }

function setup(initialPath = '/') {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  function wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialPath]}>{children}</MemoryRouter>
      </QueryClientProvider>
    )
  }
  return { queryClient, wrapper }
}

function toasts() {
  return useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))
}

function logIn() {
  useAuthStore.getState().login(user, 'mock-token-u1')
}

beforeEach(() => {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  localStorage.clear()
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('useAuth', () => {
  it('returns the current session from authStore', () => {
    logIn()
    const { wrapper } = setup()
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current).toEqual({ user, isAuthenticated: true })
  })
})

describe('useLogin', () => {
  it('saves the session and shows "Welcome back, {name}" on success', async () => {
    vi.mocked(authService.login).mockResolvedValue(authResponse)
    const { wrapper } = setup()
    const { result } = renderHook(() => useLogin(), { wrapper })

    act(() => result.current.mutate({ email: 'user@store.com', password: '123456' }))

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(authService.login).toHaveBeenCalledWith(
      { email: 'user@store.com', password: '123456' },
      expect.anything()
    )
    expect(useAuthStore.getState()).toMatchObject({
      user,
      token: 'mock-token-u1',
      isAuthenticated: true,
    })
    expect(toasts()).toEqual([
      { type: 'success', message: TOAST_MESSAGES.auth.welcomeBack('Test Customer') },
    ])
  })

  it.each([
    ['unknown email', new ApiError(404, 'No account with this email')],
    ['wrong password', new ApiError(401, 'Incorrect password')],
    ['network error', new ApiError(0, 'Network error')],
  ])('%s → store unchanged, no toast, error.message for the form', async (_, error) => {
    vi.mocked(authService.login).mockRejectedValue(error)
    const { wrapper } = setup()
    const { result } = renderHook(() => useLogin(), { wrapper })

    act(() => result.current.mutate({ email: 'user@store.com', password: 'wrong1' }))

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe(error.message)
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(toasts()).toEqual([])
  })
})

describe('useRegister', () => {
  it('logs in automatically and shows "Account created" on success', async () => {
    vi.mocked(authService.register).mockResolvedValue(authResponse)
    const { wrapper } = setup()
    const { result } = renderHook(() => useRegister(), { wrapper })

    act(() =>
      result.current.mutate({ name: 'Test Customer', email: 'new@store.com', password: '123456' })
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useAuthStore.getState()).toMatchObject({ user, isAuthenticated: true })
    expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.auth.accountCreated }])
  })

  it('email exists (409) → store unchanged, no toast', async () => {
    vi.mocked(authService.register).mockRejectedValue(new ApiError(409, 'Email already exists'))
    const { wrapper } = setup()
    const { result } = renderHook(() => useRegister(), { wrapper })

    act(() =>
      result.current.mutate({ name: 'Test Customer', email: 'user@store.com', password: '123456' })
    )

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Email already exists')
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
    expect(toasts()).toEqual([])
  })
})

describe('useLogout', () => {
  it('clears the session, its localStorage entry and the query cache, then shows an info toast', () => {
    logIn()
    expect(localStorage.getItem('mcs_auth')).not.toBeNull()
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(['cart', 'u1'], { items: [] })
    const { result } = renderHook(() => useLogout(), { wrapper })

    act(() => result.current())

    expect(useAuthStore.getState()).toMatchObject({
      user: null,
      token: null,
      isAuthenticated: false,
    })
    expect(localStorage.getItem('mcs_auth')).toBeNull()
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0)
    expect(toasts()).toEqual([{ type: 'info', message: TOAST_MESSAGES.auth.loggedOut }])
  })

  it('from a protected page → ends on "/" without the login modal', async () => {
    logIn()
    const { wrapper } = setup('/account/profile')

    function LogoutButton(): JSX.Element {
      const logout = useLogout()
      return <button onClick={logout}>Logout</button>
    }
    function Location(): JSX.Element {
      const location = useLocation()
      return <p data-testid="location">{location.pathname + location.search}</p>
    }

    render(
      <>
        <Routes>
          <Route path="/" element={<p>Home</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/account/profile" element={<LogoutButton />} />
          </Route>
        </Routes>
        <Location />
      </>,
      { wrapper }
    )

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }))

    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent(/^\/$/)
  })
})
