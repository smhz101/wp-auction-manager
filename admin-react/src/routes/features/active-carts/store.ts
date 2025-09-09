// /features/active-carts/store.ts

import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'

import { createAxiosClient } from './api'
import { BulkStatusSchema, FiltersSchema, NoteSchema } from './schema'

import type { AnyAction } from 'redux'
import type { ThunkDispatch } from '@reduxjs/toolkit'
import type {
  Cart,
  CartListParams,
  CartsApiConfig,
  LoadState,
  SaveState,
} from './types'

/** Thunks */
export const fetchCarts = createAsyncThunk<
  { rows: Array<Cart>; total: number },
  void,
  { state: RootState }
>('carts/fetch', async (_, api) => {
  const { filters, api: cfg } = api.getState().carts
  const client = createAxiosClient(cfg)
  const params: CartListParams = { ...filters }
  const data = await client.list(params)
  // accept either { rows, total } or Array<Cart>
  if (Array.isArray(data)) return { rows: data, total: data.length }
  return {
    rows: data.rows as Array<Cart>,
    total: Number(data.total ?? data.rows?.length ?? 0),
  }
})

export const updateNote = createAsyncThunk<
  Cart,
  { id: string; note: string },
  { state: RootState }
>('carts/updateNote', async (vars, api) => {
  const parsed = NoteSchema.parse({ note: vars.note })
  const client = createAxiosClient(api.getState().carts.api)
  const res = await client.updateNote(vars.id, parsed.note)
  return res as Cart
})

export const bulkStatus = createAsyncThunk<
  Array<string>,
  { ids: Array<string>; status: 'active' | 'abandoned' | 'recovering' },
  { state: RootState }
>('carts/bulkStatus', async (vars, api) => {
  BulkStatusSchema.parse(vars)
  const client = createAxiosClient(api.getState().carts.api)
  await client.bulkStatus(vars.ids, vars.status)
  return vars.ids
})

/** Slice */
const slice = createSlice({
  name: 'carts',
  initialState: {
    api: {} as CartsApiConfig,
    filters: FiltersSchema.parse({}),
    rows: [] as Array<Cart>,
    total: 0,
    loadState: 'idle' as LoadState,
    saveState: 'idle' as SaveState,
    error: '' as string,
    // local UI selection (ids)
    selection: [] as Array<string>,
  },
  reducers: {
    setApi(state, action: { payload: CartsApiConfig }) {
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
      s.error = a.error.message || 'Failed to load'
    })

    b.addCase(updateNote.pending, (s) => {
      s.saveState = 'saving'
    })
    b.addCase(updateNote.fulfilled, (s, a) => {
      s.saveState = 'success'
      const idx = s.rows.findIndex((r) => r.id === a.payload.id)
      if (idx >= 0) s.rows[idx] = a.payload
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
      // optimistic refresh: just clear selection; caller can refetch
      s.selection = s.selection.filter((id) => !a.payload.includes(id))
    })
    b.addCase(bulkStatus.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to update status'
    })
  },
})

export const { setApi, setFilters, setSelection } = slice.actions

export const makeStore = (apiConfig: CartsApiConfig) => {
  const store = configureStore({
    reducer: { carts: slice.reducer },
    middleware: (gDM) => gDM({ serializableCheck: false }),
  })
  store.dispatch(setApi(apiConfig))
  return store
}

/** Types for hooks (stable, not coupled to instance) */
export type CartsSliceState = ReturnType<typeof slice.reducer>
export type RootState = { carts: CartsSliceState }
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>

/** Typed hooks */
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(sel: (s: RootState) => T) => useSelector(sel)
