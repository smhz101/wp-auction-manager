// External (alphabetical)
// — none —

// Types last
import type { FlatOptions } from './types'

// Internal (alphabetical)
import { wpHttp } from '@/lib/api/client'

const BASE = '/wpam/v1/options'

export async function fetchOptions(): Promise<FlatOptions> {
  return wpHttp.get<FlatOptions>(`${BASE}`)
}

export async function updateOptions(
  payload: FlatOptions,
): Promise<FlatOptions> {
  return wpHttp.putJson<FlatOptions>(`${BASE}`, payload)
}
