// /routes/features/sellers-dashboard/components/OrdersPanel.tsx

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { currencyFmt } from '../utils/currency'

import type { JSX } from 'react'
import type { OrderStatus, Payout, SellerOrder } from '../types'

export default function OrdersPanel(props: {
  orders: Array<SellerOrder>
  payouts: Array<Payout>
}): JSX.Element {
  const { orders, payouts } = props
  const last = payouts.find((p) => p.status === 'paid') ?? null
  const next = payouts.find((p) => p.status === 'scheduled') ?? null

  return (
    <Card className="rounded-2xl p-5">
      <h3 className="text-lg font-semibold">Orders to Fulfill</h3>
      <div className="mt-3 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{o.id}</div>
              <StatusPill status={o.status} />
            </div>
            <div className="mt-1 text-sm text-zinc-600">{o.lotTitle}</div>
            <div className="mt-1 text-sm">
              <span className="text-zinc-500">Buyer:</span> {o.buyer}
            </div>
            <div className="mt-1 font-semibold">{currencyFmt(o.amount)}</div>
            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm">
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={o.status !== 'processing'}
              >
                Mark Shipped
              </Button>
              <Button variant="outline" size="sm">
                Contact Buyer
              </Button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mt-6 text-lg font-semibold">Payouts</h3>
      <div className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Last payout</span>
          <span>{last ? currencyFmt(last.amount) : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span>Next scheduled</span>
          <span>{next ? currencyFmt(next.amount) : '—'}</span>
        </div>
        <div className="flex justify-between">
          <span>When</span>
          <span>
            {next ? new Date(next.scheduledFor).toLocaleString() : '—'}
          </span>
        </div>
      </div>
      <Button className="mt-4 w-full">View Payouts</Button>
    </Card>
  )
}

function StatusPill(props: { status: OrderStatus }): JSX.Element {
  const { status } = props
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
  return <Badge className={cls[status]}>{label[status]}</Badge>
}
