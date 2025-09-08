import * as React from 'react'
import { faker } from '@faker-js/faker'
import { rankItem } from '@tanstack/match-sorter-utils'
import { useForm } from '@tanstack/react-form'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { createRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'
import type { RootRoute } from '@tanstack/react-router'

/** Domain types */
type BidStatus = 'leading' | 'outbid' | 'won' | 'lost'
type BidRow = {
  id: string
  auction: string
  lot: string
  bidder: string
  email: string
  amount: number
  placedAt: string // ISO time
  status: BidStatus
  note: string
}

/** Small UI atoms (tailwind) */
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger'
  }
> = ({ className = '', variant = 'primary', ...props }) => {
  const styles: Record<string, string> = {
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent hover:bg-zinc-100',
    primary: 'bg-black text-white hover:bg-zinc-800',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${styles[variant]} ${className}`}
    />
  )
}

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    {...props}
    className={`w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 ${props.className ?? ''}`}
  />
)

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props,
) => (
  <select
    {...props}
    className={`w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 ${props.className ?? ''}`}
  />
)

const Badge: React.FC<{
  intent: 'default' | 'success' | 'warning'
  children: React.ReactNode
}> = ({ intent, children }) => {
  const map: Record<string, string> = {
    default: 'bg-zinc-100 text-zinc-700',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-800',
  }
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[intent]}`}
    >
      {children}
    </span>
  )
}

/** Fake server (stable per session) */
const useFakeServer = () => {
  const dataRef = React.useRef<Array<BidRow> | null>(null)
  if (!dataRef.current) {
    faker.seed(42)
    dataRef.current = Array.from({ length: 135 }).map(() => {
      const status = faker.helpers.arrayElement<BidStatus>([
        'leading',
        'outbid',
        'won',
        'lost',
      ])
      return {
        id: faker.string.uuid(),
        auction: `${faker.commerce.department()} ${faker.commerce.productName()}`,
        lot: `Lot #${faker.number.int({ min: 1, max: 999 })}`,
        bidder: faker.person.fullName(),
        email: faker.internet.email(),
        amount: Number(faker.commerce.price({ min: 10, max: 5000, dec: 2 })),
        placedAt: faker.date.recent({ days: 30 }).toISOString(),
        status,
        note: '',
      }
    })
  }

  return {
    list: async (params?: {
      q?: string
      status?: BidStatus | 'all'
      min?: number
      max?: number
      from?: string
      to?: string
    }): Promise<Array<BidRow>> => {
      await new Promise((r) => setTimeout(r, 200))
      const src = dataRef.current as Array<BidRow>
      const { q, status, min, max, from, to } = params ?? {}
      let rows = [...src]
      if (q && q.trim()) {
        const needle = q.toLowerCase()
        rows = rows.filter(
          (r) =>
            r.auction.toLowerCase().includes(needle) ||
            r.lot.toLowerCase().includes(needle) ||
            r.bidder.toLowerCase().includes(needle) ||
            r.email.toLowerCase().includes(needle),
        )
      }
      if (status && status !== 'all')
        rows = rows.filter((r) => r.status === status)
      if (typeof min === 'number') rows = rows.filter((r) => r.amount >= min)
      if (typeof max === 'number') rows = rows.filter((r) => r.amount <= max)
      if (from)
        rows = rows.filter((r) => new Date(r.placedAt) >= new Date(from))
      if (to) rows = rows.filter((r) => new Date(r.placedAt) <= new Date(to))
      return rows
    },
    updateNote: async (id: string, note: string) => {
      await new Promise((r) => setTimeout(r, 150))
      const src = dataRef.current as Array<BidRow>
      const i = src.findIndex((r) => r.id === id)
      if (i >= 0) src[i] = { ...src[i], note }
      return src[i]
    },
    bulkTagLost: async (ids: Array<string>) => {
      await new Promise((r) => setTimeout(r, 250))
      const src = dataRef.current as Array<BidRow>
      ids.forEach((id) => {
        const i = src.findIndex((r) => r.id === id)
        if (i >= 0) src[i] = { ...src[i], status: 'lost' }
      })
      return ids.length
    },
  }
}

/** Fuzzy filter for global search (react-table v8) */
const fuzzyFilter: FilterFn<unknown> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(
    String(row.getValue(columnId) ?? ''),
    String(value ?? ''),
  )
  addMeta({ itemRank })
  return itemRank.passed
}

/** Columns
 *  Fix: return `ColumnDef<BidRow, any>[]` to allow heterogeneous TValue per column.
 *  This avoids the `unknown` incompatibility when some columns are number/string/enum.
 */
const useColumns = () => {
  const helper = createColumnHelper<BidRow>()
  return React.useMemo<Array<ColumnDef<BidRow, any>>>(() => {
    return [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            aria-label="Select all"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            type="checkbox"
          />
        ),
        cell: ({ row }) => (
          <input
            aria-label="Select row"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            type="checkbox"
          />
        ),
        enableSorting: false,
        size: 24,
      },
      helper.accessor('auction', {
        header: 'Auction',
        cell: (info) => (
          <div className="max-w-[340px]">
            <div className="line-clamp-1 font-medium">{info.getValue()}</div>
            <div className="text-xs text-zinc-500">{info.row.original.lot}</div>
          </div>
        ),
      }),
      helper.accessor('bidder', {
        header: 'Bidder',
        cell: (info) => (
          <div>
            <div className="font-medium">{info.getValue()}</div>
            <div className="text-xs text-zinc-500">
              {info.row.original.email}
            </div>
          </div>
        ),
      }),
      helper.accessor('amount', {
        header: 'Amount',
        cell: (info) => (
          <span className="tabular-nums">${info.getValue().toFixed(2)}</span>
        ),
        sortingFn: 'alphanumeric',
        size: 90,
      }),
      helper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const s = info.getValue()
          const intent =
            s === 'leading' ? 'success' : s === 'outbid' ? 'warning' : 'default'
          return <Badge intent={intent}>{String(s)}</Badge>
        },
        size: 90,
      }),
      helper.accessor('placedAt', {
        header: 'Placed',
        cell: (info) => {
          const d = new Date(info.getValue())
          return (
            <div className="tabular-nums">
              {d.toLocaleDateString()}{' '}
              <span className="text-zinc-500">{d.toLocaleTimeString()}</span>
            </div>
          )
        },
        size: 140,
      }),
      helper.accessor('note', {
        header: 'Note',
        cell: (info) => (
          <NoteCell id={info.row.original.id} initial={info.getValue()} />
        ),
        enableSorting: false,
      }),
    ]
  }, [])
}

