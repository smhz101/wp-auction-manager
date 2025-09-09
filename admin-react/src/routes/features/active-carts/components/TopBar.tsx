// /features/active-carts/components/TopBar.tsx

import {
  bulkStatus,
  fetchCarts,
  useAppDispatch,
  useAppSelector,
} from '../store'
import { exportCsv } from '../exportCsv'

import type { JSX } from 'react'
import { Button } from '@/components/ui/button'

export default function TopBar(props: {
  selectedIds: Array<string>
}): JSX.Element {
  const { selectedIds } = props
  const dispatch = useAppDispatch()
  const { rows } = useAppSelector((s) => s.carts)
  const load = useAppSelector((s) => s.carts.loadState)
  const save = useAppSelector((s) => s.carts.saveState)

  return (
    <div className="rounded-2xl border bg-white p-4 flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => dispatch(fetchCarts())}
        disabled={load === 'loading'}
      >
        {load === 'loading' ? 'Loading…' : 'Reload'}
      </Button>

      <div className="ml-auto flex gap-2">
        <Button
          onClick={() =>
            dispatch(
              bulkStatus({ ids: selectedIds, status: 'recovering' }),
            ).then(() => dispatch(fetchCarts()))
          }
          disabled={selectedIds.length === 0 || save === 'saving'}
        >
          Mark Recovering
        </Button>
        <Button variant="outline" onClick={() => exportCsv(rows)}>
          Export CSV
        </Button>
      </div>
    </div>
  )
}
