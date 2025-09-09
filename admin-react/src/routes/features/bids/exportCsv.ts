// /features/bids/exportCsv.ts

import type { Bid } from './types'

export function exportCsv(rows: Array<Bid>): void {
  const header = [
    'id',
    'auction',
    'lot',
    'bidder',
    'email',
    'amount',
    'status',
    'placedAt',
    'note',
  ]
  const body = rows.map((r) =>
    [
      r.id,
      r.auction,
      r.lot,
      r.bidder,
      r.email,
      r.amount.toFixed(2),
      r.status,
      r.placedAt,
      r.note.replace(/\n/g, ' '),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const csv = [header.join(','), ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bids-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
