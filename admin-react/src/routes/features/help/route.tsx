// /features/help/route.tsx
import { createRoute } from '@tanstack/react-router'
import HelpPage from './HelpPage'
import type { RootRoute } from '@tanstack/react-router'

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/help',
    component: HelpPage,
    getParentRoute: () => parentRoute,
  })
