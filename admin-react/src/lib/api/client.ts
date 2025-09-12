// /src/lib/api/client.ts

import axios, { AxiosError } from 'axios'
import type { AxiosInstance } from 'axios'

import { getBoot } from '@/lib/api/boot'

export type WPHttpConfig = {
  baseURL?: string
  authHeaderName?: string // default: 'X-WP-Nonce'
  getAuthToken?: () => string | null // default: from boot()
  refreshAuthToken?: () => Promise<string | null> // optional
  withCredentials?: boolean // default: true
}

type WPErrorShape = {
  code?: string
  message?: string
  data?: { status?: number }
}

function isWPError(payload: unknown): payload is WPErrorShape {
  return (
    !!payload && typeof payload === 'object' && 'message' in (payload as any)
  )
}

let singleton: AxiosInstance | null = null
let configRef: WPHttpConfig | null = null

export function initHttp(config?: Partial<WPHttpConfig>): AxiosInstance {
  if (singleton) return singleton

  const boot = getBoot()
  configRef = {
    baseURL: config?.baseURL ?? boot.restRoot ?? '/wp-json/',
    authHeaderName: config?.authHeaderName ?? 'X-WP-Nonce',
    getAuthToken: config?.getAuthToken ?? (() => boot.nonce ?? null),
    refreshAuthToken: config?.refreshAuthToken,
    withCredentials: config?.withCredentials ?? true,
  }

  const client = axios.create({
    baseURL: configRef.baseURL,
    withCredentials: configRef.withCredentials,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  client.interceptors.request.use((req) => {
    const nonce = configRef?.getAuthToken?.() ?? boot.nonce ?? null
    if (nonce) req.headers[configRef!.authHeaderName!] = nonce
    return req
  })

  client.interceptors.response.use(
    (res) => {
      if (isWPError(res.data) && res.data?.data?.status) {
        const err = new AxiosError(
          res.data.message || 'WordPress error',
          String(res.data.data.status),
          res.config,
          res.request,
          res,
        )
        ;(err as any).code = res.data.code
        throw err
      }
      return res
    },
    async (error: any) => {
      const status: number | undefined = error?.response?.status
      const code: string | undefined = error?.response?.data?.code
      const nonceProblem =
        status === 401 ||
        status === 403 ||
        code === 'rest_cookie_invalid_nonce' ||
        code === 'rest_nonce_invalid'

      if (
        nonceProblem &&
        !error.config.__wpamRetried &&
        typeof configRef?.refreshAuthToken === 'function'
      ) {
        try {
          const fresh = await configRef.refreshAuthToken()
          if (fresh) {
            error.config.headers[configRef.authHeaderName!] = fresh
            error.config.__wpamRetried = true
            return client.request(error.config)
          }
        } catch {
          // ignore and fall through
        }
      }

      if (isWPError(error?.response?.data)) {
        const wp = error.response.data as WPErrorShape
        const err = new AxiosError(
          wp.message || 'WordPress error',
          String(wp.data?.status || status || 'WP_ERROR'),
          error.config,
          error.request,
          error.response,
        )
        ;(err as any).code = wp.code
        throw err
      }

      throw error
    },
  )

  singleton = client
  return client
}

export function getHttp(): AxiosInstance {
  return singleton ?? initHttp()
}

async function withMethodOverride<T>(
  method: 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  payload?: unknown,
) {
  const http = getHttp()
  try {
    if (method === 'PUT') {
      const { data } = await http.put<T>(url, payload)
      return data
    }
    if (method === 'PATCH') {
      const { data } = await http.patch<T>(url, payload)
      return data
    }
    const { data } = await http.delete<T>(url, { data: payload })
    return data
  } catch (e: any) {
    if (e?.response?.status === 405) {
      const { data } = await http.post<T>(url, payload, {
        headers: { 'X-HTTP-Method-Override': method },
      })
      return data
    }
    throw e
  }
}

export const wpHttp = {
  get: async <T>(url: string, params?: Record<string, any>) => {
    const http = getHttp()
    const { data } = await http.get<T>(url, { params })
    return data
  },
  post: async <T>(url: string, payload?: unknown) => {
    const http = getHttp()
    const { data } = await http.post<T>(url, payload)
    return data
  },
  putJson: async <T>(url: string, payload?: unknown) =>
    withMethodOverride<T>('PUT', url, payload),
  patchJson: async <T>(url: string, payload?: unknown) =>
    withMethodOverride<T>('PATCH', url, payload),
  deleteJson: async <T>(url: string, payload?: unknown) =>
    withMethodOverride<T>('DELETE', url, payload),
}
