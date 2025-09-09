import { Provider } from 'react-redux'
import { useEffect, useMemo, useState } from 'react'

import BidsFilters from './components/BidsFilters'
import BidsTable from './components/BidsTable'
import TopBar from './components/TopBar'
import {
  fetchBids,
  makeStore,
  setFilters,
  useAppDispatch,
  useAppSelector,
} from './store'

import type { JSX } from 'react'
import type { BidsApiConfig } from './types'

function Content(): JSX.Element {
  const dispatch = useAppDispatch()
  const { rows, total, filters } = useAppSelector((s) => s.bids)
  const [selected, setSelected] = useState<Array<string>>([])

  useEffect(() => {
    dispatch(fetchBids())
  }, [dispatch])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Bids Manager</h1>

      <section className="py-6">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <div className="lg:col-span-2 space-y-4">
            <TopBar selectedIds={selected} />
            <BidsFilters />
            <BidsTable
              rows={rows}
              total={total}
              pageIndex={filters.page}
              pageSize={filters.pageSize}
              onPageChange={(idx) => {
                dispatch(setFilters({ page: idx }))
                dispatch(fetchBids())
              }}
              onPageSizeChange={(size) => {
                dispatch(setFilters({ pageSize: size, page: 0 }))
                dispatch(fetchBids())
              }}
              onSelectionChange={setSelected}
            />
          </div>
        </div>
      </section>
    </div>
  )
}

export default function BidsPage(props: { api: BidsApiConfig }): JSX.Element {
  const store = useMemo(() => makeStore(props.api), [props.api])
  return (
    <Provider store={store}>
      <Content />
    </Provider>
  )
}