/** Note cell: inline edit using @tanstack/react-form */
const NoteCell: React.FC<{ id: string; initial: string }> = ({
  id,
  initial,
}) => {
  const server = useFakeServer()
  const qc = useQueryClient()
  const [editing, setEditing] = React.useState(false)

  const mutation = useMutation({
    mutationFn: (note: string) => server.updateNote(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bids'] })
      setEditing(false)
    },
  })

  const form = useForm({
    defaultValues: { note: initial },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value.note)
    },
  })

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="line-clamp-2 max-w-[360px] whitespace-pre-wrap">
          {initial || <span className="text-zinc-400">—</span>}
        </span>
        <Button variant="ghost" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>
    )
  }

  return (
    <form
      className="flex w-full max-w-[420px] items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="note"
        children={(field) => (
          <Input
            placeholder="Add a note…"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
          />
        )}
      />
      <Button disabled={mutation.isPending} type="submit">
        Save
      </Button>
      <Button onClick={() => setEditing(false)} type="button" variant="ghost">
        Cancel
      </Button>
    </form>
  )
}

/** CSV export helper */
function exportCsv(rows: Array<BidRow>) {
  const header: Array<string> = [
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

/** Main page */
function BidsManagerComponent() {
  const server = useFakeServer()

  // Filters
  const [q, setQ] = React.useState('')
  const [status, setStatus] = React.useState<BidStatus | 'all'>('all')
  const [min, setMin] = React.useState<string>('')
  const [max, setMax] = React.useState<string>('')
  const [from, setFrom] = React.useState<string>('')
  const [to, setTo] = React.useState<string>('')

  // Data
  const { data = [], isLoading } = useQuery({
    queryKey: ['bids', { q, status, min, max, from, to }],
    queryFn: () =>
      server.list({
        q,
        status,
        min: min ? Number(min) : undefined,
        max: max ? Number(max) : undefined,
        from,
        to,
      }),
    staleTime: 30_000,
  })

  // Table
  const columns = useColumns()
  const table = useReactTable<BidRow>({
    columns,
    data,
    filterFns: { fuzzy: fuzzyFilter } satisfies Record<
      'fuzzy',
      FilterFn<unknown>
    >,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: 'fuzzy',
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [{ id: 'placedAt', desc: true }],
    },
  })

  // Bulk action
  const qc = useQueryClient()
  const bulkLost = useMutation({
    mutationFn: (ids: Array<string>) => server.bulkTagLost(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bids'] })
      table.resetRowSelection()
    },
  })

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Bids Manager</h1>
          <p className="text-sm text-zinc-600">
            {isLoading ? 'Loading…' : `${data.length} bids`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => bulkLost.mutate(selectedIds)}
            disabled={selectedIds.length === 0 || bulkLost.isPending}
          >
            Mark as Lost
          </Button>
          <Button
            onClick={() =>
              exportCsv(table.getSelectedRowModel().rows.map((r) => r.original))
            }
            disabled={selectedIds.length === 0}
            variant="ghost"
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-6">
        <Input
          placeholder="Search auction, lot, bidder, email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as BidStatus | 'all')}
        >
          <option value="all">All statuses</option>
          <option value="leading">Leading</option>
          <option value="outbid">Outbid</option>
          <option value="won">Won</option>
          <option value="lost">Lost</option>
        </Select>
        <Input
          placeholder="Min $"
          type="number"
          value={min}
          onChange={(e) => setMin(e.target.value)}
        />
        <Input
          placeholder="Max $"
          type="number"
          value={max}
          onChange={(e) => setMax(e.target.value)}
        />
        <Input
          placeholder="From"
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          placeholder="To"
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded border border-zinc-200">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-zinc-50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-zinc-200">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="select-none px-3 py-2 text-left font-medium text-zinc-700"
                    colSpan={h.colSpan}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    <div className="inline-flex cursor-pointer items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{
                        asc: '▲',
                        desc: '▼',
                      }[h.column.getIsSorted() as string] ?? null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-100 hover:bg-zinc-50"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {!isLoading && table.getRowModel().rows.length === 0 && (
              <tr>
                <td
                  className="px-3 py-10 text-center text-zinc-500"
                  colSpan={columns.length}
                >
                  No bids match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">
          Selected: <span className="font-medium">{selectedIds.length}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            variant="ghost"
          >
            Prev
          </Button>
          <span className="text-sm">
            Page{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>{' '}
            of <span className="font-medium">{table.getPageCount()}</span>
          </span>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            variant="ghost"
          >
            Next
          </Button>
          <Select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 30, 50].map((sz) => (
              <option key={sz} value={sz}>
                Show {sz}
              </option>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}

/** Route factory */
export default (parentRoute: RootRoute) =>
  createRoute({
    component: BidsManagerComponent,
    getParentRoute: () => parentRoute,
    path: '/bidsManager',
  })
