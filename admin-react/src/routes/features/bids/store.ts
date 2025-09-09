// /features/bids/store.ts

import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'

import { createAxiosClient } from './api'
import { FiltersSchema, NoteSchema } from './schema'

import type { AnyAction } from 'redux'
import type { ThunkDispatch } from '@reduxjs/toolkit'
import type {
  Bid,
  BidListParams,
  BidsApiConfig,
  LoadState,
  SaveState,
} from './types'

/** Thunks */
export const fetchBids = createAsyncThunk<
  { rows: Array<Bid>; total: number },
  void,
  { state: RootState }
>('bids/fetch', async (_, api) => {
  const s = api.getState().bids
  const client = createAxiosClient(s.api)
  const params: BidListParams = {
    ...s.filters,
    min: s.filters.min ? Number(s.filters.min) : undefined,
    max: s.filters.max ? Number(s.filters.max) : undefined,
  }
  const data = await client.list(params)
  if (Array.isArray(data))
    return { rows: data as Array<Bid>, total: (data as Array<Bid>).length }
  return {
    rows: data.rows as Array<Bid>,
    total: Number(data.total ?? data.rows?.length ?? 0),
  }
})

export const updateNote = createAsyncThunk<
  Bid,
  { id: string; note: string },
  { state: RootState }
>('bids/updateNote', async (vars, api) => {
  const parsed = NoteSchema.parse({ note: vars.note })
  const client = createAxiosClient(api.getState().bids.api)
  const res = await client.updateNote(vars.id, parsed.note)
  return res as Bid
})

export const bulkTagLost = createAsyncThunk<
  Array<string>,
  { ids: Array<string> },
  { state: RootState }
>('bids/bulkTagLost', async (vars, api) => {
  const client = createAxiosClient(api.getState().bids.api)
  await client.bulkTagLost(vars.ids)
  return vars.ids
})

/** Slice */
const slice = createSlice({
  name: 'bids',
  initialState: {
    api: {} as BidsApiConfig,
    filters: FiltersSchema.parse({}),
    rows: [] as Array<Bid>,
    total: 0,
    loadState: 'idle' as LoadState,
    saveState: 'idle' as SaveState,
    error: '' as string,
    selection: [] as Array<string>,
  },
  reducers: {
    setApi(state, action: { payload: BidsApiConfig }) {
      state.api = action.payload
    },
    setFilters(
      state,
      action: { payload: Partial<ReturnType<typeof FiltersSchema.parse>> },
    ) {
      state.filters = { ...state.filters, ...action.payload }
    },
    setSelection(state, action: { payload: Array<string> }) {
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
      s.error = a.error.message || 'Failed to load'
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

    b.addCase(bulkTagLost.pending, (s) => {
      s.saveState = 'saving'
    })
    b.addCase(bulkTagLost.fulfilled, (s, a) => {
      s.saveState = 'success'
      s.selection = s.selection.filter((id) => !a.payload.includes(id))
    })
    b.addCase(bulkTagLost.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to tag lost'
    })
  },
})

export const { setApi, setFilters, setSelection } = slice.actions

export const makeStore = (apiConfig: BidsApiConfig) => {
  const store = configureStore({
    reducer: { bids: slice.reducer },
    middleware: (gDM) => gDM({ serializableCheck: false }),
  })
  store.dispatch(setApi(apiConfig))
  return store
}

/** Stable types and hooks */
export type BidsSliceState = ReturnType<typeof slice.reducer>
export type RootState = { bids: BidsSliceState }
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(sel: (s: RootState) => T) => useSelector(sel)
