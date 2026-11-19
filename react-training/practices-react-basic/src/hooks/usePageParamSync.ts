import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { focusWithVisibleRing } from '@/components/ui/focusWithVisibleRing'
import { withPageParam } from '@/utils/pageSearchParams'
import type { RefObject } from 'react'

interface PageParamSyncOptions {
  page: number
  shownPage: number | undefined
  scope: string
  headingRef: RefObject<HTMLElement>
}

interface ShownPosition {
  scope: string
  page: number
}

function isOtherPageOfSameScope(previous: ShownPosition | null, next: ShownPosition): boolean {
  return previous !== null && previous.scope === next.scope && previous.page !== next.page
}

export function usePageParamSync({
  page,
  shownPage,
  scope,
  headingRef,
}: PageParamSyncOptions): void {
  const [, setSearchParams] = useSearchParams()
  const lastShown = useRef<ShownPosition | null>(null)

  useEffect(() => {
    if (shownPage === undefined || shownPage === page) return
    setSearchParams((current) => withPageParam(current, shownPage), { replace: true })
  }, [shownPage, page, setSearchParams])

  useEffect(() => {
    if (shownPage === undefined) return
    const next = { scope, page: shownPage }
    const previous = lastShown.current
    lastShown.current = next
    if (isOtherPageOfSameScope(previous, next) && headingRef.current) {
      window.scrollTo({ top: 0 })
      focusWithVisibleRing(headingRef.current)
    }
  }, [scope, shownPage, headingRef])
}
