import type { AddToCartDto, Cart } from '@/types'

export function getCart(_userId: string): Promise<Cart> {
  throw new Error('not implemented')
}

export function addItem(_userId: string, _item: AddToCartDto): Promise<Cart> {
  throw new Error('not implemented')
}

export function updateQuantity(_userId: string, _itemId: string, _quantity: number): Promise<Cart> {
  throw new Error('not implemented')
}

export function removeItem(_userId: string, _itemId: string): Promise<Cart> {
  throw new Error('not implemented')
}

export function clearCart(_userId: string): Promise<void> {
  throw new Error('not implemented')
}
