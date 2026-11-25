import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { UserMenu } from '@/components/layout/UserMenu'
import { HEADER_TEXT } from '@/constants/header'
import { AVATAR_RULES, PROFILE_TEXT } from '@/constants/profile'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { UI_STATE_MESSAGES } from '@/constants/uiStateMessages'
import { VALIDATION_MESSAGES } from '@/schemas/common'
import { ApiError } from '@/services/apiClient'
import * as userService from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import { readFileAsDataUrl } from './avatarFile'
import Profile from './index'
import type { UpdateProfileDto, User } from '@/types'

vi.mock('@/services/userService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/userService')>()),
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('./avatarFile', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./avatarFile')>()
  return { ...actual, readFileAsDataUrl: vi.fn(actual.readFileAsDataUrl) }
})

const sessionUser: User = {
  id: 'u1',
  name: 'Test Customer',
  email: 'user@store.com',
  role: 'customer',
}
const PROFILE: User = {
  ...sessionUser,
  phone: '0912345678',
  address: '1 Main Street',
  birthDate: '2000-01-31',
}
const STORED_AVATAR = 'data:image/png;base64,c3RvcmVk'
const SERVER_ERROR = new ApiError(500, 'Server error')
const NOT_FOUND = new ApiError(404, 'User not found')
const PNG_URL = 'data:image/png;base64,cG5n'

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function pngFile(name = 'photo.png', size = 3): File {
  return new File([new Uint8Array(size)], name, { type: 'image/png' })
}

function serveProfile(profile: User): void {
  vi.mocked(userService.getProfile).mockResolvedValue(profile)
  vi.mocked(userService.updateProfile).mockImplementation((_userId, data) =>
    Promise.resolve({ ...profile, ...data })
  )
}

function renderPage(withUserMenu = false) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {withUserMenu && <UserMenu />}
        <Profile />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { queryClient }
}

async function showForm(profile: User = PROFILE) {
  serveProfile(profile)
  const view = renderPage()
  await screen.findByRole('button', { name: PROFILE_TEXT.save })
  return view
}

function field(label: string): HTMLInputElement {
  return screen.getByLabelText(label)
}

function fileInput(): HTMLInputElement {
  return screen.getByLabelText(PROFILE_TEXT.changePhoto)
}

function changePhotoButton(): HTMLElement {
  return screen.getByRole('button', { name: PROFILE_TEXT.changePhoto })
}

function preview(): HTMLImageElement | null {
  return screen.queryByRole('img', { name: PROFILE_TEXT.avatarAlt })
}

function saveButton(): HTMLElement {
  return screen.getByRole('button', { name: PROFILE_TEXT.save })
}

function lastBody(): UpdateProfileDto {
  const calls = vi.mocked(userService.updateProfile).mock.calls
  return calls[calls.length - 1][1]
}

function toastMessages(): string[] {
  return useToastStore.getState().toasts.map((toast) => toast.message)
}

function noAcceptFilter() {
  return userEvent.setup({ applyAccept: false })
}

beforeAll(() => {
  installMatchMediaStub(true)
})

beforeEach(() => {
  useAuthStore.setState({ user: sessionUser, token: 'mock-token-u1', isAuthenticated: true })
})

afterEach(() => {
  vi.mocked(userService.getProfile).mockReset()
  vi.mocked(userService.updateProfile).mockReset()
  vi.mocked(readFileAsDataUrl).mockClear()
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  useToastStore.setState({ toasts: [] })
})

