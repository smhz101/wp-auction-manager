// /routes/features/customer-roles/route.tsx
import { createRoute } from '@tanstack/react-router'
import type { JSX } from 'react'
import type { RootRoute } from '@tanstack/react-router'
import CustomerRolesPage from './CustomerRolesPage'

function RouteComponent(): JSX.Element {
  return <CustomerRolesPage />
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/customerRoles',
    getParentRoute: () => parentRoute,
    component: RouteComponent as unknown as (
      p: Record<string, never>,
    ) => JSX.Element,
  })
