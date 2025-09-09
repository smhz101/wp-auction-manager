// src/router.tsx
// -------------------------------------------------------------
// Centralized, programmatic TanStack Router setup with typing.
// - Builds route tree using your factory functions
// - Creates the router with hash history + your context
// - Registers the router type globally (once)
// -------------------------------------------------------------

import {
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

// App shell bits
import Header from './components/Header'
import App from './App'

// Your programmatic route factories
// import ActiveCartsPage from './routes/active-carts-page'
import ActiveCartsPage from './routes/features/active-carts/route'
import BidsManagerPage from './routes/bids-manager-page'
import publicAuctionsPage from './routes/features/public-auctions/route'
// import CustomerRolesPage from './routes/customer-roles-page'
import CustomerRolesPage from './routes/features/customer-roles/route'
import SellersDashboardPage from './routes/sellers-dashboard-page'
// import SettingsPage from './routes/settings-page'
// import SettingsLayout from './routes/settings'
import SettingsLayout from './routes/features/settings/route'
import HelpPage from './routes/features/help/route'

// TanStack Query integration context
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider'

// ---------- Root route
const rootRoute = createRootRoute({
  component: () => (
    <div className="bg-white">
      <Header />
      <Outlet />
      <TanStackRouterDevtools />
    </div>
  ),
})

// ---------- Index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
})

// ---------- Child routes (programmatically via your factories)
const routeTree = rootRoute.addChildren([
  indexRoute,
  ActiveCartsPage(rootRoute),
  BidsManagerPage(rootRoute),
  publicAuctionsPage(rootRoute),
  CustomerRolesPage(rootRoute),
  SellersDashboardPage(rootRoute),
  SettingsLayout(rootRoute),
  HelpPage(rootRoute),
])

// ---------- History + context
const history = createHashHistory()
const tanstackQueryCtx = TanStackQueryProvider.getContext()

// ---------- Router (single instance, exported)
export const router = createRouter({
  routeTree,
  history,
  basepath: '/',
  context: {
    ...tanstackQueryCtx,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

// ---------- Register router type (DO THIS ONCE ONLY)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
