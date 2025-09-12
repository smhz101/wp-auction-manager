// /src/routes/features/settings/store.ts

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { optionsSchema } from './schema'
import {
  fetchOptions as apiFetchOptions,
  updateOptions as apiUpdateOptions,
} from './api'

import type { FlatOptions, LoadState, SaveState } from './types'

/** Thunks */
export const fetchOptions = createAsyncThunk<FlatOptions>(
  'options/fetch',
  async () => {
    const data = await apiFetchOptions()
    return optionsSchema.parse({ ...data })
  },
)

export const saveOptions = createAsyncThunk<FlatOptions, FlatOptions>(
  'options/save',
  async (values) => {
    const payload = optionsSchema.parse(values) // validate
    const data = await apiUpdateOptions(payload)
    return optionsSchema.parse({ ...data })
  },
)

/** Slice */
const slice = createSlice({
  name: 'options',
  initialState: {
    data: optionsSchema.parse({}), // defaults
    loadState: 'idle' as LoadState,
    saveState: 'idle' as SaveState,
    error: '' as string,
  },
  reducers: {
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

export const { setLocal } = slice.actions
export default slice.reducer
