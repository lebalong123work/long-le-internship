import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as searchService from '@/services/searchService'
import { HeaderSearch } from './HeaderSearch'

vi.mock('@/services/searchService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/searchService')>()),
  searchSuggestions: vi.fn(),
}))

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function location(): string {
  return screen.getByTestId('location').textContent ?? ''
}

function renderSearch() {
  const queryClient = new QueryClient()
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <HeaderSearch />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return {
    user: userEvent.setup(),
    input: screen.getByRole('combobox', { name: 'Search products' }),
    submit: screen.getByRole('button', { name: 'Search' }),
  }
}

beforeEach(() => {
  vi.mocked(searchService.searchSuggestions).mockResolvedValue([])
})

afterEach(() => {
  vi.resetAllMocks()
})

describe('HeaderSearch submit', () => {
  it('Enter with shirt goes to /search?q=shirt', async () => {
    const { user, input } = renderSearch()
    await user.type(input, 'shirt{Enter}')
    expect(location()).toBe('/search?q=shirt')
  })

  it('empty input does not navigate', async () => {
    const { user, input } = renderSearch()
    await user.type(input, '{Enter}')
    expect(location()).toBe('/')
  })

  it('trims spaces around the query', async () => {
    const { user, input } = renderSearch()
    await user.type(input, '  shirt  {Enter}')
    expect(location()).toBe('/search?q=shirt')
  })

  it('spaces only do not navigate', async () => {
    const { user, input } = renderSearch()
    await user.type(input, '   {Enter}')
    expect(location()).toBe('/')
    expect(input).toHaveFocus()
  })

  it('submit button Search sends the form', async () => {
    const { user, input, submit } = renderSearch()
    await user.type(input, 'shirt')
    await user.click(submit)
    expect(location()).toBe('/search?q=shirt')
  })

  it('submit button with an empty input keeps focus in the form', async () => {
    const { user, submit } = renderSearch()
    await user.click(submit)
    expect(location()).toBe('/')
    const active = document.activeElement
    expect(active instanceof HTMLElement && screen.getByRole('search').contains(active)).toBe(true)
  })
})

describe('HeaderSearch names', () => {
  it('input is labelled Search products with placeholder Search', () => {
    const { input } = renderSearch()
    expect(input).toHaveAttribute('placeholder', 'Search')
  })

  it('search icon image is decorative', () => {
    const { submit } = renderSearch()
    expect(submit.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('dropdown variant keeps the 250 px input width', () => {
    renderSearch()
    expect(screen.getByRole('search').parentElement?.parentElement).toHaveClass('w-[250px]')
  })
})
