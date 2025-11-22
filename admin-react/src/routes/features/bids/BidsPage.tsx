import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { fetchBids, setFilters, setSelection } from './store'

import TopBar from './components/TopBar'
import BidsFilters from './components/BidsFilters'
import BidsTable from './components/BidsTable'

import type { JSX } from 'react'

export default function BidsPage(): JSX.Element {
  const dispatch = useAppDispatch()

  const rows = useAppSelector((s) => s.bids.rows) ?? []
  const total = useAppSelector((s) => s.bids.total) ?? 0
  const loadState = useAppSelector((s) => s.bids.loadState)
  const filters = useAppSelector((s) => s.bids.filters)

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const pageRows = useMemo(() => {
    const start = pageIndex * pageSize
    return (rows ?? []).slice(start, start + pageSize)
  }, [rows, pageIndex, pageSize])

  // fetch on mount & filter change
  useEffect(() => {
    dispatch(fetchBids())
  }, [dispatch, filters])

  // reset page when filters change
  useEffect(() => {
    setPageIndex(0)
  }, [filters])

  return (
    <div className="px-4 py-6">
      <TopBar
        isLoading={loadState === 'loading'}
        onReload={() => dispatch(fetchBids())}
      />

      <div className="mb-4">
        <BidsFilters
          initialValues={filters}
          onChange={(partial) => dispatch(setFilters(partial))}
          onSearch={() => dispatch(fetchBids())}
        />
      </div>

      <BidsTable
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
