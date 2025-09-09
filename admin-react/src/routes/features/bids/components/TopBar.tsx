// /features/bids/components/TopBar.tsx

import {
  bulkTagLost,
  fetchBids,
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
  const { rows } = useAppSelector((s) => s.bids)
  const load = useAppSelector((s) => s.bids.loadState)
  const save = useAppSelector((s) => s.bids.saveState)

  return (
    <div className="rounded-2xl border bg-white p-4 flex items-center gap-2">
      <Button
        variant="outline"
        onClick={() => dispatch(fetchBids())}
        disabled={load === 'loading'}
      >
        {load === 'loading' ? 'Loading…' : 'Reload'}
      </Button>

      <div className="ml-auto flex gap-2">
        <Button
          onClick={() =>
            dispatch(bulkTagLost({ ids: selectedIds })).then(() =>
              dispatch(fetchBids()),
            )
          }
          disabled={selectedIds.length === 0 || save === 'saving'}
        >
          Mark as Lost
        </Button>
        <Button variant="outline" onClick={() => exportCsv(rows)}>
          Export CSV
        </Button>
      </div>
    </div>
  )
}
