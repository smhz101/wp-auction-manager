// /features/public-auctions/route.tsx
import { createRoute } from '@tanstack/react-router'
import PublicAuctionsPage from './PublicAuctionsPage'
import type { RootRoute } from '@tanstack/react-router'
import type { JSX } from 'react'

export default (parentRoute: RootRoute) =>
  createRoute({
    component: PublicAuctionsPage as unknown as (
      props: Record<string, never>,
    ) => JSX.Element,
    getParentRoute: () => parentRoute,
    path: '/publicAuctions',
  })
