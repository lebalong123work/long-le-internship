export const TOAST_MESSAGES = {
  cart: {
    added: 'Added to cart',
    removed: 'Removed from cart',
    updateFailed: 'Could not update your cart. Please try again.',
  },
  wishlist: {
    saved: 'Saved to wishlist',
    removed: 'Removed from wishlist',
    updateFailed: 'Could not update your wishlist. Please try again.',
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
    updateFailed: 'Could not save your profile. Please try again.',
    passwordChangeFailed: 'Could not change your password. Please try again.',
  },
  network: {
    error: 'Network error. Check your connection.',
  },
} as const
