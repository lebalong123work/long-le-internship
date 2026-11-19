export const PROFILE_TEXT = {
  heading: 'My Profile',
  loading: 'Loading profile',
  nameLabel: 'Full name',
  emailLabel: 'Email',
  emailHint: 'Email cannot be changed',
  phoneLabel: 'Phone number',
  addressLabel: 'Default address',
  birthDateLabel: 'Date of birth',
  avatarAlt: 'Profile photo',
  changePhoto: 'Change photo',
  save: 'Save Changes',
} as const

export const AVATAR_RULES = {
  maxBytes: 1024 * 1024,
  types: ['image/jpeg', 'image/png', 'image/webp'],
} as const

export const CHANGE_PASSWORD_TEXT = {
  heading: 'Change Password',
  currentLabel: 'Current password',
  newLabel: 'New password',
  confirmLabel: 'Confirm new password',
  submit: 'Update Password',
} as const