describe('Profile page — states', () => {
  it('P1 shows the heading, a busy skeleton and the loading status while loading', () => {
    vi.mocked(userService.getProfile).mockReturnValue(new Promise<User>(() => {}))
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: PROFILE_TEXT.heading })).toBeVisible()
    expect(document.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(PROFILE_TEXT.loading)
  })

  it('P2 keeps the error state while retrying, then shows the form and focuses the heading', async () => {
    const retryRead = deferred<User>()
    vi.mocked(userService.getProfile)
      .mockRejectedValueOnce(NOT_FOUND)
      .mockReturnValueOnce(retryRead.promise)
    renderPage()
    const retry = await screen.findByRole('button', { name: UI_STATE_MESSAGES.retry })
    await userEvent.click(retry)
    retry.blur()
    expect(screen.getByRole('button', { name: UI_STATE_MESSAGES.retry })).toBeInTheDocument()
    expect(document.querySelector('[aria-busy="true"]:not(button)')).not.toBeInTheDocument()
    await act(async () => retryRead.resolve(PROFILE))
    await screen.findByRole('button', { name: PROFILE_TEXT.save })
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1, name: PROFILE_TEXT.heading })).toHaveFocus()
    )
  })

  it('P3 keeps the form and typed values when a background refetch fails', async () => {
    const { queryClient } = await showForm()
    await userEvent.clear(field(PROFILE_TEXT.nameLabel))
    await userEvent.type(field(PROFILE_TEXT.nameLabel), 'Typed Name')
    vi.mocked(userService.getProfile).mockRejectedValue(NOT_FOUND)
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: queryKeys.profile('u1') })
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(queryClient.getQueryState(queryKeys.profile('u1'))?.status).toBe('error')
    expect(screen.queryByRole('button', { name: UI_STATE_MESSAGES.retry })).not.toBeInTheDocument()
    expect(field(PROFILE_TEXT.nameLabel)).toHaveValue('Typed Name')
  })

  it('P18 never resets typed values when a background refetch brings new data', async () => {
    const { queryClient } = await showForm()
    await userEvent.clear(field(PROFILE_TEXT.addressLabel))
    await userEvent.type(field(PROFILE_TEXT.addressLabel), 'Typed Street')
    vi.mocked(userService.getProfile).mockResolvedValue({ ...PROFILE, address: 'Server Street' })
    await act(async () => {
      await queryClient.refetchQueries({ queryKey: queryKeys.profile('u1') })
      await new Promise((resolve) => setTimeout(resolve, 0))
    })
    expect(queryClient.getQueryData<User>(queryKeys.profile('u1'))?.address).toBe('Server Street')
    expect(field(PROFILE_TEXT.addressLabel)).toHaveValue('Typed Street')
  })
})

