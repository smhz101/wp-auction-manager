// /features/public-auctions/PublicAuctionsPage.tsx
import { useCallback, useMemo, useState } from 'react'
import { PublicAuctionsProvider, usePublicAuctions } from './store'
import AuctionsFilters from './components/AuctionsFilters'
import AuctionsToolbar from './components/AuctionsToolbar'
import LotsGrid from './components/LotsGrid'
import Pagination from './components/Pagination'
import QuickStats from './components/QuickStats'
import type { FilterValues, Lot, SortKey } from './types'
import type { JSX } from 'react'

export default function PublicAuctionsPage(): JSX.Element {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Public Auctions</h1>

      <section className="py-6">
        <PublicAuctionsProvider>
          <Content />
        </PublicAuctionsProvider>
      </section>
    </div>
  )
}

function Content(): JSX.Element {
  const {
    state: { lots },
  } = usePublicAuctions()

  const [filters, setFilters] = useState<FilterValues>({
    query: '',
    categories: [],
    status: [],
    shipping: [],
    condition: [],
    buyNowOnly: false,
    reserveMetOnly: false,
  })
  const [query, setQuery] = useState<string>('')
  const [sort, setSort] = useState<SortKey>('endingSoon')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState<number>(1)
  const pageSize = 9

  const filtered = useMemo(
    () => applyFilters(lots, { ...filters, query }),
    [lots, filters, query],
  )
  const sorted = useMemo(() => applySort(filtered, sort), [filtered, sort])

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page])

  const counts = useMemo(
    () => ({
      all: lots.length,
      live: lots.filter((l) => l.status === 'live').length,
      upcoming: lots.filter((l) => l.status === 'upcoming').length,
      ended: lots.filter((l) => l.status === 'ended').length,
    }),
    [lots],
  )

  const handleFilterChange = useCallback((v: FilterValues) => {
    setFilters(v)
    setPage(1)
  }, [])

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <AuctionsFilters
        defaultValues={filters}
        onChange={handleFilterChange}
        onClear={() => {
          setFilters({
            query: '',
            categories: [],
            status: [],
            shipping: [],
            condition: [],
            buyNowOnly: false,
            reserveMetOnly: false,
          })
          setQuery('')
          setPage(1)
        }}
      />

      <div className="space-y-4">
        <QuickStats counts={counts} />
        <AuctionsToolbar
          currentFilters={filters}
          onQueryChange={(q) => {
            setQuery(q)
            setPage(1)
          }}
          onSortChange={(s) => {
            setSort(s)
            setPage(1)
          }}
          onViewChange={setView}
          query={query}
          sort={sort}
          view={view}
        />
        <LotsGrid items={pageItems} view={view} />
        <Pagination
          page={page}
          pageSize={pageSize}
          total={sorted.length}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}

/* ---------------- logic helpers ---------------- */
function applyFilters(items: Array<Lot>, f: FilterValues): Array<Lot> {
  let out = items

  if (f.query?.trim()) {
    const q = f.query.toLowerCase()
    out = out.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.tags.some((t) => t.toLowerCase().includes(q)) ||
        l.categories.some((c) => c.toLowerCase().includes(q)),
    )
  }
  if ((f.categories?.length ?? 0) > 0)
    out = out.filter((l) => l.categories.some((c) => f.categories.includes(c)))
  if ((f.status?.length ?? 0) > 0)
    out = out.filter((l) => f.status.includes(l.status))
  if (typeof f.minPrice === 'number')
    out = out.filter((l) => (l.currentBid || 0) >= f.minPrice!)
  if (typeof f.maxPrice === 'number')
    out = out.filter((l) => (l.currentBid || 0) <= f.maxPrice!)
  if ((f.shipping?.length ?? 0) > 0)
    out = out.filter((l) => f.shipping!.includes(l.shipping))
  if ((f.condition?.length ?? 0) > 0)
    out = out.filter((l) => f.condition!.includes(l.condition))
  if (f.buyNowOnly) out = out.filter((l) => typeof l.buyNowPrice === 'number')
  if (f.reserveMetOnly) out = out.filter((l) => l.reserveMet)

  if (f.endingWithin) {
    const horizon = (() => {
      switch (f.endingWithin) {
        case '6h':
          return 6
        case '24h':
          return 24
        case '3d':
          return 72
        case '7d':
          return 168
        default:
          return 99999
      }
    })()
    out = out.filter(
      (l) =>
        l.status !== 'ended' &&
        new Date(l.endsAt).getTime() - Date.now() <= horizon * 3_600_000,
    )
  }

  return out
}

function applySort(items: Array<Lot>, key: SortKey): Array<Lot> {
  const arr = [...items]
  switch (key) {
    case 'endingSoon':
      return arr.sort((a, b) => +new Date(a.endsAt) - +new Date(b.endsAt))
    case 'newest':
      return arr.sort((a, b) => +new Date(b.endsAt) - +new Date(a.endsAt))
    case 'priceAsc':
      return arr.sort((a, b) => (a.currentBid || 0) - (b.currentBid || 0))
    case 'priceDesc':
      return arr.sort((a, b) => (b.currentBid || 0) - (a.currentBid || 0))
    case 'mostBids':
      return arr.sort((a, b) => (b.bidsCount || 0) - (a.bidsCount || 0))
    default:
      return arr
  }
}
