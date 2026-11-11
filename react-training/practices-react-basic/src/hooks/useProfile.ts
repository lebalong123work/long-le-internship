import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/constants/queryKeys'
import { TOAST_MESSAGES } from '@/constants/toastMessages'
import { ApiError } from '@/services/apiClient'
import * as userService from '@/services/userService'
import { USER_ERRORS } from '@/services/userService'
import { useAuthStore } from '@/stores/authStore'
import { requireUserId } from '@/utils/requireUserId'
import { failureMessage } from './failureMessage'
import { retryUnlessNotFound } from './queryRetry'
import { useAuth } from './useAuth'
import { useToast } from './useToast'
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query'
import type { ChangePasswordDto, UpdateProfileDto, User } from '@/types'

export interface PasswordFieldError {
  field: 'currentPassword' | 'newPassword'
  message: string
}

const PASSWORD_FIELD_BY_MESSAGE: Record<string, PasswordFieldError['field']> = {
  [USER_ERRORS.wrongCurrentPassword]: 'currentPassword',
  [USER_ERRORS.samePassword]: 'newPassword',
}

function isSessionUser(userId: string): boolean {
  return useAuthStore.getState().user?.id === userId
}

export function getPasswordFieldError(error: unknown): PasswordFieldError | null {
  if (!(error instanceof ApiError) || error.status !== 400) return null
  const field = PASSWORD_FIELD_BY_MESSAGE[error.message]
  return field ? { field, message: error.message } : null
}

export function useProfile(): UseQueryResult<User, Error> {
  const { user } = useAuth()
  const userId = user?.id

  return useQuery({
    queryKey: queryKeys.profile(userId ?? ''),
    queryFn: userId ? () => userService.getProfile(userId) : skipToken,
    retry: retryUnlessNotFound,
  })
}

export function useUpdateProfile(): UseMutationResult<User, Error, UpdateProfileDto> {
  const { user } = useAuth()
  const userId = user?.id
  const updateUser = useAuthStore((state) => state.updateUser)
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: (data) => userService.updateProfile(requireUserId(userId), data),
    onSuccess: (saved) => {
      queryClient.setQueryData(queryKeys.profile(saved.id), saved)
      if (isSessionUser(saved.id)) updateUser(saved)
      toast.success(TOAST_MESSAGES.profile.updated)
    },
    onError: (error) => {
      toast.error(failureMessage(error, TOAST_MESSAGES.profile.updateFailed))
    },
    onSettled: () => {
      if (userId) return queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) })
    },
  })
}

export function useChangePassword(): UseMutationResult<void, Error, ChangePasswordDto> {
  const { user } = useAuth()
  const userId = user?.id
  const toast = useToast()

  return useMutation({
    mutationFn: (passwords) => userService.changePassword(requireUserId(userId), passwords),
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.profile.passwordChanged)
    },
    onError: (error) => {
      if (getPasswordFieldError(error)) return
      toast.error(failureMessage(error, TOAST_MESSAGES.profile.passwordChangeFailed))
    },
  })
}