describe('Profile page — form', () => {
  it('P4 fills the form from the profile; email is read-only with a hint', async () => {
    await showForm()
    expect(field(PROFILE_TEXT.nameLabel)).toHaveValue('Test Customer')
    expect(field(PROFILE_TEXT.phoneLabel)).toHaveValue('0912345678')
    expect(field(PROFILE_TEXT.addressLabel)).toHaveValue('1 Main Street')
    expect(field(PROFILE_TEXT.birthDateLabel)).toHaveValue('2000-01-31')
    const email = field(PROFILE_TEXT.emailLabel)
    expect(email).toHaveValue('user@store.com')
    expect(email).toHaveAttribute('readonly')
    expect(email).toHaveAccessibleDescription(PROFILE_TEXT.emailHint)
  })

  it('P5 a blank name shows an inline error and sends nothing', async () => {
    await showForm()
    await userEvent.clear(field(PROFILE_TEXT.nameLabel))
    await userEvent.type(field(PROFILE_TEXT.nameLabel), '   ')
    await userEvent.click(saveButton())
    expect(await screen.findByText(VALIDATION_MESSAGES.nameRequired)).toBeInTheDocument()
    expect(field(PROFILE_TEXT.nameLabel)).toHaveAttribute('aria-invalid', 'true')
    expect(userService.updateProfile).not.toHaveBeenCalled()
  })

  it('P5 a valid name is saved trimmed', async () => {
    await showForm()
    await userEvent.clear(field(PROFILE_TEXT.nameLabel))
    await userEvent.type(field(PROFILE_TEXT.nameLabel), '  New Name  ')
    await userEvent.click(saveButton())
    await waitFor(() => expect(userService.updateProfile).toHaveBeenCalledTimes(1))
    expect(lastBody().name).toBe('New Name')
  })

  it('P6 an invalid phone shows an inline error; an empty phone is saved as cleared', async () => {
    await showForm()
    await userEvent.clear(field(PROFILE_TEXT.phoneLabel))
    await userEvent.type(field(PROFILE_TEXT.phoneLabel), '12345')
    await userEvent.click(saveButton())
    expect(await screen.findByText(VALIDATION_MESSAGES.phoneInvalid)).toBeInTheDocument()
    expect(userService.updateProfile).not.toHaveBeenCalled()
    await userEvent.clear(field(PROFILE_TEXT.phoneLabel))
    await userEvent.click(saveButton())
    await waitFor(() => expect(userService.updateProfile).toHaveBeenCalledTimes(1))
    expect(lastBody().phone).toBe('')
  })

  it('P7 a future birth date shows an inline error; a past date is saved', async () => {
    await showForm()
    const nextYear = String(new Date().getFullYear() + 1)
    await userEvent.clear(field(PROFILE_TEXT.birthDateLabel))
    await userEvent.type(field(PROFILE_TEXT.birthDateLabel), `${nextYear}-01-01`)
    await userEvent.click(saveButton())
    expect(await screen.findByText(VALIDATION_MESSAGES.birthDateFuture)).toBeInTheDocument()
    expect(userService.updateProfile).not.toHaveBeenCalled()
    await userEvent.clear(field(PROFILE_TEXT.birthDateLabel))
    await userEvent.type(field(PROFILE_TEXT.birthDateLabel), '1999-12-31')
    await userEvent.click(saveButton())
    await waitFor(() => expect(userService.updateProfile).toHaveBeenCalledTimes(1))
    expect(lastBody().birthDate).toBe('1999-12-31')
  })

  it('P8 sends only the editable fields — no email, password or unchanged avatar', async () => {
    await showForm({ ...PROFILE, avatar: STORED_AVATAR })
    await userEvent.click(saveButton())
    await waitFor(() => expect(userService.updateProfile).toHaveBeenCalledTimes(1))
    expect(vi.mocked(userService.updateProfile).mock.calls[0][0]).toBe('u1')
    expect(lastBody()).toEqual({
      name: 'Test Customer',
      phone: '0912345678',
      address: '1 Main Street',
      birthDate: '2000-01-31',
    })
  })
})

describe('Profile page — saving', () => {
  it('P9 a successful save shows the toast and updates the Header account menu name', async () => {
    serveProfile(PROFILE)
    renderPage(true)
    await screen.findByRole('button', { name: PROFILE_TEXT.save })
    await userEvent.clear(field(PROFILE_TEXT.nameLabel))
    await userEvent.type(field(PROFILE_TEXT.nameLabel), 'New Name')
    await userEvent.click(saveButton())
    expect(
      await screen.findByRole('button', { name: HEADER_TEXT.accountMenuLabel('New Name') })
    ).toBeInTheDocument()
    expect(useAuthStore.getState().user?.name).toBe('New Name')
    expect(toastMessages()).toEqual([TOAST_MESSAGES.profile.updated])
  })

  it('P10 after saving a new photo, the next save does not send the avatar again', async () => {
    await showForm()
    await userEvent.upload(fileInput(), pngFile())
    await waitFor(() => expect(preview()).toBeInTheDocument())
    await userEvent.click(saveButton())
    await waitFor(() => expect(userService.updateProfile).toHaveBeenCalledTimes(1))
    expect(lastBody()).toHaveProperty('avatar', 'data:image/png;base64,AAAA')
    await waitFor(() => expect(saveButton()).toBeEnabled())
    await userEvent.click(saveButton())
    await waitFor(() => expect(userService.updateProfile).toHaveBeenCalledTimes(2))
    expect(lastBody()).not.toHaveProperty('avatar')
  })

  it('P11 a failed save shows the error toast, keeps the values and enables Save again', async () => {
    await showForm()
    vi.mocked(userService.updateProfile).mockRejectedValue(SERVER_ERROR)
    await userEvent.clear(field(PROFILE_TEXT.nameLabel))
    await userEvent.type(field(PROFILE_TEXT.nameLabel), 'Unsaved Name')
    await userEvent.click(saveButton())
    await waitFor(() => expect(toastMessages()).toEqual([TOAST_MESSAGES.profile.updateFailed]))
    expect(field(PROFILE_TEXT.nameLabel)).toHaveValue('Unsaved Name')
    expect(saveButton()).toBeEnabled()
    expect(useAuthStore.getState().user?.name).toBe('Test Customer')
  })

  it('P12 two submits in a row send one request (disabled-button bypass)', async () => {
    await showForm()
    const pending = deferred<User>()
    vi.mocked(userService.updateProfile).mockReturnValue(pending.promise)
    const form = saveButton().closest('form')
    act(() => {
      form?.requestSubmit()
      form?.requestSubmit()
    })
    await waitFor(() => expect(userService.updateProfile).toHaveBeenCalledTimes(1))
    act(() => form?.requestSubmit())
    await act(async () => pending.resolve(PROFILE))
    expect(userService.updateProfile).toHaveBeenCalledTimes(1)
  })

  it('P13 P21 while saving, fields, Change photo and the file input are disabled and Save is busy', async () => {
    await showForm()
    const pending = deferred<User>()
    vi.mocked(userService.updateProfile).mockReturnValue(pending.promise)
    await userEvent.click(saveButton())
    await waitFor(() => expect(saveButton()).toHaveAttribute('aria-busy', 'true'))
    expect(field(PROFILE_TEXT.nameLabel)).toBeDisabled()
    expect(changePhotoButton()).toBeDisabled()
    expect(fileInput()).toBeDisabled()
    await userEvent.upload(fileInput(), pngFile())
    expect(readFileAsDataUrl).not.toHaveBeenCalled()
    expect(field(PROFILE_TEXT.nameLabel)).toHaveValue('Test Customer')
    await act(async () => pending.resolve(PROFILE))
    await waitFor(() => expect(fileInput()).toBeEnabled())
  })
})

