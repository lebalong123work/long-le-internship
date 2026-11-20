import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PRODUCT_CARD_TEXT } from '@/constants/productCard'
import { PRODUCT_DETAIL_TEXT } from '@/constants/productDetail'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as cartService from '@/services/cartService'
import * as wishlistService from '@/services/wishlistService'
import { useAuthStore } from '@/stores/authStore'
import { usePendingActionStore } from '@/stores/pendingActionStore'
import { useToastStore } from '@/stores/toastStore'
import { product } from '@/test/fixtures'
import { ProductActions } from './ProductActions'
import type { Cart, Product, User } from '@/types'

vi.mock('@/services/cartService')
vi.mock('@/services/wishlistService')

const actualCartService = await vi.importActual<typeof cartService>('@/services/cartService')

interface ActionsOptions {
  item?: Product
  color?: string | null
  size?: string | null
  quantity?: number
}

const user: User = { id: 'u1', name: 'Test Customer', email: 'user@store.com', role: 'customer' }
const PRODUCT: Product = { ...product('p1'), name: 'Tee One', colors: ['Black', 'Blue'] }
const serverCart: Cart = { id: 'c1', userId: 'u1', items: [] }

function LocationProbe(): JSX.Element {
  return <output data-testid="location-search">{useLocation().search}</output>
}

function authParam(): string | null {
  return new URLSearchParams(screen.getByTestId('location-search').textContent ?? '').get('auth')
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

function renderActions({
  item = PRODUCT,
  color = 'Blue',
  size = 'S',
  quantity = 2,
}: ActionsOptions = {}) {
  const onMissingColor = vi.fn()
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/shop/p1']}>
        <ProductActions
          product={item}
          color={color}
          size={size}
          quantity={quantity}
          onMissingColor={onMissingColor}
        />
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>
  )
  return { ...view, onMissingColor, queryClient, user: userEvent.setup() }
}

function addButton(): HTMLElement {
  return screen.getByRole('button', { name: PRODUCT_DETAIL_TEXT.addToCart })
}

function heartButton(): HTMLElement {
  return screen.getByRole('button', { name: PRODUCT_CARD_TEXT.saveToWishlist('Tee One') })
}

function toasts() {
  return useToastStore.getState().toasts.map(({ type, message }) => ({ type, message }))
}

function logOut() {
  useAuthStore.setState({ user: null, token: null, isAuthenticated: false })
}

beforeEach(() => {
  useAuthStore.setState({ user, token: 'mock-token-u1', isAuthenticated: true })
  useToastStore.setState({ toasts: [] })
  usePendingActionStore.setState({ action: null })
  vi.mocked(wishlistService.getWishlist).mockResolvedValue([])
  vi.mocked(cartService.getCart).mockResolvedValue(serverCart)
  vi.mocked(cartService.isMergePendingError).mockImplementation(
    actualCartService.isMergePendingError
  )
})

afterEach(() => {
  vi.resetAllMocks()
  localStorage.clear()
})

