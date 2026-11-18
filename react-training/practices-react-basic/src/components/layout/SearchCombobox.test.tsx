import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PRICE_TEXT_CLASSES } from '@/components/shared/productCardClasses'
import { queryKeys } from '@/constants/queryKeys'
import { ApiError } from '@/services/apiClient'
import * as searchService from '@/services/searchService'
import { product } from '@/test/fixtures'
import { SearchCombobox } from './SearchCombobox'
import type { Suggestion } from '@/types'

vi.mock('@/services/searchService', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/services/searchService')>()),
  searchSuggestions: vi.fn(),
}))

const suggestions: Suggestion[] = [
  { type: 'category', category: { id: 'c1', name: 'T-Shirt', slug: 't-shirt' } },
  { type: 'product', product: product('p1') },
  { type: 'product', product: { ...product('p2'), name: 'Smart Jacket', price: 45 } },
]

function LocationProbe(): JSX.Element {
  const location = useLocation()
  return <output data-testid="location">{location.pathname + location.search}</output>
}

function location(): string {
  return screen.getByTestId('location').textContent ?? ''
}

function renderCombobox(count = 1, onNavigate = vi.fn()) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retryDelay: 0 } } })
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        {Array.from({ length: count }, (_, index) => (
          <SearchCombobox key={index} variant="dropdown" onNavigate={onNavigate} />
        ))}
        <button type="button">Outside</button>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return {
    user: userEvent.setup(),
    queryClient,
    onNavigate,
    input: screen.getAllByRole('combobox', { name: 'Search products' })[0],
  }
}

function resolveWith(list: Suggestion[]): void {
  vi.mocked(searchService.searchSuggestions).mockImplementation(async () => [...list])
}

const VISIBLE_MESSAGE = 'p:not([role=status])'

function statusText(): string {
  const region = screen.getAllByRole('status').find((element) => element.tagName === 'P')
  return region?.textContent ?? ''
}

async function typeAndWaitForOptions(user: ReturnType<typeof userEvent.setup>, input: HTMLElement) {
  await user.type(input, 'shirt')
  return screen.findAllByRole('option')
}

afterEach(() => {
  vi.resetAllMocks()
})

describe('SearchCombobox states', () => {
  it('blank or spaces-only input shows no list, sends no request and does not navigate', async () => {
    const { user, input } = renderCombobox()
    await user.type(input, '   {Enter}')
    await new Promise((resolve) => setTimeout(resolve, 350))
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(searchService.searchSuggestions).not.toHaveBeenCalled()
    expect(location()).toBe('/')
  })

  it('pending shows 3 skeleton rows and not No results', async () => {
    vi.mocked(searchService.searchSuggestions).mockReturnValue(new Promise(() => {}))
    const { user, input } = renderCombobox()
    await user.type(input, 'shirt')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(document.querySelectorAll('.animate-pulse')).toHaveLength(6)
    expect(screen.queryByText('No results', { selector: VISIBLE_MESSAGE })).toBeNull()
    expect(statusText()).toBe('')
  })

  it('results list categories first with the short price and the Category label', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    const options = await typeAndWaitForOptions(user, input)
    expect(options.map((option) => option.textContent)).toEqual([
      'T-ShirtCategory',
      'Smart T-Shirt40$',
      'Smart Jacket45$',
    ])
    expect(screen.getByRole('listbox', { name: 'Search suggestions' })).toBeInTheDocument()
  })

  it('product price uses the shared price look of the Product Card', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    const options = await typeAndWaitForOptions(user, input)
    const price = within(options[1]).getByText('40$')
    expect(price).toHaveClass(...PRICE_TEXT_CLASSES.split(' '))
  })

  it('error shows Could not load suggestions', async () => {
    vi.mocked(searchService.searchSuggestions).mockRejectedValue(new ApiError(500, 'Server error'))
    const { user, input } = renderCombobox()
    await user.type(input, 'shirt')
    expect(
      await screen.findByText('Could not load suggestions', { selector: VISIBLE_MESSAGE })
    ).toBeInTheDocument()
    expect(screen.queryByRole('listbox')).toBeNull()
  })

  it('error is announced in the status region', async () => {
    vi.mocked(searchService.searchSuggestions).mockRejectedValue(new ApiError(500, 'Server error'))
    const { user, input } = renderCombobox()
    await user.type(input, 'shirt')
    await waitFor(() => expect(statusText()).toBe('Could not load suggestions'))
  })

  it('an empty result shows No results', async () => {
    resolveWith([])
    const { user, input } = renderCombobox()
    await user.type(input, 'zzz')
    expect(await screen.findByText('No results', { selector: VISIBLE_MESSAGE })).toBeInTheDocument()
    expect(statusText()).toBe('No results')
  })

  it('status announces 1 suggestion and n suggestions', async () => {
    resolveWith(suggestions.slice(0, 1))
    const { user, input } = renderCombobox()
    await typeAndWaitForOptions(user, input)
    expect(statusText()).toBe('1 suggestion')
    resolveWith(suggestions)
    await user.type(input, 'x')
    await waitFor(() => expect(statusText()).toBe('3 suggestions'))
  })

  it('a failed background refetch keeps the cached rows without the error', async () => {
    vi.mocked(searchService.searchSuggestions).mockRejectedValue(new ApiError(500, 'Server error'))
    const { user, input, queryClient } = renderCombobox()
    queryClient.setQueryData(queryKeys.search.suggestions('shirt'), suggestions)
    await user.type(input, 'shirt')
    await waitFor(() =>
      expect(queryClient.getQueryState(queryKeys.search.suggestions('shirt'))?.status).toBe('error')
    )
    expect(screen.getAllByRole('option')).toHaveLength(3)
    expect(
      screen.queryByText('Could not load suggestions', { selector: VISIBLE_MESSAGE })
    ).toBeNull()
  })
})

