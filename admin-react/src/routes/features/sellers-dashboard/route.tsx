// /routes/features/sellers-dashboard/index.tsx

import { createRoute } from '@tanstack/react-router'
import SellersDashboardPage from './SellersDashboardPage'

import type { RootRoute } from '@tanstack/react-router'

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/sellersDashboard',
    component: SellersDashboardPage,
    getParentRoute: () => parentRoute,
  })
