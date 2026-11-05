export const TOAST_MESSAGES = {
  cart: {
    added: 'Added to cart',
    removed: 'Removed from cart',
    updateFailed: 'Could not update your cart. Please try again.',
  },
  wishlist: {
    saved: 'Saved to wishlist',
    removed: 'Removed from wishlist',
  },
  auth: {
    welcomeBack: (name: string): string => `Welcome back, ${name}`,
    accountCreated: 'Account created',
    loggedOut: 'You have been logged out',
  },
  order: {
    failed: 'Order failed, please try again',
  },
  profile: {
    updated: 'Profile updated successfully',
    passwordChanged: 'Password changed successfully',
  },
  network: {
    error: 'Network error. Check your connection.',
  },
} as const
