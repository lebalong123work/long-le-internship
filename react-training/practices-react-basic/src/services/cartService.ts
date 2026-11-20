import { mergeCartLines, subtractCartLines } from '@/utils/cartMerge'
import { ownerFields } from '@/utils/cartOwner'
import { apiClient, ApiError } from './apiClient'
import type {
  AddToCartDto,
  Cart,
  CartItem,
  CartOwner,
  GuestMergeResult,
  PendingGuestMerge,
} from '@/types'

export const CART_ERRORS = {
  itemNotFound: 'Cart item not found',
  mergePending: 'Guest cart merge pending',
} as const

export function isMergePendingError(error: unknown): boolean {
  return (
    error instanceof ApiError && error.status === 409 && error.message === CART_ERRORS.mergePending
  )
}

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

function assertNoPendingMerge(cart: Cart | undefined): void {
  if (cart?.pendingMerge) throw new ApiError(409, CART_ERRORS.mergePending)
}

async function getWritableCart(owner: CartOwner): Promise<Cart> {
  const cart = await getCart(owner)
  assertNoPendingMerge(cart)
  return cart
}

export async function getCart(owner: CartOwner): Promise<Cart> {
  const cart = await findCart(owner)
  if (cart) return cart
  return apiClient.post<Cart>('/carts', { ...ownerFields(owner), items: [] })
}

export async function addItem(owner: CartOwner, item: AddToCartDto): Promise<Cart> {
  const cart = await getWritableCart(owner)
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
  const cart = await getWritableCart(owner)
  if (!hasItem(cart, itemId)) throw new ApiError(404, CART_ERRORS.itemNotFound)
  return saveItems(
    cart.id,
    cart.items.map((line) => (line.id === itemId ? { ...line, quantity } : line))
  )
}

export async function removeItem(owner: CartOwner, itemId: string): Promise<Cart> {
  const cart = await getWritableCart(owner)
  if (!hasItem(cart, itemId)) return cart
  return saveItems(
    cart.id,
    cart.items.filter((line) => line.id !== itemId)
  )
}

export async function clearCart(owner: CartOwner): Promise<void> {
  const cart = await getWritableCart(owner)
  await saveItems(cart.id, [])
}

async function stampMerge(guestCart: Cart, userId: string): Promise<PendingGuestMerge> {
  const pendingMerge: PendingGuestMerge = {
    id: crypto.randomUUID(),
    userId,
    items: guestCart.items,
  }
  await apiClient.patch<Cart>(cartPath(guestCart.id), { pendingMerge })
  return pendingMerge
}

async function completeMerge(guestCart: Cart, pending: PendingGuestMerge): Promise<Cart> {
  const account = await getCart({ kind: 'user', id: pending.userId })
  const appliedIds = account.appliedMergeIds ?? []
  const merged = appliedIds.includes(pending.id)
    ? account
    : await apiClient.patch<Cart>(cartPath(account.id), {
        items: mergeCartLines(account.items, pending.items),
        appliedMergeIds: [...appliedIds, pending.id],
      })
  await apiClient.patch<Cart>(cartPath(guestCart.id), {
    items: subtractCartLines(guestCart.items, pending.items),
    pendingMerge: null,
  })
  return merged
}

export async function mergeGuestCart(guestId: string, userId: string): Promise<GuestMergeResult> {
  const guestCart = await findCart({ kind: 'guest', id: guestId })
  if (!guestCart) return { status: 'nothing' }
  const { pendingMerge } = guestCart
  if (pendingMerge) {
    if (pendingMerge.userId !== userId) return { status: 'otherAccount' }
    return { status: 'merged', cart: await completeMerge(guestCart, pendingMerge) }
  }
  if (guestCart.items.length === 0) return { status: 'nothing' }
  const pending = await stampMerge(guestCart, userId)
  return { status: 'merged', cart: await completeMerge(guestCart, pending) }
}
