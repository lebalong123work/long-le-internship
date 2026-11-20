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

describe('RootLayout restored session (T35, no merge)', () => {
  afterEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  it('B1 reads only the account cart and writes nothing for a restored session', async () => {
    localStorage.setItem('mcs_guest', '3f2b8c1e-9a4d-4f6b-8c2a-1d5e7f9a0b3c')
    vi.mocked(cartService.getCart).mockResolvedValue({ id: 'a', userId: 'u1', items: [] })
    useAuthStore.setState({
      user: { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' },
      token: 't',
      isAuthenticated: true,
    })

    renderLayout()

    await waitFor(() =>
      expect(cartService.getCart).toHaveBeenCalledWith({ kind: 'user', id: 'u1' })
    )
    expect(
      vi.mocked(cartService.getCart).mock.calls.every(([owner]) => owner.kind === 'user')
    ).toBe(true)
    expect(cartService.addItem).not.toHaveBeenCalled()
    expect(cartService.updateQuantity).not.toHaveBeenCalled()
    expect(cartService.removeItem).not.toHaveBeenCalled()
    expect(cartService.clearCart).not.toHaveBeenCalled()
  })
})
