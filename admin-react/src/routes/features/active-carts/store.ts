// /src/routes/features/active-carts/store.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

import { bulkCartStatus, listCarts, updateCartNote } from './api'
import { BulkStatusSchema, FiltersSchema, NoteSchema } from './schema'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { Cart, CartListParams, LoadState, SaveState } from './types'

/** Thunks */
export const fetchCarts = createAsyncThunk('carts/fetch', async (_, api) => {
  const s = (api.getState() as { carts: CartsState }).carts
  const params: CartListParams = { ...s.filters }
  const data = await listCarts(params)
  if (Array.isArray(data)) return { rows: data, total: data.length }
  return {
    rows: data.rows,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    total: Number(data.total ?? data.rows?.length ?? 0),
  }
})

export const updateNote = createAsyncThunk(
  'carts/updateNote',
  async (vars: { id: string; note: string }) => {
    const parsed = NoteSchema.parse({ note: vars.note })
    const res = await updateCartNote(vars.id, parsed.note)
    return res
  },
)

export const bulkStatus = createAsyncThunk(
  'carts/bulkStatus',
  async (vars: {
    ids: Array<string>
    status: 'active' | 'abandoned' | 'recovering'
  }) => {
    BulkStatusSchema.parse(vars)
    const res = await bulkCartStatus(vars)
    return { ids: vars.ids, updated: res.updated }
  },
)

/** State + slice */
export type CartsState = {
  filters: ReturnType<typeof FiltersSchema.parse>
  rows: Array<Cart>
  total: number
  loadState: LoadState
  saveState: SaveState
  error: string
  selection: Array<string> // selected ids
}

const initialState: CartsState = {
  filters: FiltersSchema.parse({}),
  rows: [],
  total: 0,
  loadState: 'idle',
  saveState: 'idle',
  error: '',
  selection: [],
}

const slice = createSlice({
  name: 'carts',
  initialState,
  reducers: {
    setFilters(
      state,
      action: PayloadAction<Partial<ReturnType<typeof FiltersSchema.parse>>>,
    ) {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSelection(state, action: PayloadAction<Array<string>>) {
      state.selection = action.payload
    },
    clearError(state) {
      state.error = ''
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchCarts.pending, (s) => {
      s.loadState = 'loading'
      s.error = ''
    })
    b.addCase(fetchCarts.fulfilled, (s, a) => {
      s.loadState = 'success'
      s.rows = a.payload.rows
      s.total = a.payload.total
    })
    b.addCase(fetchCarts.rejected, (s, a) => {
      s.loadState = 'error'
      s.error = a.error.message || 'Failed to load carts'
    })

    b.addCase(updateNote.pending, (s) => {
      s.saveState = 'saving'
    })
    b.addCase(updateNote.fulfilled, (s, a) => {
      s.saveState = 'success'
      const i = s.rows.findIndex((r) => r.id === a.payload.id)
      if (i >= 0) s.rows[i] = a.payload
    })
    b.addCase(updateNote.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to update note'
    })

    b.addCase(bulkStatus.pending, (s) => {
      s.saveState = 'saving'
    })
    b.addCase(bulkStatus.fulfilled, (s, a) => {
      s.saveState = 'success'
      // optimistic UI: just unselect the processed ids
      s.selection = s.selection.filter((id) => !a.payload.ids.includes(id))
    })
    b.addCase(bulkStatus.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to update status'
    })
  },
})

export const { setFilters, setSelection, clearError } = slice.actions
export default slice.reducer
