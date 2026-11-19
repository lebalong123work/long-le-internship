import { createBrowserRouter } from 'react-router-dom'
import { AccountLayout } from '@/components/layout/AccountLayout'
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
import type { RouteObject } from 'react-router-dom'

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/shop', element: <Shop /> },
      { path: '/shop/:productId', element: <ProductDetail /> },
      { path: '/search', element: <Search /> },
      { path: '/about', element: <AboutUs /> },
      { path: '/contact', element: <Contact /> },

      {
        element: <ProtectedRoute />,
        children: [
          { path: '/cart', element: <Cart /> },
          { path: '/checkout', element: <Checkout /> },
          { path: '/order-success/:orderId', element: <OrderSuccess /> },
          {
            element: <AccountLayout />,
            children: [
              { path: '/account/profile', element: <Profile /> },
              { path: '/account/orders', element: <OrderHistory /> },
              { path: '/account/wishlist', element: <Wishlist /> },
            ],
          },
        ],
      },

      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes)
