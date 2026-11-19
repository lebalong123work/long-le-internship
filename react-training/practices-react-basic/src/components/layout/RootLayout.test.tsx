import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import * as cartService from '@/services/cartService'
import { useAuthStore } from '@/stores/authStore'
import { installDialogStub } from '@/test/dialogStub'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import { RootLayout } from './RootLayout'

vi.mock('@/services/cartService')

function renderLayout() {
  const router = createMemoryRouter([
    { element: <RootLayout />, children: [{ path: '/', element: <p>Page content</p> }] },
  ])
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

beforeAll(() => {
  installDialogStub()
})

beforeEach(() => {
  installMatchMediaStub(true)
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
})

describe('RootLayout landmarks', () => {
  it('page content renders inside main', () => {
    renderLayout()
    expect(screen.getByRole('main')).toContainElement(screen.getByText('Page content'))
  })

  it('header is outside main', () => {
    renderLayout()
    expect(screen.getByRole('main')).not.toContainElement(screen.getByRole('banner'))
  })
})

describe('RootLayout guest cart recovery (T35)', () => {
  afterEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('B1 retries the guest cart merge once for a restored session', async () => {
    localStorage.setItem('mcs_guest', '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c')
    vi.mocked(cartService.getCart).mockResolvedValue({ id: 'a', userId: 'u1', items: [] })
    vi.mocked(cartService.mergeGuestCart).mockResolvedValue({ status: 'nothing' })
    useAuthStore.setState({
      user: { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' },
      token: 't',
      isAuthenticated: true,
    })

    renderLayout()

    await waitFor(() => expect(cartService.mergeGuestCart).toHaveBeenCalledTimes(1))
    expect(cartService.mergeGuestCart).toHaveBeenCalledWith(
      '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c',
      'u1'
    )
  })
})
