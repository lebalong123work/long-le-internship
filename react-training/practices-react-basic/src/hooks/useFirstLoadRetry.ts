import { useEffect, useRef, useState } from 'react'

interface RefetchResult {
  status: 'pending' | 'error' | 'success'
}

interface RetryState {
  key: string
  phase: 'retrying' | 'recovered'
}

interface FirstLoadRetry {
  isRetrying: boolean
  hasRecovered: boolean
  retry: () => void
}

async function refetchSucceeded(refetch: () => Promise<RefetchResult>): Promise<boolean> {
  try {
    const result = await refetch()
    return result.status === 'success'
  } catch {
    return false
  }
}

function settledRetry(
  current: RetryState | null,
  key: string,
  succeeded: boolean
): RetryState | null {
  if (current?.key !== key || current.phase !== 'retrying') return current
  return succeeded ? { key, phase: 'recovered' } : null
}

export function useFirstLoadRetry(
  key: string | undefined,
  refetch: () => Promise<RefetchResult>
): FirstLoadRetry {
  const [retryState, setRetryState] = useState<RetryState | null>(null)
  const [shownKey, setShownKey] = useState(key)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  if (key !== shownKey) {
    setShownKey(key)
    setRetryState(null)
  }

  const current = retryState !== null && retryState.key === key ? retryState : null

  async function runRetry(retryKey: string): Promise<void> {
    setRetryState({ key: retryKey, phase: 'retrying' })
    const succeeded = await refetchSucceeded(refetch)
    if (!isMounted.current) return
    setRetryState((state) => settledRetry(state, retryKey, succeeded))
  }

  return {
    isRetrying: current?.phase === 'retrying',
    hasRecovered: current?.phase === 'recovered',
    retry: () => {
      if (key !== undefined) void runRetry(key)
    },
  }
}
