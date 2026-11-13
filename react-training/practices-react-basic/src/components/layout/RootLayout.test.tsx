import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/stores/authStore'
import { installDialogStub } from '@/test/dialogStub'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import { RootLayout } from './RootLayout'

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
