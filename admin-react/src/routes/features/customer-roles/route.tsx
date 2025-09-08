import { createRoute } from '@tanstack/react-router'
import CustomerRolesPage from './CustomerRolesPage'
import type { RootRoute } from '@tanstack/react-router'

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/customerRoles',
    component: CustomerRolesPage,
    getParentRoute: () => parentRoute,
  })
