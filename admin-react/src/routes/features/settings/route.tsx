// /src/routes/features/settings/route.tsx
import { createRoute } from '@tanstack/react-router'
import OptionsPage from './OptionsPage'

import type { JSX } from 'react'
import type { RootRoute } from '@tanstack/react-router'

function SettingsRouteComponent(): JSX.Element {
  return <OptionsPage />
}

export default (parentRoute: RootRoute) =>
  createRoute({
    component: SettingsRouteComponent as unknown as (
      props: Record<string, never>,
    ) => JSX.Element,
    getParentRoute: () => parentRoute,
    path: '/settings',
  })
