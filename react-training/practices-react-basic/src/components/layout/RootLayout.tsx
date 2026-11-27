import { useRef } from 'react'
import { Outlet } from 'react-router-dom'
import { AuthModal } from '@/components/auth/AuthModal'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SAFE_AREA_X } from '@/components/layout/safeArea'
import { Toaster } from '@/components/shared/Toaster'
import { FOCUS_RING } from '@/components/ui/interactionClasses'
import { LAYOUT_TEXT, MAIN_CONTENT_ID } from '@/constants/layout'
import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate'
import { useWishlistPendingAction } from '@/hooks/useWishlist'
import { cn } from '@/utils/cn'
import type { MouseEvent } from 'react'

const SKIP_LINK_CLASSES = [
  'sr-only focus:not-sr-only focus:fixed focus:z-50',
  'focus:left-[calc(16px_+_env(safe-area-inset-left))] focus:top-[calc(16px_+_env(safe-area-inset-top))]',
  'focus:rounded-10 focus:bg-white focus:px-4 focus:py-3 focus:shadow-header',
  'font-body text-base font-bold text-dark',
]

export function RootLayout(): JSX.Element {
  const mainRef = useRef<HTMLElement>(null)
  useScrollToTopOnNavigate()
  useWishlistPendingAction()

  function skipToMain(event: MouseEvent<HTMLAnchorElement>): void {
    event.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <>
      <a
        href={`#${MAIN_CONTENT_ID}`}
        onClick={skipToMain}
        className={cn(SKIP_LINK_CLASSES, FOCUS_RING)}
      >
        {LAYOUT_TEXT.skipToMain}
      </a>
      <div className={SAFE_AREA_X}>
        <Header />
        <main ref={mainRef} id={MAIN_CONTENT_ID} tabIndex={-1} className="outline-none">
          <Outlet />
        </main>
      </div>
      <Footer />
      <AuthModal />
      <Toaster />
    </>
  )
}
