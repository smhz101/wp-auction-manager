import { Loader2, RotateCcw, Save } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { bulkTagLost, fetchBids } from '../store'
import exportCsv from '../exportCsv'

import { Button } from '@/components/ui/button'

import type { JSX } from 'react'

type Props = {
  isLoading: boolean
  onReload: () => void
}

export default function TopBar({ isLoading, onReload }: Props): JSX.Element {
  const dispatch = useAppDispatch()
  const selectedRows = useAppSelector((s) => {
    const set = new Set(s.bids.selection)
    return s.bids.rows.filter((r) => set.has(r.id))
  })
  const selectedIds = selectedRows.map((r) => r.id)
  const isSaving = useAppSelector((s) => s.bids.saveState === 'saving')

  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">Bids Manager</h1>
        <p className="text-sm text-zinc-600">
          {isLoading ? 'Loading…' : `${selectedRows.length} selected`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          disabled={selectedIds.length === 0 || isSaving}
          onClick={() => dispatch(bulkTagLost({ ids: selectedIds }) as any)}
          title="Mark selected as Lost"
        >
          Mark Lost
        </Button>

        <Button
          variant="outline"
          disabled={selectedIds.length === 0}
          onClick={() => exportCsv(selectedRows)}
          title="Export selected to CSV"
        >
          <Save className="mr-2 h-4 w-4" />
          Export CSV
        </Button>

        <Button
          variant="outline"
          disabled={isLoading || isSaving}
          onClick={() => onReload()}
          title="Reload"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Loading…' : 'Reload'}
        </Button>
      </div>
    </header>
  )
}
