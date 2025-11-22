import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit'
import * as api from './api'
import { FiltersSchema, NoteSchema } from './schema'

import type { RootState } from '@/store'
import type { Bid, BidListParams, LoadState, SaveState } from './types'

export type BidsState = {
  filters: ReturnType<typeof FiltersSchema.parse>
  rows: Array<Bid>
  total: number
  loadState: LoadState
  saveState: SaveState
  error: string
  selection: Array<string>
}

const initialState: BidsState = {
  filters: FiltersSchema.parse({}),
  rows: [],
  total: 0,
  loadState: 'idle',
  saveState: 'idle',
  error: '',
  selection: [],
}

/** Thunks */
export const fetchBids = createAsyncThunk<
  { rows: Array<Bid>; total: number },
  void,
  { state: RootState }
>('bids/fetch', async (_, thunk) => {
  const s = thunk.getState().bids
  const params: BidListParams = {
    q: s.filters.q || undefined,
    status:
      s.filters.status && s.filters.status !== 'all'
        ? s.filters.status
        : undefined,
    min: s.filters.min ? Number(s.filters.min) : undefined,
    max: s.filters.max ? Number(s.filters.max) : undefined,
    from: s.filters.from || undefined,
    to: s.filters.to || undefined,
  }
  const res = await api.list(params)
  if (Array.isArray(res)) return { rows: res, total: res.length }
  return {
    rows: Array.isArray(res.rows) ? res.rows : [],
    total: Number(res.total ?? (res.rows ? res.rows.length : 0)),
  }
})

export const updateBidNote = createAsyncThunk<
  Bid,
  { id: string; note: string },
  { state: RootState }
>('bids/updateNote', async ({ id, note }) => {
  // validate UI payload
  NoteSchema.parse({ note })
  const updated = await api.updateNote(id, note)
  return updated
})

export const bulkTagLost = createAsyncThunk<
  Array<string>,
  { ids: Array<string> },
  { state: RootState }
>('bids/bulkTagLost', async ({ ids }) => {
  await api.bulkTagLost(ids)
  return ids
})

/** Slice */
const slice = createSlice({
  name: 'bids',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<BidsState['filters']>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSelection(state, action: PayloadAction<Array<string>>) {
      state.selection = action.payload
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchBids.pending, (s) => {
      s.loadState = 'loading'
      s.error = ''
    })
    b.addCase(fetchBids.fulfilled, (s, a) => {
      s.loadState = 'success'
      s.rows = a.payload.rows
      s.total = a.payload.total
    })
    b.addCase(fetchBids.rejected, (s, a) => {
      s.loadState = 'error'
      s.error = a.error.message || 'Failed to load bids'
    })

    b.addCase(updateBidNote.pending, (s) => {
      s.saveState = 'saving'
    })
    b.addCase(updateBidNote.fulfilled, (s, a) => {
      s.saveState = 'success'
      const i = s.rows.findIndex((r) => r.id === a.payload.id)
      if (i >= 0) s.rows[i] = a.payload
    })
    b.addCase(updateBidNote.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to update note'
    })

    b.addCase(bulkTagLost.pending, (s) => {
      s.saveState = 'saving'
    })
    b.addCase(bulkTagLost.fulfilled, (s, a) => {
      s.saveState = 'success'
      // clear any selection that was updated; data refresh is left to caller
      s.selection = s.selection.filter((id) => !a.payload.includes(id))
    })
    b.addCase(bulkTagLost.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to mark as lost'
    })
  },
})

export const { setFilters, setSelection } = slice.actions
export default slice.reducer

// Selectors (optional)
export const selectBids = (s: RootState) => s.bids.rows
export const selectBidsSelection = (s: RootState) => s.bids.selection
export const selectBidsSelectedRows = (s: RootState) => {
  const set = new Set(s.bids.selection)
  return s.bids.rows.filter((r) => set.has(r.id))
}
