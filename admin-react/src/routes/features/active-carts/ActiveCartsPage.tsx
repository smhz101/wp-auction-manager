// /src/routes/features/active-carts/ActiveCartsPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { fetchCarts, setFilters, setSelection } from './store'

import TopBar from './components/TopBar'
import CartsFilters from './components/CartsFilters'
import CartsTable from './components/CartsTable'

import type { JSX } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export default function ActiveCartsPage(): JSX.Element {
  const dispatch = useAppDispatch()

  // ---- global state (safe defaults)
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const rows = useAppSelector((s) => s.carts.rows) ?? []
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const total = useAppSelector((s) => s.carts.total) ?? 0
  const loadState = useAppSelector((s) => s.carts.loadState)
  const filters = useAppSelector((s) => s.carts.filters)

  // ---- local pagination UI (client-side paging of current result set)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  // slice defensively (rows may still be undefined briefly if selector path changes)
  const pageRows = useMemo(() => {
    const start = pageIndex * pageSize
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (rows ?? []).slice(start, start + pageSize)
  }, [rows, pageIndex, pageSize])

  // fetch on mount and whenever filters change
  useEffect(() => {
    dispatch(fetchCarts())
  }, [dispatch, filters])

  // reset page when result set changes
  useEffect(() => {
    setPageIndex(0)
  }, [filters])

  return (
    <div className="px-4 py-6">
      {/* Header / actions */}
      <TopBar
        isLoading={loadState === 'loading'}
        onReload={() => dispatch(fetchCarts())}
      />

      {/* Filters */}
      <div className="mb-4">
        <CartsFilters
          onSearch={() => {
            // filters already live in store via the form — just refetch
            dispatch(fetchCarts())
          }}
          onChange={(partial) => dispatch(setFilters(partial))}
          initialValues={filters}
        />
      </div>

      {/* Table */}
      <CartsTable
        rows={pageRows}
        total={total}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={setPageIndex}
        onPageSizeChange={setPageSize}
        onSelectionChange={(ids) => dispatch(setSelection(ids))}
      />
    </div>
  )
}
