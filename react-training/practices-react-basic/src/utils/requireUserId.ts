export const LOGIN_REQUIRED = 'Login required'

export function requireUserId(userId: string | undefined): string {
  if (!userId) throw new Error(LOGIN_REQUIRED)
  return userId
}
