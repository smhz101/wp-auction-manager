// /src/routes/features/active-carts/api.ts

import type { Cart, CartListParams } from './types'
import { wpHttp } from '@/lib/api/client'

const BASE = '/wpam/v1/carts'

/** GET /wpam/v1/carts */
export async function listCarts(
  params: CartListParams,
): Promise<{ rows: Array<Cart>; total: number } | Array<Cart>> {
  return wpHttp.get(`${BASE}`, params as Record<string, any>)
}

/** PUT /wpam/v1/carts/{id}/note */
export async function updateCartNote(id: string, note: string): Promise<Cart> {
  return wpHttp.putJson(`${BASE}/${encodeURIComponent(id)}/note`, { note })
}

/** POST /wpam/v1/carts/bulk-status */
export async function bulkCartStatus(vars: {
  ids: Array<string>
  status: 'active' | 'abandoned' | 'recovering'
}): Promise<{ updated: number }> {
  return wpHttp.post(`${BASE}/bulk-status`, vars)
}
