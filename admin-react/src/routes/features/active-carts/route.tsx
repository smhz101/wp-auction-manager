// /features/active-carts/route.tsx

import { createRoute } from '@tanstack/react-router'

import ActiveCartsPage from './ActiveCartsPage'

import type { JSX } from 'react'
import type { RootRoute } from '@tanstack/react-router'
import type { CartsApiConfig } from './types'

const apiConfig: CartsApiConfig = {
  axiosBaseUrl: '/wp-json',
  endpoints: {
    listUrl: '/wpam/v1/carts',
    updateNoteUrl: (id) => `/wpam/v1/carts/${id}/note`,
    bulkStatusUrl: '/wpam/v1/carts/bulk-status',
  },
  authHeaderName: 'X-WP-Nonce',
  getAuthToken: () => (window as any)?.wpApiSettings?.nonce ?? null,
}

function ActiveCartsRouteComponent(): JSX.Element {
  return <ActiveCartsPage api={apiConfig} />
}

export default (parentRoute: RootRoute) =>
  createRoute({
    component: ActiveCartsRouteComponent as unknown as (
      props: Record<string, never>,
    ) => JSX.Element,
    getParentRoute: () => parentRoute,
    path: '/activeCarts',
  })
