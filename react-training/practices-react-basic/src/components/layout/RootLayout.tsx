import { Outlet } from 'react-router-dom'
import { AuthModal } from '@/components/auth/AuthModal'
import { Toaster } from '@/components/shared/Toaster'
import { useWishlistPendingAction } from '@/hooks/useWishlist'

export function RootLayout(): JSX.Element {
  useWishlistPendingAction()
  return (
    <>
      <Outlet />
      <AuthModal />
      <Toaster />
    </>
  )
}