describe('ProductActions — Add To Cart', () => {
  it('reports a missing color and sends nothing', async () => {
    const { user: clicker, onMissingColor } = renderActions({ color: null })
    await clicker.click(addButton())
    expect(onMissingColor).toHaveBeenCalledTimes(1)
    expect(cartService.addItem).not.toHaveBeenCalled()
  })

  it('checks the color before a guest add', async () => {
    logOut()
    const { user: clicker, onMissingColor } = renderActions({ color: null })
    await clicker.click(addButton())
    expect(onMissingColor).toHaveBeenCalledTimes(1)
    expect(cartService.addItem).not.toHaveBeenCalled()
    expect(authParam()).toBeNull()
  })

  it('sends an empty color for a product without colors', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { user: clicker } = renderActions({ item: { ...PRODUCT, colors: [] }, color: null })
    await clicker.click(addButton())
    expect(cartService.addItem).toHaveBeenCalledWith(
      { kind: 'user', id: 'u1' },
      expect.objectContaining({ color: '' })
    )
  })

  it('sends an empty size for a product without sizes', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { user: clicker } = renderActions({ item: { ...PRODUCT, sizes: [] }, size: null })
    await clicker.click(addButton())
    expect(cartService.addItem).toHaveBeenCalledWith(
      { kind: 'user', id: 'u1' },
      expect.objectContaining({ size: '' })
    )
  })

  it('disables Add To Cart when the quantity is 0 (out of stock)', () => {
    renderActions({ quantity: 0 })
    expect(addButton()).toBeDisabled()
  })

  it('P1 adds to the guest cart for a guest without opening login', async () => {
    logOut()
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { user: clicker } = renderActions()
    await clicker.click(addButton())
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.cart.added }])
    )
    expect(cartService.addItem).toHaveBeenCalledWith(
      { kind: 'guest', id: localStorage.getItem('mcs_guest') },
      { productId: 'p1', color: 'Blue', size: 'S', quantity: 2 }
    )
    expect(usePendingActionStore.getState().action).toBeNull()
    expect(authParam()).toBeNull()
  })

  it('P2 sends one guest add for two clicks in the same moment', async () => {
    logOut()
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    renderActions()
    act(() => {
      addButton().click()
      addButton().click()
    })
    await waitFor(() => expect(toasts()).toHaveLength(1))
    expect(cartService.addItem).toHaveBeenCalledTimes(1)
  })

  it('P3 shows the recovery toast when a pending merge refuses a guest add', async () => {
    logOut()
    vi.mocked(cartService.addItem).mockRejectedValue(
      new ApiError(409, actualCartService.CART_ERRORS.mergePending)
    )
    const { user: clicker } = renderActions()
    await clicker.click(addButton())
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.mergePending }])
    )
  })

  it('adds product, color, size and quantity for a logged-in user with one toast', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { user: clicker } = renderActions()
    await clicker.click(addButton())
    expect(cartService.addItem).toHaveBeenCalledWith(
      { kind: 'user', id: 'u1' },
      {
        productId: 'p1',
        color: 'Blue',
        size: 'S',
        quantity: 2,
      }
    )
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.cart.added }])
    )
  })

  it('waits for the cart read the header started before adding', async () => {
    let finishRead: (cart: Cart) => void = () => undefined
    vi.mocked(cartService.getCart).mockReturnValue(
      new Promise<Cart>((resolve) => {
        finishRead = resolve
      })
    )
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    const { user: clicker, queryClient } = renderActions()
    void queryClient.fetchQuery({
      queryKey: queryKeys.cart({ kind: 'user', id: 'u1' }),
      queryFn: () => cartService.getCart({ kind: 'user', id: 'u1' }),
    })
    await clicker.click(addButton())
    expect(cartService.addItem).not.toHaveBeenCalled()
    await act(async () => finishRead(serverCart))
    await waitFor(() => expect(cartService.addItem).toHaveBeenCalledTimes(1))
    expect(cartService.getCart).toHaveBeenCalledTimes(1)
  })

  it('shows the error toast and lets the user try again after a failure', async () => {
    vi.mocked(cartService.addItem).mockRejectedValueOnce(new ApiError(500, 'Server error'))
    vi.mocked(cartService.addItem).mockResolvedValueOnce(serverCart)
    const { user: clicker } = renderActions()
    await clicker.click(addButton())
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'error', message: TOAST_MESSAGES.cart.updateFailed }])
    )
    expect(addButton()).toBeEnabled()
    await clicker.click(addButton())
    expect(cartService.addItem).toHaveBeenCalledTimes(2)
  })

  it('sends one request for two clicks in the same moment', async () => {
    vi.mocked(cartService.addItem).mockResolvedValue(serverCart)
    renderActions()
    act(() => {
      addButton().click()
      addButton().click()
    })
    await waitFor(() => expect(toasts()).toHaveLength(1))
    expect(cartService.addItem).toHaveBeenCalledTimes(1)
  })

  it('still shows the toast once when the page closes while the add is running', async () => {
    const request = deferred<Cart>()
    vi.mocked(cartService.addItem).mockReturnValue(request.promise)
    const { user: clicker, unmount } = renderActions()
    await clicker.click(addButton())
    unmount()
    await act(async () => request.resolve(serverCart))
    await waitFor(() =>
      expect(toasts()).toEqual([{ type: 'success', message: TOAST_MESSAGES.cart.added }])
    )
  })

  it('marks Add To Cart busy with a spinner while the add is running', async () => {
    const request = deferred<Cart>()
    vi.mocked(cartService.addItem).mockReturnValue(request.promise)
    const { user: clicker } = renderActions()
    await clicker.click(addButton())
    expect(addButton()).toHaveAttribute('aria-busy', 'true')
    expect(addButton()).toBeDisabled()
    expect(addButton().querySelector('.animate-spin')).not.toBeNull()
    await act(async () => request.resolve(serverCart))
    await waitFor(() => expect(addButton()).not.toHaveAttribute('aria-busy'))
  })
})

describe('ProductActions — heart and bag', () => {
  it('names the heart like the card and shows the saved state', async () => {
    vi.mocked(wishlistService.getWishlist).mockResolvedValue(['p1'])
    renderActions()
    await waitFor(() => expect(heartButton()).toHaveAttribute('aria-pressed', 'true'))
    expect(heartButton().querySelector('use')).toHaveClass('fill-badge')
  })

  it('saves a pending toggleWishlist for a guest heart click', async () => {
    logOut()
    const { user: clicker } = renderActions()
    expect(heartButton()).toHaveAttribute('aria-pressed', 'false')
    await clicker.click(heartButton())
    expect(usePendingActionStore.getState().action).toEqual({
      type: 'toggleWishlist',
      productId: 'p1',
    })
    expect(authParam()).toBe('login')
  })

  it('marks the heart aria-disabled and ignores clicks while the saved list loads', async () => {
    vi.mocked(wishlistService.getWishlist).mockReturnValue(new Promise(() => undefined))
    const { user: clicker } = renderActions()
    expect(heartButton()).toHaveAttribute('aria-disabled', 'true')
    await clicker.click(heartButton())
    expect(wishlistService.add).not.toHaveBeenCalled()
    expect(toasts()).toEqual([])
  })

  it('shows the bag as decoration only', () => {
    const { container } = renderActions()
    const bag = container.querySelector('img[src="/icons/bag.svg"]')?.parentElement
    expect(bag).toHaveAttribute('aria-hidden', 'true')
    expect(bag?.tagName).toBe('SPAN')
    expect(bag).not.toHaveAttribute('tabindex')
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('keeps heart and bag 48 × 48 together and wraps them below Add To Cart when narrow', () => {
    renderActions()
    const icons = heartButton().parentElement
    expect(addButton().parentElement).toHaveClass('flex-wrap')
    expect(icons).toHaveClass('shrink-0')
    expect(heartButton()).toHaveClass('size-12')
    expect(icons?.lastElementChild).toHaveClass('size-12')
  })

  it('orders the row Add To Cart, heart, bag', () => {
    const { container } = renderActions()
    const row = addButton().parentElement
    const icons = heartButton().parentElement
    expect(row?.children[0]).toBe(addButton())
    expect(row?.children[1]).toBe(icons)
    expect(icons?.children[0]).toBe(heartButton())
    expect(icons?.children[1]).toBe(
      container.querySelector('img[src="/icons/bag.svg"]')?.parentElement
    )
  })
})
