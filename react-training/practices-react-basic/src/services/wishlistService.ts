import { apiClient } from './apiClient'
import type { Wishlist } from '@/types'

async function findWishlist(userId: string): Promise<Wishlist | undefined> {
  const wishlists = await apiClient.get<Wishlist[]>('/wishlists', { 'userId:eq': userId })
  return wishlists[0]
}

async function saveProductIds(wishlistId: string, productIds: string[]): Promise<void> {
  await apiClient.patch<Wishlist>(`/wishlists/${encodeURIComponent(wishlistId)}`, { productIds })
}

export async function getWishlist(userId: string): Promise<string[]> {
  const wishlist = await findWishlist(userId)
  return wishlist ? wishlist.productIds : []
}

export async function add(userId: string, productId: string): Promise<void> {
  const wishlist = await findWishlist(userId)
  if (!wishlist) {
    await apiClient.post<Wishlist>('/wishlists', { userId, productIds: [productId] })
    return
  }
  if (wishlist.productIds.includes(productId)) return
  await saveProductIds(wishlist.id, [productId, ...wishlist.productIds])
}

export async function remove(userId: string, productId: string): Promise<void> {
  const wishlist = await findWishlist(userId)
  if (!wishlist || !wishlist.productIds.includes(productId)) return
  await saveProductIds(
    wishlist.id,
    wishlist.productIds.filter((id) => id !== productId)
  )
}
