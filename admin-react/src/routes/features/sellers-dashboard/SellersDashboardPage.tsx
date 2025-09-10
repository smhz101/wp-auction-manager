// /routes/features/sellers-dashboard/SellersDashboardPage.tsx

import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks' // adjust path

import ActivityList from './components/ActivityList'
import AuctionsTable from './components/AuctionsTable'
import FiltersForm from './components/FiltersForm'
import KpiCard from './components/KpiCard'
import OrdersPanel from './components/OrdersPanel'
import SalesSparkline from './components/SalesSparkline'
import { fetchDashboard, pauseAuction } from './slice'
import { selectSellersData, selectSellersLoadState } from './selectors'
import { currencyFmt } from './utils/currency'

import type { JSX } from 'react'
import type { FiltersFormValues } from './schema'

export default function SellersDashboardPage(): JSX.Element {
  const dispatch = useAppDispatch()
  const data = useAppSelector(selectSellersData)
  const loadState = useAppSelector(selectSellersLoadState)

  const [filters, setFilters] = useState<FiltersFormValues>({
    q: '',
    status: 'all',
  })

  useEffect(() => {
    if (loadState === 'idle') void dispatch(fetchDashboard())
  }, [dispatch, loadState])

  const auctions = useMemo(() => {
    const src = data?.auctions ?? []
    const q = filters.q.trim().toLowerCase()
    const status = filters.status
    let list = src
    if (status !== 'all') list = list.filter((a) => a.status === status)
    if (q)
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
      )
    // live → scheduled → ended → unsold → paused, then by end time
    const rank = (s: (typeof src)[number]['status']): number =>
      s === 'live'
        ? 0
        : s === 'scheduled'
          ? 1
          : s === 'ended'
            ? 2
            : s === 'unsold'
              ? 3
              : 4
    return [...list].sort((a, b) => {
      const r = rank(a.status) - rank(b.status)
      return r !== 0 ? r : +new Date(a.endsAt) - +new Date(b.endsAt)
    })
  }, [data?.auctions, filters])

  const kpis = useMemo(() => {
    const live = (data?.auctions ?? []).filter(
      (a) => a.status === 'live',
    ).length
    const scheduled = (data?.auctions ?? []).filter(
      (a) => a.status === 'scheduled',
    ).length
    const ended = (data?.auctions ?? []).filter(
      (a) => a.status === 'ended',
    ).length
    const grossPendingPayout = (data?.orders ?? [])
      .filter((o) => o.status === 'paid' || o.status === 'processing')
      .reduce((s, o) => s + o.amount, 0)
    const watchers = (data?.auctions ?? []).reduce((s, a) => s + a.watchers, 0)
    const bidsToday = (data?.auctions ?? [])
      .filter((a) => a.status === 'live')
      .reduce((s, a) => s + a.bids, 0)
    return { live, scheduled, ended, grossPendingPayout, watchers, bidsToday }
  }, [data])

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Seller Dashboard</h1>

      <section>
        <div className="grid gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Live Auctions"
            value={String(kpis.live)}
            hint="Auctions currently accepting bids"
          />
          <KpiCard
            label="Scheduled"
            value={String(kpis.scheduled)}
            hint="Upcoming auctions"
          />
          <KpiCard
            label="Pending Payout"
            value={currencyFmt(kpis.grossPendingPayout)}
            hint="Paid/processing not disbursed"
          />
          <KpiCard
            label="Watchers"
            value={String(kpis.watchers)}
            hint="Total watchers across lots"
          />
        </div>
      </section>

      <section>
        <div className="grid gap-4 pb-2 lg:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Sales (last 14 days)</h3>
              <div className="text-sm text-zinc-600">
                Total{' '}
                {currencyFmt((data?.sales14d ?? []).reduce((s, n) => s + n, 0))}
              </div>
            </div>
            <div className="mt-3 text-zinc-500">
              Daily settled revenue snapshot
            </div>
            <div className="mt-4 text-zinc-900">
              <SalesSparkline data={data?.sales14d ?? []} />
            </div>
          </div>
          <OrdersPanel
            orders={data?.orders ?? []}
            payouts={data?.payouts ?? []}
          />
        </div>
      </section>

      <section className="pb-10">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="mb-3 flex items-end justify-between">
              <h3 className="text-lg font-semibold">Your Auctions</h3>
              <FiltersForm defaultValues={filters} onChange={setFilters} />
            </div>
            <AuctionsTable
              auctions={auctions}
              onPause={(lotId) => void dispatch(pauseAuction(lotId))}
            />
          </div>
          <ActivityList items={data?.activity ?? []} />
        </div>
      </section>
    </div>
  )
}
