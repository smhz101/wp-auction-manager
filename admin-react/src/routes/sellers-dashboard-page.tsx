import { useEffect, useMemo, useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'

type AuctionStatus = 'live' | 'scheduled' | 'ended' | 'unsold' | 'paused'
type SellerAuction = {
  id: string
  title: string
  image: string
  currentBid: number
  watchers: number
  bids: number
  reserve: number | null
  endsAt: string // ISO
  status: AuctionStatus
}

type OrderStatus =
  | 'pending-payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'refunded'
type SellerOrder = {
  id: string
  lotId: string
  lotTitle: string
  buyer: string
  amount: number
  status: OrderStatus
  createdAt: string // ISO
}

type Payout = {
  id: string
  amount: number
  scheduledFor: string // ISO
  status: 'scheduled' | 'processing' | 'paid'
}

type Activity = { id: string; time: string; text: string }

// ---------------- Dummy Data ----------------
const AUCTIONS: Array<SellerAuction> = [
  {
    id: 'lot-201',
    title: 'Omega Speedmaster 3570.50',
    image: 'https://picsum.photos/seed/omega/800/500',
    currentBid: 4120,
    watchers: 62,
    bids: 14,
    reserve: 3800,
    endsAt: isoFromNow(2, 'h'),
    status: 'live',
  },
  {
    id: 'lot-202',
    title: 'Pakistani Truck Art Canvas (36")',
    image: 'https://picsum.photos/seed/truck/800/500',
    currentBid: 260,
    watchers: 19,
    bids: 7,
    reserve: 300,
    endsAt: isoFromNow(1, 'd'),
    status: 'live',
  },
  {
    id: 'lot-203',
    title: 'Signed Cricket Bat – Babar Azam',
    image: 'https://picsum.photos/seed/cricket/800/500',
    currentBid: 980,
    watchers: 44,
    bids: 11,
    reserve: 900,
    endsAt: isoFromNow(3, 'h'),
    status: 'live',
  },
  {
    id: 'lot-204',
    title: 'Vintage Leica M6 Body',
    image: 'https://picsum.photos/seed/leica/800/500',
    currentBid: 0,
    watchers: 12,
    bids: 0,
    reserve: 1800,
    endsAt: isoFromNow(3, 'd'),
    status: 'scheduled',
  },
  {
    id: 'lot-205',
    title: 'Calligraphy Artwork on Wasli',
    image: 'https://picsum.photos/seed/art/800/500',
    currentBid: 520,
    watchers: 21,
    bids: 5,
    reserve: null,
    endsAt: isoFromNow(-2, 'd'),
    status: 'ended',
  },
  {
    id: 'lot-206',
    title: 'Seiko SKX007 Diver',
    image: 'https://picsum.photos/seed/seiko/800/500',
    currentBid: 0,
    watchers: 9,
    bids: 0,
    reserve: 250,
    endsAt: isoFromNow(-1, 'd'),
    status: 'unsold',
  },
  {
    id: 'lot-207',
    title: 'Porsche 911 Diecast (1:18)',
    image: 'https://picsum.photos/seed/porsche/800/500',
    currentBid: 180,
    watchers: 33,
    bids: 6,
    reserve: 150,
    endsAt: isoFromNow(6, 'h'),
    status: 'live',
  },
  {
    id: 'lot-208',
    title: 'Orient Bambino Gen 2',
    image: 'https://picsum.photos/seed/orient/800/500',
    currentBid: 90,
    watchers: 8,
    bids: 2,
    reserve: null,
    endsAt: isoFromNow(5, 'd'),
    status: 'scheduled',
  },
  {
    id: 'lot-209',
    title: 'Handmade Persian Rug (4x6)',
    image: 'https://picsum.photos/seed/rug/800/500',
    currentBid: 760,
    watchers: 17,
    bids: 4,
    reserve: 700,
    endsAt: isoFromNow(-5, 'h'),
    status: 'ended',
  },
]

const ORDERS: Array<SellerOrder> = [
  {
    id: 'ORD-10021',
    lotId: 'lot-203',
    lotTitle: 'Signed Cricket Bat – Babar Azam',
    buyer: 'Ali R.',
    amount: 980,
    status: 'paid',
    createdAt: isoFromNow(-2, 'h'),
  },
  {
    id: 'ORD-10022',
    lotId: 'lot-207',
    lotTitle: 'Porsche 911 Diecast (1:18)',
    buyer: 'Sana K.',
    amount: 180,
    status: 'processing',
    createdAt: isoFromNow(-5, 'h'),
  },
  {
    id: 'ORD-10023',
    lotId: 'lot-201',
    lotTitle: 'Omega Speedmaster 3570.50',
    buyer: 'John D.',
    amount: 4120,
    status: 'pending-payment',
    createdAt: isoFromNow(-1, 'h'),
  },
]

const PAYOUTS: Array<Payout> = [
  {
    id: 'PO-3001',
    amount: 1800,
    scheduledFor: isoFromNow(2, 'd'),
    status: 'scheduled',
  },
  {
    id: 'PO-2997',
    amount: 950,
    scheduledFor: isoFromNow(-6, 'd'),
    status: 'paid',
  },
]

const SALES_14D = [
  120, 220, 180, 90, 160, 280, 340, 200, 260, 180, 310, 380, 240, 290,
]

const ACTIVITY: Array<Activity> = [
  {
    id: 'a1',
    time: isoFromNow(-14, 'm'),
    text: 'Bid placed: +$30 on "Omega Speedmaster 3570.50".',
  },
  {
    id: 'a2',
    time: isoFromNow(-1, 'h'),
    text: 'Order created #ORD-10023 (pending payment).',
  },
  {
    id: 'a3',
    time: isoFromNow(-3, 'h'),
    text: 'You received a message from buyer "Sana K.".',
  },
  {
    id: 'a4',
    time: isoFromNow(-1, 'd'),
    text:
      'Payout scheduled for $1,800 on ' +
      new Date(PAYOUTS[0].scheduledFor).toDateString() +
      '.',
  },
]

// ---------------- Utils ----------------
function isoFromNow(amount: number, unit: 'm' | 'h' | 'd') {
  const ms =
    unit === 'm'
      ? amount * 60_000
      : unit === 'h'
        ? amount * 3_600_000
        : amount * 86_400_000
  return new Date(Date.now() + ms).toISOString()
}

function currencyFmt(n: number, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(n)
  } catch {
    return `${currency} ${n.toLocaleString()}`
  }
}

