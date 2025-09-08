import { useEffect, useMemo, useState } from 'react'
import { createRoute } from '@tanstack/react-router'

import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'

import type { RootRoute } from '@tanstack/react-router'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type AuctionStatus = 'live' | 'ending-soon' | 'upcoming' | 'ended'
type Auction = {
  id: string
  title: string
  image: string
  currentBid: number
  currency: string
  endsAt: string // ISO
  status: AuctionStatus
  category: string
}

const dummyAuctions: Array<Auction> = [
  {
    id: 'lot-101',
    title: 'Vintage Rolex Submariner',
    image: 'https://picsum.photos/seed/rolex/800/480',
    currentBid: 5200,
    currency: 'USD',
    endsAt: '2025-09-08T18:00:00Z',
    status: 'live',
    category: 'Watches',
  },
  {
    id: 'lot-102',
    title: 'Classic Porsche 911 (Diecast)',
    image: 'https://picsum.photos/seed/porsche/800/480',
    currentBid: 230,
    currency: 'USD',
    endsAt: '2025-09-07T15:30:00Z',
    status: 'ending-soon',
    category: 'Collectibles',
  },
  {
    id: 'lot-103',
    title: 'Signed Cricket Bat (Wasim Akram)',
    image: 'https://picsum.photos/seed/cricket/800/480',
    currentBid: 850,
    currency: 'USD',
    endsAt: '2025-09-10T20:00:00Z',
    status: 'upcoming',
    category: 'Sports',
  },
  {
    id: 'lot-104',
    title: 'Contemporary Art Print',
    image: 'https://picsum.photos/seed/art/800/480',
    currentBid: 440,
    currency: 'USD',
    endsAt: '2025-09-09T10:00:00Z',
    status: 'live',
    category: 'Art',
  },
  {
    id: 'lot-105',
    title: 'Ferrari Scuderia Cap (Signed)',
    image: 'https://picsum.photos/seed/ferrari/800/480',
    currentBid: 120,
    currency: 'USD',
    endsAt: '2025-09-06T23:59:00Z',
    status: 'ending-soon',
    category: 'Sports',
  },
  {
    id: 'lot-106',
    title: 'PK Heritage Truck Miniature',
    image: 'https://picsum.photos/seed/truck/800/480',
    currentBid: 75,
    currency: 'USD',
    endsAt: '2025-09-12T09:00:00Z',
    status: 'upcoming',
    category: 'Collectibles',
  },
  {
    id: 'lot-107',
    title: 'Omega Speedmaster Moonwatch',
    image: 'https://picsum.photos/seed/omega/800/480',
    currentBid: 4100,
    currency: 'USD',
    endsAt: '2025-09-06T20:45:00Z',
    status: 'live',
    category: 'Watches',
  },
  {
    id: 'lot-108',
    title: 'Classic Car Poster Set',
    image: 'https://picsum.photos/seed/posters/800/480',
    currentBid: 60,
    currency: 'USD',
    endsAt: '2025-09-15T18:30:00Z',
    status: 'upcoming',
    category: 'Art',
  },
]

// Simple countdown hook
function useCountdown(target: string) {
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    const update = () => {
      const diff = new Date(target).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('Ended')
        return
      }
      const hrs = Math.floor(diff / (1000 * 60 * 60))
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      setTimeLeft(`${hrs}h ${mins}m left`)
    }
    update()
    const timer = setInterval(update, 60000) // update every min
    return () => clearInterval(timer)
  }, [target])

  return timeLeft
}

function currencyFmt(val: number, currency: Auction['currency']) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(val)
  } catch {
    return `${currency} ${val.toLocaleString()}`
  }
}

const STATUS_LABEL: Record<AuctionStatus, string> = {
  live: 'Live',
  'ending-soon': 'Ending Soon',
  upcoming: 'Upcoming',
  ended: 'Ended',
}

const statusBadgeCls: Record<AuctionStatus, string> = {
  live: 'bg-emerald-100 text-emerald-700',
  'ending-soon': 'bg-amber-100 text-amber-700',
  upcoming: 'bg-sky-100 text-sky-700',
  ended: 'bg-gray-200 text-gray-600',
}

type Sort = 'endSoon' | 'bidHigh' | 'bidLow' | 'newest'

const sortOptions: Array<{ value: Sort; label: string }> = [
  { value: 'endSoon', label: 'Ending Soon' },
  { value: 'bidHigh', label: 'Highest Bid' },
  { value: 'bidLow', label: 'Lowest Bid' },
  { value: 'newest', label: 'Newest' },
]

