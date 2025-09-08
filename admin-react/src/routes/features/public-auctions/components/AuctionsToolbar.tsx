// /features/public-auctions/components/AuctionsToolbar.tsx
import { useCallback, useMemo, useState } from 'react'
import { Bookmark, Filter, LayoutGrid, List, Save } from 'lucide-react'
import { usePublicAuctions } from '../store'
import SavedSearchDialog from './SavedSearchDialog'
import type { FilterValues, SortKey } from '../types'
import type { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function AuctionsToolbar(props: {
  query: string
  onQueryChange: (q: string) => void
  sort: SortKey
  onSortChange: (s: SortKey) => void
  view: 'grid' | 'list'
  onViewChange: (v: 'grid' | 'list') => void
  currentFilters: FilterValues
}): JSX.Element {
  const {
    state: { savedSearches },
    actions,
  } = usePublicAuctions()
  const [open, setOpen] = useStateSafe(false)

  const sorts: Array<{ key: SortKey; label: string }> = useMemo(
    () => [
      { key: 'endingSoon', label: 'Ending soon' },
      { key: 'newest', label: 'Newest' },
      { key: 'priceAsc', label: 'Price: Low → High' },
      { key: 'priceDesc', label: 'Price: High → Low' },
      { key: 'mostBids', label: 'Most bids' },
    ],
    [],
  )

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search lots…"
            value={props.query}
            onChange={(e) => props.onQueryChange(e.target.value)}
            className="w-72"
          />
          <Select
            value={props.sort}
            onValueChange={(v) => props.onSortChange(v as SortKey)}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {sorts.map((s) => (
                <SelectItem key={s.key} value={s.key}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="md:ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Save className="mr-2 h-4 w-4" /> Save search
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" /> Filters
          </Button>
          <div className="inline-flex rounded-lg border overflow-hidden">
            <Button
              variant={props.view === 'grid' ? 'default' : 'ghost'}
              onClick={() => props.onViewChange('grid')}
              size="icon"
              className="rounded-none"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={props.view === 'list' ? 'default' : 'ghost'}
              onClick={() => props.onViewChange('list')}
              size="icon"
              className="rounded-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline">
            <Bookmark className="mr-2 h-4 w-4" /> Watchlist (
            {
              useMemo(
                () => savedSearches.length,
                [savedSearches],
              ) /* just a placeholder tag */
            }
            )
          </Button>
        </div>
      </div>

      <SavedSearchDialog
        open={open}
        onOpenChange={setOpen}
        initialFilters={props.currentFilters}
        onSave={(name, values) => actions.saveSearch(name, values)}
      />
    </div>
  )
}

/** Tiny stable boolean state hook to keep imports minimal */

function useStateSafe(initial = false): [boolean, (v: boolean) => void] {
  const [v, setV] = useState<boolean>(initial)
  const set = useCallback((nv: boolean) => setV(nv), [])
  return [v, set]
}
