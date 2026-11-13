import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import * as authService from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from './useToast'
import type { UseMutationResult } from '@tanstack/react-query'
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types'

export const LOGIN_MUTATION_KEY = ['auth', 'login'] as const

interface AuthSession {
  user: User | null
  isAuthenticated: boolean
}

export function useAuth(): AuthSession {
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  return { user, isAuthenticated }
}

export function useLogin(): UseMutationResult<AuthResponse, Error, LoginCredentials> {
  const login = useAuthStore((state) => state.login)
  const toast = useToast()

  return useMutation({
    mutationKey: LOGIN_MUTATION_KEY,
    mutationFn: authService.login,
    onSuccess: ({ user, token }) => {
      login(user, token)
      toast.success(TOAST_MESSAGES.auth.welcomeBack(user.name))
    },
  })
}

export function useRegister(): UseMutationResult<AuthResponse, Error, RegisterCredentials> {
  const login = useAuthStore((state) => state.login)
  const toast = useToast()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: ({ user, token }) => {
      login(user, token)
      toast.success(TOAST_MESSAGES.auth.accountCreated)
    },
  })
}

export function useLogout(): () => void {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useAuthStore((state) => state.logout)
  const toast = useToast()

  return function handleLogout(): void {
    logout()
    queryClient.clear()
    navigate(ROUTES.HOME, { replace: true })
    toast.info(TOAST_MESSAGES.auth.loggedOut)
  }
}