function PublicAuctionsPage() {
  // Filters
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<AuctionStatus | 'all'>('all')
  const [category, setCategory] = useState<'All' | Auction['category']>('All')
  const [minBid, setMinBid] = useState<number | ''>('')
  const [maxBid, setMaxBid] = useState<number | ''>('')
  const [sort, setSort] = useState<Sort>('endSoon')

  // Pagination
  const [page, setPage] = useState(1)
  const pageSize = 9

  // Derived list
  const filtered = useMemo(() => {
    let list = [...dummyAuctions]

    if (status !== 'all') list = list.filter((a) => a.status === status)
    if (category !== 'All') list = list.filter((a) => a.category === category)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((a) => a.title.toLowerCase().includes(q))
    }
    if (minBid !== '') list = list.filter((a) => a.currentBid >= Number(minBid))
    if (maxBid !== '') list = list.filter((a) => a.currentBid <= Number(maxBid))

    switch (sort) {
      case 'endSoon':
        list.sort((a, b) => +new Date(a.endsAt) - +new Date(b.endsAt))
        break
      case 'bidHigh':
        list.sort((a, b) => b.currentBid - a.currentBid)
        break
      case 'bidLow':
        list.sort((a, b) => a.currentBid - b.currentBid)
        break
      case 'newest':
        list.sort((a, b) => +new Date(b.endsAt) - +new Date(a.endsAt))
        break
    }
    return list
  }, [status, category, query, minBid, maxBid, sort])

  // Reset to page 1 when filters change
  useEffect(() => setPage(1), [status, category, query, minBid, maxBid, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))

  const categories = ['All', 'Watches', 'Collectibles', 'Sports', 'Art', 'Cars']

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Public Auctions</h1>

      {/* Filters bar */}
      <section className="sticky top-0 z-10 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 my-4">
        <div className="py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:gap-4">
            <div className="flex gap-2">
              {(['all', 'live', 'ending-soon', 'upcoming'] as const).map(
                (s) => (
                  <Button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-2 rounded-lg text-sm border transition ${status === s ? 'bg-black text-white border-black' : 'bg-white hover:bg-zinc-100'}`}
                    aria-pressed={status === s}
                  >
                    {s === 'all' ? 'All' : STATUS_LABEL[s]}
                  </Button>
                ),
              )}
            </div>

            <div className="flex items-center gap-2 md:ml-auto">
              <Input
                type="text"
                placeholder="Search lots…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-56 md:w-72 rounded-lg border px-3 py-2"
              />
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-[180px] rounded-lg border px-3 py-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
                <SelectTrigger className="w-[180px] rounded-lg border px-3 py-2">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Min bid"
                value={minBid}
                onChange={(e) =>
                  setMinBid(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-28 rounded-lg border px-3 py-2"
              />
              <span className="text-zinc-500">–</span>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Max bid"
                value={maxBid}
                onChange={(e) =>
                  setMaxBid(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="w-28 rounded-lg border px-3 py-2"
              />
              <Button
                onClick={() => {
                  setQuery('')
                  setStatus('all')
                  setCategory('All')
                  setMinBid('')
                  setMaxBid('')
                  setSort('endSoon')
                }}
                className="rounded-lg border px-3 py-2 hover:bg-zinc-50"
                title="Reset filters"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-4 gap-6">
        {dummyAuctions.map((lot) => {
          const left = useCountdown(lot.endsAt)
          const ended = left === 'Ended' || lot.status === 'ended'

          return (
            <div
              key={lot.id}
              className="group overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-lg transition"
            >
              <div className="relative">
                <img
                  src={lot.image}
                  alt={lot.title}
                  className="h-56 w-full object-cover transition group-hover:opacity-95"
                />
                <span
                  className={`absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-medium ${statusBadgeCls[lot.status]}`}
                >
                  {STATUS_LABEL[lot.status]}
                </span>
                {!ended && (
                  <span className="absolute right-3 top-3 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white">
                    {left}
                  </span>
                )}
              </div>

              <div className="p-4">
                <h2 className="line-clamp-2 text-lg font-semibold">
                  {lot.title}
                </h2>
                <div className="mt-2 text-sm text-zinc-600">Current Bid</div>
                <div className="text-xl font-bold">
                  {currencyFmt(lot.currentBid, lot.currency)}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1 rounded-lg bg-black px-3 py-2 text-white transition hover:bg-zinc-800">
                    View & Bid
                  </Button>
                  <Button
                    className="rounded-lg border px-3 py-2 transition hover:bg-zinc-50"
                    title="Add to watchlist"
                  >
                    ☆
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {filtered.length > pageSize && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-zinc-600">
            Page {page} of {totalPages}
          </span>
          <button
            className="rounded-lg border px-3 py-2 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/publicAuctions',
    component: PublicAuctionsPage,
    getParentRoute: () => parentRoute,
  })
