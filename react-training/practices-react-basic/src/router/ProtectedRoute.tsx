import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { loginRedirectPath } from '@/hooks/useAuthModal'
import { useAuthStore } from '@/stores/authStore'

// UX guard only — not security (see docs/architecture.md §5).
export default function ProtectedRoute(): JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()
  if (!isAuthenticated) {
    return <Navigate to={loginRedirectPath(location.pathname + location.search)} replace />
  }
  return <Outlet />
}
