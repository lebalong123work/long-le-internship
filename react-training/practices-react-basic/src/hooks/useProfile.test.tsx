import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as userService from '@/services/userService'
import { USER_ERRORS } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { LOGIN_REQUIRED } from '@/utils/requireUserId'
import {
  getPasswordFieldError,
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from './useProfile'
import type { ReactNode } from 'react'
import type { ChangePasswordDto, UpdateProfileDto, User } from '@/types'

vi.mock('@/services/userService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/userService')>()),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  changePassword: vi.fn(),
}))

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const otherUser: User = { id: 'u2', name: 'Other', email: 'other@store.com', role: 'customer' }
const changes: UpdateProfileDto = { name: 'New Name', phone: '0912345678' }
const saved: User = { ...user, ...changes }
const passwords: ChangePasswordDto = { currentPassword: 'secret1', newPassword: 'secret2' }
const profileKey = queryKeys.profile('u1')

const serverError = new ApiError(500, 'Server error')
const networkError = new ApiError(0, 'Network error')
const notFound = new ApiError(404, USER_ERRORS.notFound)
const wrongCurrent = new ApiError(400, USER_ERRORS.wrongCurrentPassword)
const samePassword = new ApiError(400, USER_ERRORS.samePassword)

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0 }, mutations: { retry: false } },
  })
  function wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  return { queryClient, wrapper }
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function toasts() {
  return useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))
}

function logOut() {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
}

async function runUpdate(data: UpdateProfileDto = changes) {
  const context = setup()
  const { result } = renderHook(() => useUpdateProfile(), { wrapper: context.wrapper })
  await act(async () => {
    await result.current.mutateAsync(data).catch(() => undefined)
  })
  return { ...context, result }
}

async function runChangePassword(dto: ChangePasswordDto = passwords) {
  const { wrapper } = setup()
  const { result } = renderHook(() => useChangePassword(), { wrapper })
  await act(async () => {
    await result.current.mutateAsync(dto).catch(() => undefined)
  })
  return result
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('useProfile', () => {
  it('loads the profile of the logged-in user under its profile key', async () => {
    vi.mocked(userService.getProfile).mockResolvedValue(user)
    const { queryClient, wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(userService.getProfile).toHaveBeenCalledWith('u1')
    expect(queryClient.getQueryData(profileKey)).toEqual(user)
  })

  it('does not request the profile for a guest', () => {
    logOut()
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    expect(result.current.fetchStatus).toBe('idle')
    expect(userService.getProfile).not.toHaveBeenCalled()
  })

  it('keeps a server error in the query without a toast', async () => {
    vi.mocked(userService.getProfile).mockRejectedValue(serverError)
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(serverError)
    expect(toasts()).toEqual([])
  })

  it('keeps a network error in the query without a toast', async () => {
    vi.mocked(userService.getProfile).mockRejectedValue(networkError)
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error).toBe(networkError)
    expect(toasts()).toEqual([])
  })

  it('retries a server error before showing it', async () => {
    vi.mocked(userService.getProfile).mockRejectedValue(serverError)
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(userService.getProfile).toHaveBeenCalledTimes(4)
  })

  it('does not retry when the user is not found', async () => {
    vi.mocked(userService.getProfile).mockRejectedValue(notFound)
    const { wrapper } = setup()
    const { result } = renderHook(() => useProfile(), { wrapper })
    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(userService.getProfile).toHaveBeenCalledTimes(1)
  })
})

describe('useUpdateProfile', () => {
  it('sends the profile changes for the logged-in user', async () => {
    vi.mocked(userService.updateProfile).mockResolvedValue(saved)
    await runUpdate()
    expect(userService.updateProfile).toHaveBeenCalledWith('u1', changes)
  })

  it('rejects without a request when no user is logged in', async () => {
    logOut()
    const { result } = await runUpdate()
    await waitFor(() => expect(result.current.error?.message).toBe(LOGIN_REQUIRED))
    expect(userService.updateProfile).not.toHaveBeenCalled()
  })

  it('updates the session user with the saved profile', async () => {
    vi.mocked(userService.updateProfile).mockResolvedValue(saved)
    await runUpdate()
    expect(useAuthStore.getState().user).toEqual(saved)
  })

  it('does not change the session when another user logged in meanwhile', async () => {
    const pending = deferred<User>()
    vi.mocked(userService.updateProfile).mockReturnValue(pending.promise)
    const { wrapper } = setup()
    const { result } = renderHook(() => useUpdateProfile(), { wrapper })
    act(() => result.current.mutate(changes))
    useAuthStore.setState({ user: otherUser, token: 'mock-token-u2', isAuthenticated: true })
    await act(async () => {
      pending.resolve(saved)
      await pending.promise
    })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(useAuthStore.getState().user).toEqual(otherUser)
  })

  it('puts the saved profile into the profile cache', async () => {
    vi.mocked(userService.updateProfile).mockResolvedValue(saved)
    const { queryClient } = await runUpdate()
    expect(queryClient.getQueryData(profileKey)).toEqual(saved)
  })

  it('invalidates the profile cache after a failed save', async () => {
    vi.mocked(userService.updateProfile).mockRejectedValue(serverError)
    const { queryClient, wrapper } = setup()
    queryClient.setQueryData(profileKey, user)
    const { result } = renderHook(() => useUpdateProfile(), { wrapper })
    await act(async () => {
      await result.current.mutateAsync(changes).catch(() => undefined)
    })
    expect(queryClient.getQueryState(profileKey)?.isInvalidated).toBe(true)
  })

  it('shows the profile-updated toast after saving', async () => {
    vi.mocked(userService.updateProfile).mockResolvedValue(saved)
    await runUpdate()
    expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.profile.updated }])
  })

  it('shows no success toast when saving fails', async () => {
    vi.mocked(userService.updateProfile).mockRejectedValue(serverError)
    await runUpdate()
    expect(toasts().some(({ type }) => type === 'success')).toBe(false)
    expect(useAuthStore.getState().user).toEqual(user)
  })

  it('shows the profile-failed toast on a server error', async () => {
    vi.mocked(userService.updateProfile).mockRejectedValue(serverError)
    await runUpdate()
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.profile.updateFailed }])
  })

  it('shows the network toast on a network error', async () => {
    vi.mocked(userService.updateProfile).mockRejectedValue(networkError)
    await runUpdate()
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.network.error }])
  })
})

