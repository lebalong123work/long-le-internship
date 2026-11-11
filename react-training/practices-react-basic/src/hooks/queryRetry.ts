import { isNotFoundError } from '@/services/apiClient'

const MAX_RETRIES = 3

export function retryUnlessNotFound(failureCount: number, error: Error): boolean {
  return !isNotFoundError(error) && failureCount < MAX_RETRIES
}
