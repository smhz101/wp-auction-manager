// /src/routes/features/active-carts/components/TopBar.tsx

import { Loader2, RotateCcw, Save } from 'lucide-react'

import { bulkStatus, fetchCarts } from '../store'
import { exportCsv } from '../exportCsv'

import type { JSX } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { Button } from '@/components/ui/button'

export default function TopBar(): JSX.Element {
  const dispatch = useAppDispatch()
  const selected = useAppSelector((s) => s.carts.selection)
  const rows = useAppSelector((s) => s.carts.rows)
  const load = useAppSelector((s) => s.carts.loadState)
  const save = useAppSelector((s) => s.carts.saveState)

  const isLoading = load === 'loading'
  const isSaving = save === 'saving'

  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold">Active Carts</h1>
        <p className="text-sm text-zinc-600">
          Selected: <span className="font-medium">{selected.length}</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={() => dispatch(fetchCarts())}
          variant="outline"
          disabled={isLoading || isSaving}
          title="Reload carts"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RotateCcw className="mr-2 h-4 w-4" />
          )}
          {isLoading ? 'Loading…' : 'Reload'}
        </Button>

        <Button
          onClick={() =>
            dispatch(bulkStatus({ ids: selected, status: 'recovering' }))
          }
          disabled={selected.length === 0 || isSaving}
          title="Mark selected as recovering"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {isSaving ? 'Saving…' : 'Mark Recovering'}
        </Button>

        <Button
          variant="ghost"
          disabled={selected.length === 0}
          onClick={() => exportCsv(rows.filter((r) => selected.includes(r.id)))}
          title="Export selected carts to CSV"
        >
          Export CSV
        </Button>
      </div>
    </header>
  )
}
