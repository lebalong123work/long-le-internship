import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import * as searchService from '@/services/searchService'
import { useAuthStore } from '@/stores/authStore'
import { installDialogStub } from '@/test/dialogStub'
import { installMatchMediaStub } from '@/test/matchMediaStub'
import { product } from '@/test/fixtures'
import { Header } from './Header'
import type { Suggestion } from '@/types'

vi.mock('@/services/searchService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/searchService')>()),
  searchSuggestions: vi.fn(),
}))

const suggestions: Suggestion[] = [{ type: 'product', product: product('p1') }]

function LocationProbe(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <output data-testid="location">{location.pathname + location.search}</output>
      <button type="button" onClick={() => navigate('/about')}>
        Go to About
      </button>
    </>
  )
}

function location(): string {
  return screen.getByTestId('location').textContent ?? ''
}

function searchButton(): HTMLElement {
  return screen.getByRole('button', { name: 'Open search' })
}

function searchDialog(): HTMLDialogElement {
  const dialog = document.getElementById(searchButton().getAttribute('aria-controls') ?? '')
  if (!(dialog instanceof HTMLDialogElement)) throw new Error('search dialog not rendered')
  return dialog
}

function overlayInput(): HTMLElement {
  return within(searchDialog()).getByRole('combobox', { name: 'Search products' })
}

async function openSearch() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Header />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  const user = userEvent.setup()
  await user.click(searchButton())
  return user
}

beforeAll(() => {
  installDialogStub()
})

beforeEach(() => {
  installMatchMediaStub(false)
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
  vi.mocked(searchService.searchSuggestions).mockImplementation(async () => [...suggestions])
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('SearchOverlay', () => {
  it('opens the Search dialog with focus in the input', async () => {
    await openSearch()
    expect(searchDialog().open).toBe(true)
    expect(searchDialog()).toHaveAttribute('aria-label', 'Search')
    expect(searchDialog()).not.toHaveAttribute('aria-modal')
    expect(overlayInput()).toHaveFocus()
  })

  it('Close search closes the dialog', async () => {
    const user = await openSearch()
    await user.click(within(searchDialog()).getByRole('button', { name: 'Close search' }))
    expect(searchDialog().open).toBe(false)
    expect(searchButton()).toHaveAttribute('aria-expanded', 'false')
  })

  it('Esc with the list shown closes the list only, a cancel then closes the dialog', async () => {
    const user = await openSearch()
    await user.type(overlayInput(), 'shirt')
    await within(searchDialog()).findAllByRole('option')
    fireEvent.keyDown(overlayInput(), { key: 'Escape' })
    expect(overlayInput()).toHaveAttribute('aria-expanded', 'false')
    expect(searchDialog().open).toBe(true)
    fireEvent(searchDialog(), new Event('cancel', { cancelable: true }))
    expect(searchDialog().open).toBe(false)
  })

  it('picking an option navigates and closes the dialog', async () => {
    const user = await openSearch()
    await user.type(overlayInput(), 'shirt')
    await user.click(await within(searchDialog()).findByRole('option'))
    expect(location()).toBe('/shop/p1')
    expect(searchDialog().open).toBe(false)
  })

  it('closing while suggestions load logs no error', async () => {
    vi.mocked(searchService.searchSuggestions).mockReturnValue(new Promise(() => {}))
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const user = await openSearch()
    await user.type(overlayInput(), 'shirt')
    await waitFor(() => expect(searchService.searchSuggestions).toHaveBeenCalled())
    await user.click(within(searchDialog()).getByRole('button', { name: 'Close search' }))
    expect(searchDialog().open).toBe(false)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('a route change closes the dialog', async () => {
    const user = await openSearch()
    await user.click(screen.getByRole('button', { name: 'Go to About' }))
    expect(location()).toBe('/about')
    expect(searchDialog().open).toBe(false)
  })

  it('a backdrop press closes the dialog', async () => {
    await openSearch()
    fireEvent.mouseDown(searchDialog())
    fireEvent.click(searchDialog())
    expect(searchDialog().open).toBe(false)
  })

  it('Enter without an active option goes to the results and closes', async () => {
    const user = await openSearch()
    await user.type(overlayInput(), 'jacket{Enter}')
    expect(location()).toBe('/search?q=jacket')
    expect(searchDialog().open).toBe(false)
  })
})