describe('useChangePassword', () => {
  it('sends the current and new password for the logged-in user', async () => {
    vi.mocked(userService.changePassword).mockResolvedValue(undefined)
    await runChangePassword()
    expect(userService.changePassword).toHaveBeenCalledWith('u1', passwords)
  })

  it('rejects without a request when no user is logged in', async () => {
    logOut()
    const result = await runChangePassword()
    await waitFor(() => expect(result.current.error?.message).toBe(LOGIN_REQUIRED))
    expect(userService.changePassword).not.toHaveBeenCalled()
  })

  it('shows the password-changed toast after changing', async () => {
    vi.mocked(userService.changePassword).mockResolvedValue(undefined)
    await runChangePassword()
    expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.profile.passwordChanged }])
  })

  it('shows no success toast when the change fails', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(serverError)
    await runChangePassword()
    expect(toasts().some(({ type }) => type === 'success')).toBe(false)
  })

  it('shows no toast for a wrong current password', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(wrongCurrent)
    const result = await runChangePassword()
    await waitFor(() => expect(result.current.error).toBe(wrongCurrent))
    expect(toasts()).toEqual([])
  })

  it('shows no toast for the same-password error', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(samePassword)
    const result = await runChangePassword()
    await waitFor(() => expect(result.current.error).toBe(samePassword))
    expect(toasts()).toEqual([])
  })

  it('shows the password-failed toast on a server error', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(serverError)
    await runChangePassword()
    expect(toasts()).toEqual([
      { type: 'error', message: TOAST_MESSAGES.profile.passwordChangeFailed },
    ])
  })

  it('shows the network toast on a network error', async () => {
    vi.mocked(userService.changePassword).mockRejectedValue(networkError)
    await runChangePassword()
    expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.network.error }])
  })
})

describe('getPasswordFieldError', () => {
  it('maps the wrong current password to the currentPassword field', () => {
    expect(getPasswordFieldError(wrongCurrent)).toEqual({
      field: 'currentPassword',
      message: USER_ERRORS.wrongCurrentPassword,
    })
  })

  it('returns null for a 400 with another message', () => {
    expect(getPasswordFieldError(new ApiError(400, 'Bad request'))).toBeNull()
  })

  it('maps the same-password error to the newPassword field', () => {
    expect(getPasswordFieldError(samePassword)).toEqual({
      field: 'newPassword',
      message: USER_ERRORS.samePassword,
    })
  })

  it('returns null for an error that is not an ApiError', () => {
    expect(getPasswordFieldError(new Error(USER_ERRORS.samePassword))).toBeNull()
  })
})
