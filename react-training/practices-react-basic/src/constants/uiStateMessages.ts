export const UI_STATE_MESSAGES = {
  errorDefault: 'Something went wrong. Please try again.',
  retry: 'Try again',
} as const

export const UI_STATE_ERRORS = {
  emptyMessage: 'EmptyState message must be a non-empty string',
  emptyIconSrc: 'EmptyState iconSrc must be a non-empty string',
  emptyAction: 'EmptyState action needs a non-empty label and path',
} as const
