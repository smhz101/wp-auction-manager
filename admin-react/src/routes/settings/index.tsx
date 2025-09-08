import * as React from 'react'
import { Outlet, createRoute } from '@tanstack/react-router'
import { TabsVertical } from './components/TabsVertical'
import AuctionsSection from './sections/Auctions'
import BidsSection from './sections/Bids'
import CartsSection from './sections/Carts'
import DesignSection from './sections/Design'
import GeneralSection, { General } from './sections/General'
import LicensingSection from './sections/Licensing'
import ProvidersSection from './sections/Providers'
import UsersSection from './sections/Users'
import type { RootRoute } from '@tanstack/react-router'

function SettingsLayout() {
  const items: Array<{ to: string; label: string }> = React.useMemo(
    () =>
      [
        { to: '/settings/general', label: 'General' },
        { to: '/settings/auctions', label: 'Auctions' },
        { to: '/settings/bids', label: 'Bids' },
        { to: '/settings/carts', label: 'Carts' },
        { to: '/settings/users', label: 'Users' },
        { to: '/settings/design', label: 'Design' },
        { to: '/settings/providers', label: 'Providers' },
        { to: '/settings/licensing', label: 'Licensing' },
      ] as const,
    [],
  )

  return (
    <div className="max-w-[1200px] px-4 py-6">
      <h1 className="mb-4 text-xl font-semibold">Settings</h1>
      <div className="flex gap-4">
        <TabsVertical items={items} />
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default (parentRoute: RootRoute) => {
  const settingsRoute = createRoute({
    component: SettingsLayout,
    getParentRoute: () => parentRoute,
    path: '/settings',
  })

  // Index child that redirects /settings -> /settings/general
  const settingsIndexRoute = createRoute({
    component: General,
    getParentRoute: () => settingsRoute,
    path: '/',
  })

  // attach children
  settingsRoute.addChildren([
    settingsIndexRoute,
    GeneralSection(settingsRoute),
    AuctionsSection(settingsRoute),
    BidsSection(settingsRoute),
    CartsSection(settingsRoute),
    UsersSection(settingsRoute),
    DesignSection(settingsRoute),
    ProvidersSection(settingsRoute),
    LicensingSection(settingsRoute),
  ])

  return settingsRoute
}
