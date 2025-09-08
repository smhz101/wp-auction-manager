import { Link } from '@tanstack/react-router'
import { useMemo } from 'react'

/** Badge helper: status -> tailwind classes */
const statusClass: Record<string, string> = {
  Live: 'bg-green-50 text-green-700 ring-green-600/20',
  Scheduled: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Ended: 'bg-gray-50 text-gray-700 ring-gray-600/20',
  Paused: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20',
}

/** KPI item type */
type Kpi = {
  label: string
  value: string
  delta: string
  positive?: boolean
  series?: Array<number> // sparkline data [0..100]
}

/** Recent auction row type */
type AuctionRow = {
  id: string
  title: string
  category: string
  status: keyof typeof statusClass
  highestBid: string
  bidders: number
}

/** Activity feed item */
type ActivityItem = {
  id: string
  time: string
  text: string
}

/** Inline SVG sparkline (0..100 range) */
function Sparkline({ data }: { data: Array<number> }) {
  if (!data.length) return null
  const w = 100
  const h = 32
  const step = w / (data.length - 1)
  const points = data
    .map((v, i) => `${i * step},${h - (v / 100) * h}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-24">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-indigo-500"
      />
    </svg>
  )
}

export default function App() {
  /** Mock KPIs (replace with real data) */
  const kpis: Array<Kpi> = useMemo(
    () => [
      {
        label: 'Total Auctions',
        value: '1,247',
        delta: '+8.2%',
        positive: true,
        series: [20, 35, 40, 38, 55, 62, 70, 68],
      },
      {
        label: 'Active Bids',
        value: '3,489',
        delta: '+2.1%',
        positive: true,
        series: [30, 28, 35, 33, 31, 36, 40, 44],
      },
      {
        label: 'Revenue (30d)',
        value: '$128,940',
        delta: '-1.4%',
        positive: false,
        series: [80, 76, 73, 75, 71, 69, 68, 70],
      },
      {
        label: 'Bid Conversion',
        value: '12.6%',
        delta: '+0.6%',
        positive: true,
        series: [10, 9, 10, 11, 12, 12, 13, 13],
      },
    ],
    [],
  )

  /** Mock table rows */
  const rows: Array<AuctionRow> = useMemo(
    () => [
      {
        id: 'A-1001',
        title: 'Vintage Rolex Submariner',
        category: 'Watches',
        status: 'Live',
        highestBid: '$12,400',
        bidders: 17,
      },
      {
        id: 'A-1002',
        title: 'MacBook Pro 16” M3 Max',
        category: 'Electronics',
        status: 'Scheduled',
        highestBid: '$—',
        bidders: 0,
      },
      {
        id: 'A-1003',
        title: 'Original Oil Painting',
        category: 'Art',
        status: 'Paused',
        highestBid: '$2,150',
        bidders: 6,
      },
      {
        id: 'A-1004',
        title: 'Gaming PC RTX 4090',
        category: 'Computers',
        status: 'Live',
        highestBid: '$3,320',
        bidders: 24,
      },
      {
        id: 'A-1005',
        title: 'Classic Porsche 911 (’84)',
        category: 'Vehicles',
        status: 'Ended',
        highestBid: '$86,000',
        bidders: 51,
      },
    ],
    [],
  )

  /** Mock activity */
  const activity: Array<ActivityItem> = useMemo(
    () => [
      {
        id: 'ev1',
        time: '2m ago',
        text: 'New bid $3,350 on “Gaming PC RTX 4090”.',
      },
      {
        id: 'ev2',
        time: '18m ago',
        text: 'Seller “RetroTime” started auction “Vintage Rolex Submariner”.',
      },
      {
        id: 'ev3',
        time: '1h ago',
        text: 'Auction “Classic Porsche 911 (’84)” ended successfully.',
      },
      {
        id: 'ev4',
        time: '3h ago',
        text: 'Customer role “Wholesale” updated permissions.',
      },
    ],
    [],
  )

  return (
    <main className="w-full p-3 sm:p-6">
      {/* Page heading */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="hidden sm:flex gap-2">
            {/* Quick shortcuts */}
            <Link
              to="/publicAuctions"
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              preload="intent"
            >
              {/* eye icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              View Public
            </Link>
            <Link
              to="/settings"
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              preload="intent"
            >
              {/* gear icon */}
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 2h4M4 7l3 3M20 7l-3 3M2 14h4M18 14h4M7 20l3-3M17 20l-3-3" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Settings
            </Link>
          </div>
        </div>
        <div className="mt-1 h-0.5 w-10 rounded bg-indigo-600/80" />
      </div>

      {/* KPI cards */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500">{k.label}</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {k.value}
                </p>
              </div>
              <span
                className={[
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1',
                  k.positive
                    ? 'bg-green-50 text-green-700 ring-green-600/20'
                    : 'bg-red-50 text-red-700 ring-red-600/20',
                ].join(' ')}
              >
                {k.delta}
              </span>
            </div>
            <div className="mt-3 text-gray-400">
              <Sparkline data={k.series ?? []} />
            </div>
          </div>
        ))}
      </section>

      {/* Content grid */}
      <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Revenue & Activity stacked */}
        <div className="space-y-6 lg:col-span-2">
          {/* Revenue card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Revenue (Last 30 Days)
              </h2>
              <div className="flex items-center gap-2">
                <button className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  7d
                </button>
                <button className="rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
                  14d
                </button>
                <button className="rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white">
                  30d
                </button>
              </div>
            </div>

            {/* Simple bars (no deps) */}
            <div className="mt-4 grid grid-cols-12 items-end gap-1">
              {[12, 28, 22, 36, 45, 40, 38, 60, 54, 62, 70, 66].map((v, i) => (
                <div
                  key={i}
                  className="rounded-t bg-indigo-500"
                  style={{ height: `${Math.max(8, v)}px` }}
                  title={`Day ${i + 1}: ${v}`}
                />
              ))}
            </div>

            {/* Legend / totals */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <p>
                Total:{' '}
                <span className="font-medium text-gray-900">$128,940</span>
              </p>
              <p>
                Avg/day:{' '}
                <span className="font-medium text-gray-900">$4,298</span>
              </p>
            </div>
          </div>

          {/* Activity feed */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Recent Activity
              </h2>
              <Link
                to="/bidsManager"
                preload="intent"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>
            <ul className="space-y-3">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <span className="mt-1 inline-block h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{a.text}</p>
                    <p className="text-xs text-gray-500">{a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Quick actions + Recent auctions */}
        <div className="space-y-6">
          {/* Quick actions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-gray-900">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/sellersDashboard"
                preload="intent"
                className="group inline-flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Invite Seller</span>
                <span className="rounded-full bg-gray-100 p-1 group-hover:bg-gray-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/publicAuctions"
                preload="intent"
                className="group inline-flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Create Auction</span>
                <span className="rounded-full bg-gray-100 p-1 group-hover:bg-gray-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/activeCarts"
                preload="intent"
                className="group inline-flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Active Carts</span>
                <span className="rounded-full bg-gray-100 p-1 group-hover:bg-gray-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h2l2 12h10l2-8H6" />
                  </svg>
                </span>
              </Link>
              <Link
                to="/settings"
                preload="intent"
                className="group inline-flex items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <span>Settings</span>
                <span className="rounded-full bg-gray-100 p-1 group-hover:bg-gray-200">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M10 2h4M4 7l3 3M20 7l-3 3M2 14h4M18 14h4M7 20l3-3M17 20l-3-3" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Recent auctions table */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Recent Auctions
              </h2>
              <Link
                to="/bidsManager"
                preload="intent"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Manage
              </Link>
            </div>
            <div className="-mx-5 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-3">Auction</th>
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Highest Bid</th>
                    <th className="px-5 py-3">Bidders</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {rows.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {r.title}
                          </span>
                          <span className="text-xs text-gray-500">{r.id}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-700">{r.category}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${statusClass[r.status]}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {r.highestBid}
                      </td>
                      <td className="px-5 py-3 text-gray-700">{r.bidders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
