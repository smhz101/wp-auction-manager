// /features/active-carts/api.ts

import axios from 'axios'

import type { CartListParams, CartsApiConfig } from './types'

export function createAxiosClient(config: CartsApiConfig) {
  const baseURL = config.axiosBaseUrl ?? ''
  const client = axios.create({ baseURL })

  client.interceptors.request.use((req) => {
    const header = config.authHeaderName ?? 'Authorization'
    const token = config.getAuthToken?.()
    if (token) req.headers[header] = `Bearer ${token}`
    return req
  })

  return {
    async list(params: CartListParams) {
      const res = await client.get(config.endpoints.listUrl, { params })
      return res.data
    },
    async updateNote(id: string, note: string) {
      const res = await client.put(config.endpoints.updateNoteUrl(id), { note })
      return res.data
    },
    async bulkStatus(
      ids: Array<string>,
      status: 'active' | 'abandoned' | 'recovering',
    ) {
      const res = await client.post(config.endpoints.bulkStatusUrl, {
        ids,
        status,
      })
      return res.data
    },
  }
}
