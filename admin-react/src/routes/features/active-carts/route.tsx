// /src/routes/features/active-carts/route.tsx

import { createRoute } from '@tanstack/react-router'
import ActiveCartsPage from './ActiveCartsPage'

import type { JSX } from 'react'
import type { RootRoute } from '@tanstack/react-router'

function RouteComponent(): JSX.Element {
  return <ActiveCartsPage />
}

export default (parent: RootRoute) =>
  createRoute({
    path: '/activeCarts',
    component: RouteComponent as unknown as (
      p: Record<string, never>,
    ) => JSX.Element,
    getParentRoute: () => parent,
  })
