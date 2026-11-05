import type { AddToCartDto } from './order'
import type { User } from './user'

export type PendingAction =
  { type: 'addToCart'; payload: AddToCartDto } | { type: 'toggleWishlist'; productId: string }

export type PendingActionType = PendingAction['type']

export type PendingActionHandler<T extends PendingActionType> = (
  action: Extract<PendingAction, { type: T }>,
  user: User
) => void
