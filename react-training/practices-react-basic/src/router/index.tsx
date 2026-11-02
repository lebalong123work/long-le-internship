import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from '@/components/layout/RootLayout'
import ProtectedRoute from './ProtectedRoute'
import Home from '@/pages/Home'
import Shop from '@/pages/Shop'
import ProductDetail from '@/pages/ProductDetail'
import Search from '@/pages/Search'
import AboutUs from '@/pages/Static/AboutUs'
import Contact from '@/pages/Static/Contact'
import Cart from '@/pages/Cart'
import Checkout from '@/pages/Checkout'
import OrderSuccess from '@/pages/OrderSuccess'
import Profile from '@/pages/Account/Profile'
import OrderHistory from '@/pages/Account/Orders'
import Wishlist from '@/pages/Account/Wishlist'
import NotFound from '@/pages/NotFound'

// Login / Sign Up is a modal opened with ?auth=login|register — no /login or /register routes.
export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      // Public
      { path: '/', element: <Home /> },
      { path: '/shop', element: <Shop /> },
      { path: '/shop/:productId', element: <ProductDetail /> },
      { path: '/search', element: <Search /> },
      { path: '/about', element: <AboutUs /> },
      { path: '/contact', element: <Contact /> },

      // Login required
      {
        element: <ProtectedRoute />,
        children: [
          { path: '/cart', element: <Cart /> },
          { path: '/checkout', element: <Checkout /> },
          { path: '/order-success/:orderId', element: <OrderSuccess /> },
          { path: '/account/profile', element: <Profile /> },
          { path: '/account/orders', element: <OrderHistory /> },
          { path: '/account/wishlist', element: <Wishlist /> },
        ],
      },

      // Unknown URLs (also the removed /login, /register, /admin, /seller)
      { path: '*', element: <NotFound /> },
    ],
  },
])
