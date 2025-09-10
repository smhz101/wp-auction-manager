// /routes/features/sellers-dashboard/slice.ts

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { fetchDashboardApi, pauseAuctionApi } from './api'
import type { DashboardData, SellerAuction } from './types'

export type LoadState = 'idle' | 'loading' | 'loaded' | 'error'

export type SellersDashboardState = {
  data: DashboardData | null
  loadState: LoadState
  error: string
}

const initialState: SellersDashboardState = {
  data: null,
  loadState: 'idle',
  error: '',
}

export const fetchDashboard = createAsyncThunk(
  'sellers/fetchDashboard',
  async () => {
    const data = await fetchDashboardApi()
    return data
  },
)

export const pauseAuction = createAsyncThunk(
  'sellers/pauseAuction',
  async (lotId: string) => {
    await pauseAuctionApi(lotId)
    return lotId
  },
)

const slice = createSlice({
  name: 'sellers',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchDashboard.pending, (state) => {
      state.loadState = 'loading'
      state.error = ''
    })
    b.addCase(
      fetchDashboard.fulfilled,
      (state, action: PayloadAction<DashboardData>) => {
        state.data = action.payload
        state.loadState = 'loaded'
      },
    )
    b.addCase(fetchDashboard.rejected, (state, action) => {
      state.loadState = 'error'
      state.error = action.error.message ?? 'Failed to load'
    })

    b.addCase(
      pauseAuction.fulfilled,
      (state, action: PayloadAction<string>) => {
        if (!state.data) return
        const idx = state.data.auctions.findIndex(
          (a) => a.id === action.payload,
        )
        if (idx >= 0) {
          const next: SellerAuction = {
            ...state.data.auctions[idx],
            status: 'paused',
          }
          state.data.auctions[idx] = next
        }
      },
    )
  },
})

export default slice.reducer
