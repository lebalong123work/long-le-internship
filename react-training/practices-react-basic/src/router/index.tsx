import { createBrowserRouter } from 'react-router-dom'
import { AccountLayout } from '@/components/layout/AccountLayout'
import { RootLayout } from '@/components/layout/RootLayout'
import { AppErrorPage } from '@/pages/AppError'
import ProtectedRoute from './ProtectedRoute'
import type { ComponentType } from 'react'
import type { LazyRouteFunction, RouteObject } from 'react-router-dom'

interface PageModule {
  default: ComponentType
}

function lazyPage(load: () => Promise<PageModule>): LazyRouteFunction<RouteObject> {
  return async () => ({ Component: (await load()).default })
}

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <AppErrorPage />,
    children: [
      { path: '/', lazy: lazyPage(() => import('@/pages/Home')) },
      { path: '/shop', lazy: lazyPage(() => import('@/pages/Shop')) },
      { path: '/shop/:productId', lazy: lazyPage(() => import('@/pages/ProductDetail')) },
      { path: '/search', lazy: lazyPage(() => import('@/pages/Search')) },
      { path: '/about', lazy: lazyPage(() => import('@/pages/Static/AboutUs')) },
      { path: '/contact', lazy: lazyPage(() => import('@/pages/Static/Contact')) },
      { path: '/cart', lazy: lazyPage(() => import('@/pages/Cart')) },
      { path: '/checkout', lazy: lazyPage(() => import('@/pages/Checkout')) },
      { path: '/order-success/:orderId', lazy: lazyPage(() => import('@/pages/OrderSuccess')) },
      { path: '/order-lookup', lazy: lazyPage(() => import('@/pages/OrderLookup')) },

      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AccountLayout />,
            children: [
              { path: '/account/profile', lazy: lazyPage(() => import('@/pages/Account/Profile')) },
              { path: '/account/orders', lazy: lazyPage(() => import('@/pages/Account/Orders')) },
              {
                path: '/account/wishlist',
                lazy: lazyPage(() => import('@/pages/Account/Wishlist')),
              },
            ],
          },
        ],
      },

      { path: '*', lazy: lazyPage(() => import('@/pages/NotFound')) },
    ],
  },
]

export const router = createBrowserRouter(routes)
