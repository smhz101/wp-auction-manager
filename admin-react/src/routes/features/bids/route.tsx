// /features/bids/route.tsx

import { createRoute } from '@tanstack/react-router'

import BidsPage from './BidsPage'

import type { JSX } from 'react'
import type { RootRoute } from '@tanstack/react-router'
import type { BidsApiConfig } from './types'

const apiConfig: BidsApiConfig = {
  axiosBaseUrl: '/wp-json',
  endpoints: {
    listUrl: '/wpam/v1/bids',
    updateNoteUrl: (id) => `/wpam/v1/bids/${id}/note`,
    bulkTagLostUrl: '/wpam/v1/bids/bulk-lost',
  },
  authHeaderName: 'X-WP-Nonce',
  getAuthToken: () => (window as any)?.wpApiSettings?.nonce ?? null,
}

function BidsRouteComponent(): JSX.Element {
  return <BidsPage api={apiConfig} />
}

export default (parentRoute: RootRoute) =>
  createRoute({
    component: BidsRouteComponent as unknown as (
      props: Record<string, never>,
    ) => JSX.Element,
    getParentRoute: () => parentRoute,
    path: '/bidsManager',
  })
