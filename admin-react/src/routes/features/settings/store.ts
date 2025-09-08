// /features/settings/store.ts

import { configureStore, createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'

import { createAxiosClient } from './api'
import { optionsSchema } from './schema'

import type {
  FlatOptions,
  LoadState,
  OptionsApiConfig,
  SaveState,
} from './types'

import type { AnyAction } from 'redux'
import type { ThunkDispatch } from '@reduxjs/toolkit'

/** Thunks */
export const fetchOptions = createAsyncThunk<
  FlatOptions,
  void,
  { state: RootState }
>('options/fetch', async (_, api) => {
  const client = createAxiosClient(api.getState().options.api)
  const data = await client.fetchOptions()
  // Accept partial payload; coerce+default via schema
  return optionsSchema.parse({ ...data })
})

export const saveOptions = createAsyncThunk<
  FlatOptions,
  FlatOptions,
  { state: RootState }
>('options/save', async (values, api) => {
  const client = createAxiosClient(api.getState().options.api)
  // Validate before send
  const payload = optionsSchema.parse(values)
  const data = await client.updateOptions(payload)
  return optionsSchema.parse({ ...data })
})

/** Slice */
const slice = createSlice({
  name: 'options',
  initialState: {
    api: {} as OptionsApiConfig,
    data: optionsSchema.parse({}), // defaults
    loadState: 'idle' as LoadState,
    saveState: 'idle' as SaveState,
    error: '' as string,
  },
  reducers: {
    setApi(state, action: { payload: OptionsApiConfig }) {
      state.api = action.payload
    },
    setLocal(state, action: { payload: Partial<FlatOptions> }) {
      state.data = { ...state.data, ...action.payload }
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchOptions.pending, (s) => {
      s.loadState = 'loading'
      s.error = ''
    })
    b.addCase(fetchOptions.fulfilled, (s, a) => {
      s.loadState = 'success'
      s.data = a.payload
    })
    b.addCase(fetchOptions.rejected, (s, a) => {
      s.loadState = 'error'
      s.error = a.error.message || 'Failed to load'
    })

    b.addCase(saveOptions.pending, (s) => {
      s.saveState = 'saving'
      s.error = ''
    })
    b.addCase(saveOptions.fulfilled, (s, a) => {
      s.saveState = 'success'
      s.data = a.payload
    })
    b.addCase(saveOptions.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to save'
    })
  },
})

export const { setApi, setLocal } = slice.actions

export const makeStore = (apiConfig: OptionsApiConfig) => {
  const store = configureStore({
    reducer: { options: slice.reducer },
    middleware: (gDM: any) => gDM({ serializableCheck: false }),
  })
  store.dispatch(setApi(apiConfig))
  return store
}

/** Typed hooks */
export type OptionsSliceState = ReturnType<typeof slice.reducer>
export type RootState = { options: OptionsSliceState }

// Define AppDispatch as a ThunkDispatch
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>

// And now the hooks:
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(sel: (s: RootState) => T) => useSelector(sel)
