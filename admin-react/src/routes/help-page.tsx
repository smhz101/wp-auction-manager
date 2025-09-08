import { createRoute } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'

function HelpPage() {
  return <>Help Page</>
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/help',
    component: HelpPage,
    getParentRoute: () => parentRoute,
  })
