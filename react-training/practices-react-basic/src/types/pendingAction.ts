import type { User } from './user'

export type PendingAction = { type: 'toggleWishlist'; productId: string }

export type PendingActionType = PendingAction['type']

export type PendingActionHandler<T extends PendingActionType> = (
  action: Extract<PendingAction, { type: T }>,
  user: User
) => void
