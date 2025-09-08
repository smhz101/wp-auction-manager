// /features/settings/api.ts

import axios from 'axios'

import type { OptionsApiConfig } from './types'

export function createAxiosClient(config: OptionsApiConfig) {
  const baseURL = config.axiosBaseUrl ?? ''
  const client = axios.create({ baseURL })

  client.interceptors.request.use((req) => {
    const header = config.authHeaderName ?? 'Authorization'
    const token = config.getAuthToken?.()
    if (token) req.headers[header] = `Bearer ${token}`
    return req
  })

  return {
    fetchOptions: async () => {
      const res = await client.get(config.endpoints.fetchUrl)
      return res.data
    },
    updateOptions: async (payload: unknown) => {
      const res = await client.put(config.endpoints.updateUrl, payload)
      return res.data
    },
  }
}