describe('Profile page — avatar', () => {
  it('P17 shows the fallback icon when there is no photo', async () => {
    await showForm()
    expect(preview()).not.toBeInTheDocument()
    expect(document.querySelector('img[src="/icons/user.svg"]')).toHaveAttribute('alt', '')
  })

  it('P14 a valid photo is previewed before saving', async () => {
    await showForm({ ...PROFILE, avatar: STORED_AVATAR })
    expect(preview()).toHaveAttribute('src', STORED_AVATAR)
    vi.mocked(readFileAsDataUrl).mockResolvedValueOnce(PNG_URL)
    await userEvent.upload(fileInput(), pngFile())
    await waitFor(() => expect(preview()).toHaveAttribute('src', PNG_URL))
    expect(userService.updateProfile).not.toHaveBeenCalled()
  })

  it('P15 a wrong type shows an alert and keeps the preview', async () => {
    await showForm({ ...PROFILE, avatar: STORED_AVATAR })
    const svg = new File(['<svg/>'], 'icon.svg', { type: 'image/svg+xml' })
    await noAcceptFilter().upload(fileInput(), svg)
    expect(await screen.findByRole('alert')).toHaveTextContent(VALIDATION_MESSAGES.avatarType)
    expect(preview()).toHaveAttribute('src', STORED_AVATAR)
    expect(readFileAsDataUrl).not.toHaveBeenCalled()
  })

  it('P15 a file over the size limit shows an alert and keeps the preview', async () => {
    await showForm({ ...PROFILE, avatar: STORED_AVATAR })
    await userEvent.upload(fileInput(), pngFile('big.png', AVATAR_RULES.maxBytes + 1))
    expect(await screen.findByRole('alert')).toHaveTextContent(VALIDATION_MESSAGES.avatarTooLarge)
    expect(preview()).toHaveAttribute('src', STORED_AVATAR)
  })

  it('P15 a failed read shows the read error alert', async () => {
    await showForm()
    vi.mocked(readFileAsDataUrl).mockRejectedValueOnce(new Error('read failed'))
    await userEvent.upload(fileInput(), pngFile())
    expect(await screen.findByRole('alert')).toHaveTextContent(VALIDATION_MESSAGES.avatarReadFailed)
    expect(preview()).not.toBeInTheDocument()
  })

  it('P16 when two photos are picked quickly, the last pick wins', async () => {
    await showForm()
    const first = deferred<string>()
    const second = deferred<string>()
    vi.mocked(readFileAsDataUrl)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    await userEvent.upload(fileInput(), pngFile('a.png'))
    await userEvent.upload(fileInput(), pngFile('b.png'))
    await act(async () => second.resolve('data:image/png;base64,Yg=='))
    await act(async () => first.resolve('data:image/png;base64,YQ=='))
    expect(preview()).toHaveAttribute('src', 'data:image/png;base64,Yg==')
  })

  it('R5 a failed older read after a newer pick succeeded keeps the newer photo and shows no error', async () => {
    await showForm()
    const first = deferred<string>()
    const second = deferred<string>()
    vi.mocked(readFileAsDataUrl)
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    await userEvent.upload(fileInput(), pngFile('a.png'))
    await userEvent.upload(fileInput(), pngFile('b.png'))
    await act(async () => second.resolve('data:image/png;base64,Yg=='))
    await act(async () => first.reject(new Error('read failed')))
    expect(preview()).toHaveAttribute('src', 'data:image/png;base64,Yg==')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('P19 an invalid pick after a valid one wins over the earlier read', async () => {
    await showForm({ ...PROFILE, avatar: STORED_AVATAR })
    const read = deferred<string>()
    vi.mocked(readFileAsDataUrl).mockReturnValueOnce(read.promise)
    await userEvent.upload(fileInput(), pngFile())
    await noAcceptFilter().upload(fileInput(), new File(['x'], 'a.gif', { type: 'image/gif' }))
    await act(async () => read.resolve(PNG_URL))
    expect(screen.getByRole('alert')).toHaveTextContent(VALIDATION_MESSAGES.avatarType)
    expect(preview()).toHaveAttribute('src', STORED_AVATAR)
  })

  it('P19 a valid pick after an invalid one clears the error and shows the new photo', async () => {
    await showForm()
    await noAcceptFilter().upload(fileInput(), new File(['x'], 'a.gif', { type: 'image/gif' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    vi.mocked(readFileAsDataUrl).mockResolvedValueOnce(PNG_URL)
    await userEvent.upload(fileInput(), pngFile())
    await waitFor(() => expect(preview()).toHaveAttribute('src', PNG_URL))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('P20 cancelling the file picker changes nothing', async () => {
    await showForm({ ...PROFILE, avatar: STORED_AVATAR })
    await noAcceptFilter().upload(fileInput(), new File(['x'], 'a.gif', { type: 'image/gif' }))
    await screen.findByRole('alert')
    fireEvent.change(fileInput(), { target: { files: [] } })
    expect(screen.getByRole('alert')).toHaveTextContent(VALIDATION_MESSAGES.avatarType)
    expect(preview()).toHaveAttribute('src', STORED_AVATAR)
    expect(readFileAsDataUrl).not.toHaveBeenCalled()
  })

  it('P22 Change photo and the file input have names and point to the avatar error', async () => {
    await showForm({ ...PROFILE, avatar: STORED_AVATAR })
    expect(changePhotoButton()).toHaveAccessibleName(PROFILE_TEXT.changePhoto)
    expect(fileInput()).toHaveAttribute('aria-label', PROFILE_TEXT.changePhoto)
    expect(changePhotoButton()).not.toHaveAttribute('aria-describedby')
    expect(fileInput()).not.toHaveAttribute('aria-describedby')
    await noAcceptFilter().upload(fileInput(), new File(['x'], 'a.gif', { type: 'image/gif' }))
    const alert = await screen.findByRole('alert')
    expect(changePhotoButton()).toHaveAccessibleDescription(VALIDATION_MESSAGES.avatarType)
    expect(fileInput()).toHaveAttribute('aria-describedby', alert.id)
    expect(preview()).toHaveAttribute('src', STORED_AVATAR)
  })

  it('P22 Change photo opens the file input', async () => {
    await showForm()
    const click = vi.spyOn(fileInput(), 'click')
    await userEvent.click(changePhotoButton())
    expect(click).toHaveBeenCalledTimes(1)
  })
})
