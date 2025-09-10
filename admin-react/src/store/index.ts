// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit'

// Feature reducers (keep specifics in features/*)
import settingsReducer from '@/routes/features/settings/store'
import cartsReducer from '@/routes/features/active-carts/store'
import bidsReducer from '@/routes/features/bids/store'
import sellersReducer from '@/routes/features/sellers-dashboard/slice' // named slice.ts in the feature
// add more features here…

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    carts: cartsReducer,
    bids: bidsReducer,
    sellers: sellersReducer,
  },
  middleware: (getDefault) =>
    getDefault({
      // feature slices may serialize dates/Errors -> relaxed is handy
      serializableCheck: false,
    }),
  devTools: import.meta.env.DEV,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
