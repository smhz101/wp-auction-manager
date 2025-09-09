// /features/active-carts/exportCsv.ts

import type { Cart } from './types'

export function exportCsv(rows: Array<Cart>): void {
  const header = [
    'id',
    'customer',
    'email',
    'items',
    'total',
    'status',
    'updatedAt',
    'note',
  ]
  const body = rows.map((r) =>
    [
      r.id,
      r.customer,
      r.email,
      r.items,
      r.total.toFixed(2),
      r.status,
      r.updatedAt,
      (r.note ?? '').replace(/\n/g, ' '),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const csv = [header.join(','), ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `active-carts-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
