import { useMemo, useRef } from 'react'

export interface SubmitLock {
  acquire: () => boolean
  release: () => void
}

export function useSubmitLock(): SubmitLock {
  const isHeldRef = useRef(false)
  return useMemo(
    () => ({
      acquire: () => {
        if (isHeldRef.current) return false
        isHeldRef.current = true
        return true
      },
      release: () => {
        isHeldRef.current = false
      },
    }),
    []
  )
}
