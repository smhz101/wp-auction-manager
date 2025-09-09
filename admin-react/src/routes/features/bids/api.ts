// /features/bids/api.ts

import axios from 'axios'

import type { BidListParams, BidsApiConfig } from './types'

export function createAxiosClient(config: BidsApiConfig) {
  const baseURL = config.axiosBaseUrl ?? ''
  const client = axios.create({ baseURL })

  client.interceptors.request.use((req) => {
    const header = config.authHeaderName ?? 'Authorization'
    const token = config.getAuthToken?.()
    if (token) req.headers[header] = `Bearer ${token}`
    return req
  })

  return {
    async list(params: BidListParams) {
      const res = await client.get(config.endpoints.listUrl, { params })
      return res.data
    },
    async updateNote(id: string, note: string) {
      const res = await client.put(config.endpoints.updateNoteUrl(id), { note })
      return res.data
    },
    async bulkTagLost(ids: Array<string>) {
      const res = await client.post(config.endpoints.bulkTagLostUrl, { ids })
      return res.data
    },
  }
}
