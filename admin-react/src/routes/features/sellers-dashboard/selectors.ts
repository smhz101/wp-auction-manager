// /routes/features/sellers-dashboard/selectors.ts

import type { RootState } from '@/store' // adjust to your store location
import type { DashboardData } from './types'

export const selectSellersData = (s: RootState): DashboardData | null =>
  s.sellers.data
export const selectSellersLoadState = (s: RootState) => s.sellers.loadState
export const selectSellersError = (s: RootState) => s.sellers.error
