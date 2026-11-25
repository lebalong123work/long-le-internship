import { useLayoutEffect, useRef } from 'react'
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom'

export function useScrollToTopOnNavigate(): void {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const previousPathname = useRef(pathname)

  useLayoutEffect(() => {
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname
    if (navigationType !== NavigationType.Pop) window.scrollTo({ top: 0, left: 0 })
  }, [pathname, navigationType])
}
