// External (alpha, names alphabetic within braces)
import {
  Outlet,
  createHashHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

// Internal (alpha)
import App from './App'
import Header from './components/Header'
import ActiveCartsRoute from './routes/features/active-carts/route'
import BidsManagerRoute from './routes/features/bids/route'
import CustomerRolesRoute from './routes/features/customer-roles/route'
import HelpRoute from './routes/features/help/route'
import PublicAuctionsRoute from './routes/features/public-auctions/route'
import SellersDashboardPage from './routes/sellers-dashboard-page'
import SettingsLayout from './routes/features/settings/route'
import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider'
import { getBoot } from './lib/api/boot'

// Root route (header + outlet + devtools if debug flag is on)
const rootRoute = createRootRoute({
  component: () => {
    // guard devtools in case boot is missing (e.g., hot reload before PHP injection)
    let showDevtools = false
    try {
      showDevtools = !!getBoot().flags?.debug
    } catch {
      showDevtools = false
    }
    return (
      <div className="bg-white">
        <Header />
        <Outlet />
        {showDevtools ? <TanStackRouterDevtools /> : null}
      </div>
    )
  },
})

// Index route
const indexRoute = createRoute({
  component: App,
  getParentRoute: () => rootRoute,
  path: '/',
})

// Children (programmatic factories)
const routeTree = rootRoute.addChildren([
  indexRoute,
  ActiveCartsRoute(rootRoute),
  BidsManagerRoute(rootRoute),
  PublicAuctionsRoute(rootRoute),
  CustomerRolesRoute(rootRoute),
  SellersDashboardPage(rootRoute),
  SettingsLayout(rootRoute),
  HelpRoute(rootRoute),
])

// History + context
const history = createHashHistory()
const tanstackQueryCtx = TanStackQueryProvider.getContext()
let boot
try {
  boot = getBoot()
} catch (e) {
  // If WPAM_BOOT is missing we still create the router to avoid crashes;
  // routes that actually call APIs will show their own error states.
  boot = undefined
}

// Router
export const router = createRouter({
  basepath: '/',
  context: {
    ...tanstackQueryCtx,
    boot, // available to routes if you want to read it via useRouter().options.context
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
  defaultStructuralSharing: true,
  history,
  routeTree,
  scrollRestoration: true,
})

// Router type registration (once)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
