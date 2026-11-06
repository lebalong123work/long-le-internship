import { apiClient, ApiError } from './apiClient'
import type { AddToCartDto, Cart, CartItem } from '@/types'

export const CART_ERRORS = {
  itemNotFound: 'Cart item not found',
} as const

function cartItemId(item: AddToCartDto): string {
  return `${item.productId}__${item.color}__${item.size}`
}

async function findCart(userId: string): Promise<Cart | undefined> {
  const carts = await apiClient.get<Cart[]>('/carts', { 'userId:eq': userId })
  return carts[0]
}

function saveItems(cartId: string, items: CartItem[]): Promise<Cart> {
  return apiClient.patch<Cart>(`/carts/${encodeURIComponent(cartId)}`, { items })
}

function hasItem(cart: Cart, itemId: string): boolean {
  return cart.items.some((line) => line.id === itemId)
}

export async function getCart(userId: string): Promise<Cart> {
  const cart = await findCart(userId)
  if (cart) return cart
  return apiClient.post<Cart>('/carts', { userId, items: [] })
}

export async function addItem(userId: string, item: AddToCartDto): Promise<Cart> {
  const cart = await getCart(userId)
  const isSameLine = (line: CartItem): boolean =>
    line.productId === item.productId && line.color === item.color && line.size === item.size

  const items = cart.items.some(isSameLine)
    ? cart.items.map((line) =>
        isSameLine(line) ? { ...line, quantity: line.quantity + item.quantity } : line
      )
    : [{ id: cartItemId(item), ...item }, ...cart.items]

  return saveItems(cart.id, items)
}

export async function updateQuantity(
  userId: string,
  itemId: string,
  quantity: number
): Promise<Cart> {
  const cart = await getCart(userId)
  if (!hasItem(cart, itemId)) throw new ApiError(404, CART_ERRORS.itemNotFound)
  return saveItems(
    cart.id,
    cart.items.map((line) => (line.id === itemId ? { ...line, quantity } : line))
  )
}

export async function removeItem(userId: string, itemId: string): Promise<Cart> {
  const cart = await getCart(userId)
  if (!hasItem(cart, itemId)) return cart
  return saveItems(
    cart.id,
    cart.items.filter((line) => line.id !== itemId)
  )
}

export async function clearCart(userId: string): Promise<void> {
  const cart = await getCart(userId)
  await saveItems(cart.id, [])
}
