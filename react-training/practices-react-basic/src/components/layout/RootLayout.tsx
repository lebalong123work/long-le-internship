import { Outlet } from 'react-router-dom'
import { AuthModal } from '@/components/auth/AuthModal'

// Header, Footer and Toaster are added in their own tasks.
export function RootLayout(): JSX.Element {
  return (
    <>
      <Outlet />
      <AuthModal />
    </>
  )
}
