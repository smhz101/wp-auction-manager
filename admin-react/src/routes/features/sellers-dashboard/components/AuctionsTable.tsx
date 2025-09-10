// /routes/features/sellers-dashboard/components/AuctionsTable.tsx

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCountdown } from '../hooks/useCountdown'
import { currencyFmt } from '../utils/currency'

import type { JSX } from 'react'
import type { SellerAuction } from '../types'

export default function AuctionsTable(props: {
  auctions: Array<SellerAuction>
  onPause: (lotId: string) => void
}): JSX.Element {
  const { auctions, onPause } = props

  return (
    <Card className="rounded-2xl p-5">
      <div className="mt-2 overflow-x-auto">
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
            {auctions.map((a) => (
              <AuctionRow key={a.id} a={a} onPause={onPause} />
            ))}
            {auctions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-2 py-8 text-center text-zinc-500">
                  No auctions match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AuctionRow(props: {
  a: SellerAuction
  onPause: (lotId: string) => void
}): JSX.Element {
  const { a, onPause } = props
  const left = useCountdown(a.endsAt)

  const base = 'rounded-md px-2 py-1 text-xs font-medium'
  const pill =
    a.status === 'live'
      ? `${base} bg-emerald-100 text-emerald-700`
      : a.status === 'scheduled'
        ? `${base} bg-sky-100 text-sky-700`
        : a.status === 'ended'
          ? `${base} bg-zinc-200 text-zinc-700`
          : a.status === 'unsold'
            ? `${base} bg-rose-100 text-rose-700`
            : `${base} bg-amber-100 text-amber-700`

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
      <td className="px-2 py-3">
        <span className={pill}>
          {a.status === 'pending-payment' ? 'Pending Payment' : a.status}
        </span>
      </td>
      <td className="px-2 py-3">
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={a.status !== 'live'}
            onClick={() => onPause(a.id)}
          >
            Pause
          </Button>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </div>
      </td>
    </tr>
  )
}
