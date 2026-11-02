import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { useAuthStore } from '@/stores/authStore'

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const logout = useAuthStore((state) => state.logout)

  function handleLogout(): void {
    logout()
    queryClient.clear() // drop cached cart / wishlist / orders of this user
    navigate(ROUTES.HOME)
  }

  return { user, isAuthenticated, handleLogout }
}
