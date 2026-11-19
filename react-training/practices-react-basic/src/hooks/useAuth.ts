import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import * as authService from '@/services/authService'
import { useAuthStore } from '@/stores/authStore'
import { useGuestCartMerge } from './useGuestCartMerge'
import { useToast } from './useToast'
import type { UseMutationResult } from '@tanstack/react-query'
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types'

export const LOGIN_MUTATION_KEY = ['auth', 'login'] as const
export const REGISTER_MUTATION_KEY = ['auth', 'register'] as const

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
  const mergeGuestCart = useGuestCartMerge()

  return useMutation({
    mutationKey: LOGIN_MUTATION_KEY,
    mutationFn: authService.login,
    onSuccess: async ({ user, token }) => {
      login(user, token)
      toast.success(TOAST_MESSAGES.auth.welcomeBack(user.name))
      await mergeGuestCart(user)
    },
  })
}

export function useRegister(): UseMutationResult<AuthResponse, Error, RegisterCredentials> {
  const login = useAuthStore((state) => state.login)
  const toast = useToast()
  const mergeGuestCart = useGuestCartMerge()

  return useMutation({
    mutationKey: REGISTER_MUTATION_KEY,
    mutationFn: authService.register,
    onSuccess: async ({ user, token }) => {
      login(user, token)
      toast.success(TOAST_MESSAGES.auth.accountCreated)
      await mergeGuestCart(user)
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
