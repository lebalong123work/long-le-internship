import { Outlet } from 'react-router-dom'
import { AuthModal } from '@/components/auth/AuthModal'
import { Header } from '@/components/layout/Header'
import { SAFE_AREA_X } from '@/components/layout/safeArea'
import { Toaster } from '@/components/shared/Toaster'
import { useWishlistPendingAction } from '@/hooks/useWishlist'

export function RootLayout(): JSX.Element {
  useWishlistPendingAction()
  return (
    <>
      <div className={SAFE_AREA_X}>
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
      <AuthModal />
      <Toaster />
    </>
  )
}
