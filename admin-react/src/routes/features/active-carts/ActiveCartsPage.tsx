// /features/active-carts/ActiveCartsPage.tsx

import { Provider } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'

import CartsFilters from './components/CartsFilters'
import CartsTable from './components/CartsTable'
import TopBar from './components/TopBar'
import {
  fetchCarts,
  makeStore,
  setFilters,
  useAppDispatch,
  useAppSelector,
} from './store'

import type { JSX } from 'react'
import type { CartsApiConfig } from './types'

function Content(): JSX.Element {
  const dispatch = useAppDispatch()
  const { rows, total, filters } = useAppSelector((s) => s.carts)
  const [selected, setSelected] = useState<Array<string>>([])

  // On first mount, fetch
  useEffect(() => {
    dispatch(fetchCarts())
  }, [dispatch])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Active Carts</h1>

      <section className="py-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar could hold saved views, stats; keeping filters full-width for now */}
          <div className="lg:col-span-2 space-y-4">
            <TopBar selectedIds={selected} />
            <CartsFilters />

            <CartsTable
              rows={rows}
              total={total}
              pageIndex={filters.page}
              pageSize={filters.pageSize}
              onPageChange={(idx) => {
                dispatch(setFilters({ page: idx }))
                dispatch(fetchCarts())
              }}
              onPageSizeChange={(size) => {
                dispatch(setFilters({ pageSize: size, page: 0 }))
                dispatch(fetchCarts())
              }}
              onSelectionChange={setSelected}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ActiveCartsPage(props: {
  api: CartsApiConfig
}): JSX.Element {
  const store = useMemo(() => makeStore(props.api), [props.api])
  return (
    <Provider store={store}>
      <Content />
    </Provider>
  )
}
