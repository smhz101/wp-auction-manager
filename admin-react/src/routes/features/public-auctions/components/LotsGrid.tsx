// /features/public-auctions/components/LotsGrid.tsx
import LotCard from './LotCard'
import type { JSX } from 'react'
import type { Lot } from '../types'

export default function LotsGrid(props: {
  items: Array<Lot>
  view: 'grid' | 'list'
}): JSX.Element {
  const { items, view } = props

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center text-zinc-500">
        No lots match your filters.
      </div>
    )
  }

  if (view === 'list') {
    return (
      <div className="space-y-3">
        {items.map((l) => (
          <LotCard key={l.id} lot={l} variant="list" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((l) => (
        <LotCard key={l.id} lot={l} variant="grid" />
      ))}
    </div>
  )
}
