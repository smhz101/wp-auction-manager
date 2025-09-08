// /features/settings/route.tsx

import { createRoute } from '@tanstack/react-router'

import OptionsPage from './OptionsPage'

import type { JSX } from 'react'
import type { RootRoute } from '@tanstack/react-router'
import type { OptionsApiConfig } from './types'

const apiConfig: OptionsApiConfig = {
  axiosBaseUrl: '/wp-json', // example
  endpoints: {
    fetchUrl: '/wpam/v1/options',
    updateUrl: '/wpam/v1/options',
  },
  authHeaderName: 'X-WP-Nonce',
  getAuthToken: () => (window as any)?.wpApiSettings?.nonce ?? null,
}

function SettingsRouteComponent(): JSX.Element {
  return <OptionsPage api={apiConfig} />
}

export default (parentRoute: RootRoute) =>
  createRoute({
    component: SettingsRouteComponent as unknown as (
      props: Record<string, never>,
    ) => JSX.Element,
    getParentRoute: () => parentRoute,
    path: '/settings',
  })
