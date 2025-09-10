// src/lib/api/client.ts
import axios from 'axios'
import type { AxiosError, AxiosInstance } from 'axios'

/**
 * WordPress-friendly axios client:
 * - baseURL = /wp-json/wpam/v1 by default (overridable)
 * - sends X-WP-Nonce header when available
 * - withCredentials so auth cookies work
 * - retries once on `rest_cookie_invalid_nonce` via optional refresh
 */

export type WpClientBootstrap = {
  restBase?: string // e.g. '/wp-json/wpam/v1'
  nonce?: string | null // current REST nonce
  ajaxUrl?: string | null // optional admin-ajax endpoint (if you use it)
  refreshNonce?: (() => Promise<string>) | null
}

const wp: Required<WpClientBootstrap> = {
  restBase: '/wp-json/wpam/v1',
  nonce: null,
  ajaxUrl: null,
  refreshNonce: null,
}

export const client: AxiosInstance = axios.create({
  baseURL: wp.restBase,
  withCredentials: true,
  timeout: 15000,
})

/** Optional bearer support if you ever need it */
export function setAuthToken(token: string | null): void {
  if (token) client.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete client.defaults.headers.common.Authorization
}

/** Set/replace the current REST nonce (X-WP-Nonce) */
export function setWpNonce(nonce: string | null): void {
  wp.nonce = nonce
  if (nonce) client.defaults.headers.common['X-WP-Nonce'] = nonce
  else delete client.defaults.headers.common['X-WP-Nonce']
}

/** One-time bootstrap (call as early as possible, e.g. in main.tsx) */
export function initWpClient(cfg?: WpClientBootstrap): void {
  if (cfg?.restBase) client.defaults.baseURL = cfg.restBase
  if (cfg?.nonce !== undefined) setWpNonce(cfg.nonce)
  if (cfg?.ajaxUrl) wp.ajaxUrl = cfg.ajaxUrl
  if (cfg?.refreshNonce) wp.refreshNonce = cfg.refreshNonce
}

// Attach nonce on every request (defensive in case it changes at runtime)
client.interceptors.request.use((req) => {
  if (wp.nonce && !req.headers['X-WP-Nonce']) {
    req.headers = { ...req.headers, 'X-WP-Nonce': wp.nonce }
  }
  return req
})

// Retry once on nonce failure
client.interceptors.response.use(
  (res) => res,
  async (err: AxiosError<any>) => {
    const config: any = err.config ?? {}
    const code = err.response?.data?.code
    const status = err.response?.status

    // WP commonly returns 403 with code 'rest_cookie_invalid_nonce'
    const isNonceFailure =
      (status === 401 || status === 403) && code === 'rest_cookie_invalid_nonce'

    if (isNonceFailure && !config.__wpamRetried && wp.refreshNonce) {
      try {
        const fresh = await wp.refreshNonce()
        setWpNonce(fresh)
        config.__wpamRetried = true
        return client.request(config)
      } catch {
        // fall through
      }
    }
    return Promise.reject(err)
  },
)

/** Convenience: pull settings from a localized global if available */
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    __WPAM__?: {
      restBase?: string
      nonce?: string
      ajaxUrl?: string
    }
  }
}

if (typeof window !== 'undefined' && window.__WPAM__) {
  initWpClient({
    restBase: window.__WPAM__.restBase,
    nonce: window.__WPAM__.nonce,
    ajaxUrl: window.__WPAM__.ajaxUrl,
  })
}

export default client
