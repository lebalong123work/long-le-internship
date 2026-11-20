import { ownerFields, ownerKey } from '@/utils/cartOwner'
import { apiClient, ApiError } from './apiClient'
import type { AddToCartDto, Cart, CartItem, CartOwner } from '@/types'

export const CART_ERRORS = {
  itemNotFound: 'Cart item not found',
} as const

function cartItemId(item: AddToCartDto): string {
  return `${item.productId}__${item.color}__${item.size}`
}

function cartPath(cartId: string): string {
  return `/carts/${encodeURIComponent(cartId)}`
}

async function findCart(owner: CartOwner): Promise<Cart | undefined> {
  const [field, id] = Object.entries(ownerFields(owner))[0]
  const carts = await apiClient.get<Cart[]>('/carts', { [`${field}:eq`]: id })
  return carts[0]
}

function saveItems(cartId: string, items: CartItem[]): Promise<Cart> {
  return apiClient.patch<Cart>(cartPath(cartId), { items })
}

function hasItem(cart: Cart, itemId: string): boolean {
  return cart.items.some((line) => line.id === itemId)
}

const cartCreations = new Map<string, Promise<Cart>>()

function createCartOnce(owner: CartOwner): Promise<Cart> {
  const key = ownerKey(owner)
  const inFlight = cartCreations.get(key)
  if (inFlight) return inFlight
  const creation = apiClient
    .post<Cart>('/carts', { ...ownerFields(owner), items: [] })
    .finally(() => cartCreations.delete(key))
  cartCreations.set(key, creation)
  return creation
}

export async function getCart(owner: CartOwner): Promise<Cart> {
  const cart = await findCart(owner)
  if (cart) return cart
  return createCartOnce(owner)
}

export async function addItem(owner: CartOwner, item: AddToCartDto): Promise<Cart> {
  const cart = await getCart(owner)
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
  owner: CartOwner,
  itemId: string,
  quantity: number
): Promise<Cart> {
  const cart = await getCart(owner)
  if (!hasItem(cart, itemId)) throw new ApiError(404, CART_ERRORS.itemNotFound)
  return saveItems(
    cart.id,
    cart.items.map((line) => (line.id === itemId ? { ...line, quantity } : line))
  )
}

export async function removeItem(owner: CartOwner, itemId: string): Promise<Cart> {
  const cart = await getCart(owner)
  if (!hasItem(cart, itemId)) return cart
  return saveItems(
    cart.id,
    cart.items.filter((line) => line.id !== itemId)
  )
}

export async function clearCart(owner: CartOwner): Promise<void> {
  const cart = await getCart(owner)
  await saveItems(cart.id, [])
}