function useCountdown(targetISO: string) {
  const [left, setLeft] = useState('—')
  useEffect(() => {
    const tick = () => {
      const diff = +new Date(targetISO) - Date.now()
      if (diff <= 0) return setLeft('Ended')
      const d = Math.floor(diff / 86_400_000)
      const h = Math.floor((diff % 86_400_000) / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setLeft(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`)
    }
    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [targetISO])
  return left
}

function Sparkline({
  data,
  w = 180,
  h = 48,
}: {
  data: Array<number>
  w?: number
  h?: number
}) {
  const min = Math.min(...data),
    max = Math.max(...data)
  const range = Math.max(1, max - min)
  const step = w / (data.length - 1)
  const d = data
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'} ${i * step} ${h - ((v - min) / range) * (h - 6) - 3}`,
    )
    .join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        className="text-zinc-400"
        strokeWidth={2}
      />
    </svg>
  )
}

// ---------------- Page ----------------
function SellersDashboardPage() {
  // Derived KPIs
  const kpis = useMemo(() => {
    const live = AUCTIONS.filter((a) => a.status === 'live')
    const scheduled = AUCTIONS.filter((a) => a.status === 'scheduled')
    const ended = AUCTIONS.filter((a) => a.status === 'ended')
    const grossPendingPayout = ORDERS.filter(
      (o) => o.status === 'paid' || o.status === 'processing',
    ).reduce((s, o) => s + o.amount, 0)
    const watchers = AUCTIONS.reduce((s, a) => s + a.watchers, 0)
    const bidsToday = AUCTIONS.filter((a) => a.status === 'live').reduce(
      (s, a) => s + a.bids,
      0,
    )
    return {
      liveCount: live.length,
      scheduledCount: scheduled.length,
      endedCount: ended.length,
      grossPendingPayout,
      watchers,
      bidsToday,
    }
  }, [])

  // Auctions table filters
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'all' | AuctionStatus>('all')

  const filteredAuctions = useMemo(() => {
    let list = [...AUCTIONS]
    if (status !== 'all') list = list.filter((a) => a.status === status)
    if (q.trim()) {
      const t = q.trim().toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(t) || a.id.toLowerCase().includes(t),
      )
    }
    // Sort: live first, then by end time
    list.sort((a, b) => {
      const sRank = (x: AuctionStatus) =>
        x === 'live'
          ? 0
          : x === 'scheduled'
            ? 1
            : x === 'ended'
              ? 2
              : x === 'unsold'
                ? 3
                : 4
      const r = sRank(a.status) - sRank(b.status)
      return r !== 0 ? r : +new Date(a.endsAt) - +new Date(b.endsAt)
    })
    return list
  }, [q, status])

  const nextPayout = PAYOUTS.find((p) => p.status === 'scheduled')

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>

      {/* KPIs */}
      <section>
        <div className="py-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Live Auctions"
            value={kpis.liveCount.toString()}
            hint="Auctions currently accepting bids"
          />
          <KpiCard
            label="Scheduled"
            value={kpis.scheduledCount.toString()}
            hint="Upcoming auctions"
          />
          <KpiCard
            label="Pending Payout"
            value={currencyFmt(kpis.grossPendingPayout)}
            hint="Paid/processing orders not yet disbursed"
          />
          <KpiCard
            label="Watchers"
            value={kpis.watchers.toString()}
            hint="Total watchers across lots"
          />
        </div>
      </section>

      {/* Sales sparkline + Account health + Payouts */}
      <section>
        <div className="pb-2 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sales (last 14 days)</h3>
              <div className="text-sm text-zinc-600">
                Total {currencyFmt(SALES_14D.reduce((s, n) => s + n, 0))}
              </div>
            </div>
            <div className="mt-3 text-zinc-500">
              Daily settled revenue snapshot
            </div>
            <div className="mt-4 text-zinc-900">
              <Sparkline data={SALES_14D} w={600} h={64} />
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-lg font-semibold">Payouts</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Last payout</span>
                <span>{currencyFmt(PAYOUTS[1].amount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Next scheduled</span>
                <span>{nextPayout ? currencyFmt(nextPayout.amount) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span>When</span>
                <span>
                  {nextPayout
                    ? new Date(nextPayout.scheduledFor).toLocaleString()
                    : '—'}
                </span>
              </div>
            </div>
            <button className="mt-4 w-full rounded-lg bg-black px-3 py-2 text-white hover:bg-zinc-800">
              View Payouts
            </button>
          </div>
        </div>
      </section>

      {/* Auctions + Orders + Activity */}
      <section className="pb-10">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 lg:col-span-2">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h3 className="text-lg font-semibold">Your Auctions</h3>
              <div className="flex gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="rounded-lg border px-3 py-2"
                >
                  <option value="all">All statuses</option>
                  <option value="live">Live</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="ended">Ended (sold)</option>
                  <option value="unsold">Unsold</option>
                  <option value="paused">Paused</option>
                </select>
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search lots…"
                  className="w-56 rounded-lg border px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-zinc-600">
                  <tr>
                    <th className="px-2 py-2">Lot</th>
                    <th className="px-2 py-2">Bids</th>
                    <th className="px-2 py-2">Current</th>
                    <th className="px-2 py-2">Reserve</th>
                    <th className="px-2 py-2">Ends</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuctions.map((a) => (
                    <AuctionRow key={a.id} a={a} />
                  ))}
                  {filteredAuctions.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-2 py-8 text-center text-zinc-500"
                      >
                        No auctions match your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <h3 className="text-lg font-semibold">Orders to Fulfill</h3>
            <div className="mt-3 space-y-3">
              {ORDERS.map((o) => (
                <div key={o.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{o.id}</div>
                    <StatusPill status={o.status} />
                  </div>
                  <div className="mt-1 text-sm text-zinc-600">{o.lotTitle}</div>
                  <div className="mt-1 text-sm">
                    <span className="text-zinc-500">Buyer:</span> {o.buyer}
                  </div>
                  <div className="mt-1 font-semibold">
                    {currencyFmt(o.amount)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">
                      View
                    </button>
                    <button
                      className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50"
                      disabled={o.status !== 'processing'}
                    >
                      Mark Shipped
                    </button>
                    <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-zinc-50">
                      Contact Buyer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="mt-6 text-lg font-semibold">Recent Activity</h3>
            <ul className="mt-3 space-y-2">
              {ACTIVITY.map((act) => (
                <li key={act.id} className="text-sm text-zinc-700">
                  <span className="text-zinc-500">
                    {new Date(act.time).toLocaleString()} —{' '}
                  </span>
                  {act.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

// ---------------- Subcomponents ----------------
function KpiCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm text-zinc-600">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  )
}

function StatusPill({ status }: { status: OrderStatus }) {
  const cls: Record<OrderStatus, string> = {
    'pending-payment': 'bg-amber-100 text-amber-700',
    paid: 'bg-emerald-100 text-emerald-700',
    processing: 'bg-sky-100 text-sky-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    refunded: 'bg-rose-100 text-rose-700',
  }
  const label: Record<OrderStatus, string> = {
    'pending-payment': 'Pending Payment',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Shipped',
    refunded: 'Refunded',
  }
  return (
    <span className={`rounded-md px-2 py-1 text-xs font-medium ${cls[status]}`}>
      {label[status]}
    </span>
  )
}

function AuctionRow({ a }: { a: SellerAuction }) {
  const left = useCountdown(a.endsAt)
  const statusPill = (() => {
    const base = 'rounded-md px-2 py-1 text-xs font-medium'
    switch (a.status) {
      case 'live':
        return (
          <span className={`${base} bg-emerald-100 text-emerald-700`}>
            Live
          </span>
        )
      case 'scheduled':
        return (
          <span className={`${base} bg-sky-100 text-sky-700`}>Scheduled</span>
        )
      case 'ended':
        return (
          <span className={`${base} bg-zinc-200 text-zinc-700`}>Ended</span>
        )
      case 'unsold':
        return (
          <span className={`${base} bg-rose-100 text-rose-700`}>Unsold</span>
        )
      case 'paused':
        return (
          <span className={`${base} bg-amber-100 text-amber-700`}>Paused</span>
        )
    }
  })()

  return (
    <tr className="border-t">
      <td className="px-2 py-3">
        <div className="flex items-center gap-3">
          <img
            src={a.image}
            alt=""
            className="h-12 w-16 rounded object-cover"
          />
          <div>
            <div className="font-medium">{a.title}</div>
            <div className="text-xs text-zinc-500">{a.id}</div>
          </div>
        </div>
      </td>
      <td className="px-2 py-3">{a.bids}</td>
      <td className="px-2 py-3 font-semibold">{currencyFmt(a.currentBid)}</td>
      <td className="px-2 py-3">
        {a.reserve === null ? '—' : currencyFmt(a.reserve)}
      </td>
      <td className="px-2 py-3 text-zinc-600">
        {a.status === 'live'
          ? left
          : a.status === 'scheduled'
            ? new Date(a.endsAt).toLocaleString()
            : '—'}
      </td>
      <td className="px-2 py-3">{statusPill}</td>
      <td className="px-2 py-3">
        <div className="flex gap-2">
          <button className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-zinc-50">
            View
          </button>
          <button
            className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-zinc-50"
            disabled={a.status !== 'live'}
          >
            Pause
          </button>
          <button className="rounded-lg border px-2.5 py-1.5 text-xs hover:bg-zinc-50">
            Edit
          </button>
        </div>
      </td>
    </tr>
  )
}

// ---------------- Route ----------------
export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/sellersDashboard',
    component: SellersDashboardPage,
    getParentRoute: () => parentRoute,
  })
