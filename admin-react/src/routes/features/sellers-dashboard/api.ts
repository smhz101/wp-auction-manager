// /routes/features/sellers-dashboard/api.ts

import type { DashboardData } from './types'

// Prefer shared axios client if available
let http: any
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  http = require('@/lib/api/client').default
} catch {
  // Fallback tiny axios instance
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const axios = require('axios').default
  http = axios.create({ baseURL: '/api', timeout: 12000 })
}

// Toggle this flag to use mocked data for now
const USE_MOCK = true

export async function fetchDashboardApi(): Promise<DashboardData> {
  if (USE_MOCK) {
    const { getMockDashboard } = await import('./mocks')
    // Simulate network
    await new Promise((r) => setTimeout(r, 200))
    return getMockDashboard()
  }
  const { data } = await http.get<DashboardData>('/seller/dashboard')
  return data
}

export async function pauseAuctionApi(lotId: string): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200))
    return { ok: true }
  }
  const { data } = await http.post<{ ok: boolean }>(
    `/seller/auctions/${lotId}/pause`,
  )
  return data
}