describe('SearchCombobox keyboard', () => {
  it('ArrowDown and ArrowUp move the active option and wrap', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    const options = await typeAndWaitForOptions(user, input)
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id)
    expect(options[0]).toHaveAttribute('aria-selected', 'true')
    await user.keyboard('{ArrowUp}')
    expect(input).toHaveAttribute('aria-activedescendant', options[2].id)
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant', options[0].id)
  })

  it('Esc with the list shown hides it, keeps the value and stops the key', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    await typeAndWaitForOptions(user, input)
    const documentListener = vi.fn()
    document.addEventListener('keydown', documentListener)
    const notPrevented = fireEvent.keyDown(input, { key: 'Escape' })
    document.removeEventListener('keydown', documentListener)
    expect(notPrevented).toBe(false)
    expect(documentListener).not.toHaveBeenCalled()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveValue('shirt')
    await user.type(input, 's')
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('Esc with the list hidden keeps the default and lets the key bubble', async () => {
    const { input } = renderCombobox()
    input.focus()
    const documentListener = vi.fn()
    document.addEventListener('keydown', documentListener)
    const notPrevented = fireEvent.keyDown(input, { key: 'Escape' })
    document.removeEventListener('keydown', documentListener)
    expect(notPrevented).toBe(true)
    expect(documentListener).toHaveBeenCalledTimes(1)
  })

  it('Enter without an active option goes to the encoded results URL', async () => {
    resolveWith([])
    const { user, input, onNavigate } = renderCombobox()
    await user.type(input, 'a&b?c#d{Enter}')
    expect(location()).toBe('/search?q=a%26b%3Fc%23d')
    expect(onNavigate).toHaveBeenCalledTimes(1)
  })

  it('Enter with an active product goes to its detail page', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    await typeAndWaitForOptions(user, input)
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(location()).toBe('/shop/p1')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveValue('shirt')
  })

  it('the active option resets when the results change', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    await typeAndWaitForOptions(user, input)
    await user.keyboard('{ArrowDown}')
    expect(input).toHaveAttribute('aria-activedescendant')
    await user.type(input, 's')
    await waitFor(() => expect(searchService.searchSuggestions).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(input).not.toHaveAttribute('aria-activedescendant'))
    expect(screen.getAllByRole('option').every((o) => o.ariaSelected === 'false')).toBe(true)
  })
})

describe('SearchCombobox pointer and focus', () => {
  it('clicking a category keeps focus in the input and goes to its results', async () => {
    resolveWith(suggestions)
    const { user, input, onNavigate } = renderCombobox()
    const options = await typeAndWaitForOptions(user, input)
    const notPrevented = fireEvent.mouseDown(options[0])
    expect(notPrevented).toBe(false)
    await user.click(options[0])
    expect(location()).toBe('/search?q=T-Shirt')
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(input).toHaveFocus()
  })

  it('pointer down outside hides the list', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    await typeAndWaitForOptions(user, input)
    fireEvent.pointerDown(document.body)
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('pointer down on an option keeps the list', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    const options = await typeAndWaitForOptions(user, input)
    fireEvent.pointerDown(options[1])
    expect(input).toHaveAttribute('aria-expanded', 'true')
  })

  it('focus leaving the combobox hides the list', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    await typeAndWaitForOptions(user, input)
    await user.tab()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Outside' })).toHaveFocus()
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })
})

describe('SearchCombobox ARIA', () => {
  it('input is a text field with the search Enter key, so Esc never clears it natively', () => {
    const { input } = renderCombobox()
    expect(input).toHaveAttribute('type', 'text')
    expect(input).toHaveAttribute('enterkeyhint', 'search')
  })

  it('no aria-controls or aria-activedescendant while nothing is mounted', async () => {
    vi.mocked(searchService.searchSuggestions).mockReturnValue(new Promise(() => {}))
    const { user, input } = renderCombobox()
    expect(input).not.toHaveAttribute('aria-controls')
    await user.type(input, 'shirt')
    await user.keyboard('{ArrowDown}')
    expect(input).not.toHaveAttribute('aria-controls')
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('aria-controls names the mounted listbox', async () => {
    resolveWith(suggestions)
    const { user, input } = renderCombobox()
    await typeAndWaitForOptions(user, input)
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
    expect(input).toHaveAttribute('aria-controls', screen.getByRole('listbox').id)
    expect(input).not.toHaveAttribute('aria-activedescendant')
  })

  it('option ids are unique across two comboboxes', async () => {
    resolveWith(suggestions)
    renderCombobox(2)
    for (const input of screen.getAllByRole('combobox')) {
      fireEvent.change(input, { target: { value: 'shirt' } })
    }
    await waitFor(() => expect(screen.getAllByRole('listbox')).toHaveLength(2))
    const ids = screen.getAllByRole('listbox').flatMap((listbox) =>
      within(listbox)
        .getAllByRole('option')
        .map((option) => option.id)
    )
    expect(new Set(ids).size).toBe(6)
  })
})
