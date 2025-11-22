// Shared global client (nonce + errors handled centrally)
import type { Bid, BidListParams } from './types'
import { wpHttp } from '@/lib/api/client'

// REST base (server: /wp-json/wpam/v1/bids)
const BASE = '/wpam/v1/bids'

export async function list(params: BidListParams) {
  // server may return either { rows, total } or an array
  return wpHttp.get<{ rows?: Array<Bid>; total?: number } | Array<Bid>>(
    BASE,
    params,
  )
}

export async function updateNote(id: string, note: string) {
  return wpHttp.putJson<Bid>(`${BASE}/${encodeURIComponent(id)}/note`, { note })
}

export async function bulkTagLost(ids: Array<string>) {
  return wpHttp.post<{ updated: number }>(`${BASE}/bulk/lost`, { ids })
}
