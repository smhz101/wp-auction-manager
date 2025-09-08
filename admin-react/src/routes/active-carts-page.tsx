import { useMemo, useRef, useState } from 'react'
import { faker } from '@faker-js/faker'

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import { rankItem } from '@tanstack/match-sorter-utils'

import { createRoute } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { RootRoute } from '@tanstack/react-router'
import type { ColumnDef, FilterFn } from '@tanstack/react-table'

// -----------------------------
// Types
// -----------------------------

type CartStatus = 'active' | 'abandoned' | 'recovering'
type CartRow = {
  id: string
  customer: string
  email: string
  items: number
  total: number
  updatedAt: string // ISO
  status: CartStatus
  note?: string
}

// -----------------------------
// Fake server (mock API)
// -----------------------------

/**
 * Returns a stable set of fake carts for the session.
 * Memoized to avoid new data on each render.
 */
const useFakeServer = () => {
  const seedRef = useRef<number>(Date.now())
  const dataRef = useRef<Array<CartRow> | null>(null)

  if (!dataRef.current) {
    faker.seed(seedRef.current)
    const statuses: Array<CartStatus> = ['active', 'abandoned', 'recovering']
    const rows: Array<CartRow> = Array.from({ length: 123 }).map(() => {
      const status = faker.helpers.arrayElement(statuses)
      return {
        id: faker.string.uuid(),
        customer: faker.person.fullName(),
        email: faker.internet.email(),
        items: faker.number.int({ min: 1, max: 12 }),
        total: Number(faker.commerce.price({ min: 10, max: 1800, dec: 2 })),
        updatedAt: faker.date.recent({ days: 20 }).toISOString(),
        status,
        note: faker.datatype.boolean() ? faker.lorem.sentence() : '',
      }
    })
    dataRef.current = rows
  }

  return {
    async list(params?: {
      q?: string
      status?: CartStatus | 'all'
      from?: string
      to?: string
    }): Promise<Array<CartRow>> {
      // Simulate network
      await new Promise((r) => setTimeout(r, 200))
      let rows = [...(dataRef.current as Array<CartRow>)]
      const { q, status, from, to } = params ?? {}

      // Text search across customer, email
      if (q?.trim()) {
        const needle = q.toLowerCase()
        rows = rows.filter(
          (r) =>
            r.customer.toLowerCase().includes(needle) ||
            r.email.toLowerCase().includes(needle),
        )
      }

      // Status filter
      if (status && status !== 'all') {
        rows = rows.filter((r) => r.status === status)
      }

      // Date range filter (updatedAt)
      if (from) {
        rows = rows.filter((r) => new Date(r.updatedAt) >= new Date(from))
      }
      if (to) {
        rows = rows.filter((r) => new Date(r.updatedAt) <= new Date(to))
      }

      return rows
    },

    async updateNote(id: string, note: string) {
      await new Promise((r) => setTimeout(r, 200))
      const rows = dataRef.current as Array<CartRow>
      const idx = rows.findIndex((r) => r.id === id)
      if (idx >= 0) {
        rows[idx] = { ...rows[idx], note }
      }
      return rows[idx]
    },

    async bulkStatus(ids: Array<string>, status: CartStatus) {
      await new Promise((r) => setTimeout(r, 250))
      const rows = dataRef.current as Array<CartRow>
      ids.forEach((id) => {
        const i = rows.findIndex((r) => r.id === id)
        if (i >= 0) rows[i] = { ...rows[i], status }
      })
      return ids.length
    },
  }
}

// -----------------------------
// UI helpers
// -----------------------------

const Badge: React.FC<{
  children: React.ReactNode
  intent?: 'default' | 'success' | 'warning'
}> = ({ children, intent = 'default' }) => {
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

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost' | 'danger'
  }
> = ({ className = '', variant = 'primary', ...props }) => {
  const map: Record<string, string> = {
    primary: 'bg-black text-white hover:bg-zinc-800',
    ghost: 'bg-transparent hover:bg-zinc-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${map[variant]} ${className}`}
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

// -----------------------------
// Page component
// -----------------------------

function ActiveCartsComponent() {
  const server = useFakeServer()
  const qc = useQueryClient()

  // Local filter state (kept out of React Table for simplicity)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<CartStatus | 'all'>('all')
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')

  // Fetch rows
  const { data = [], isLoading } = useQuery({
    queryKey: ['carts', { q, status, from, to }],
    queryFn: () => server.list({ q, status, from, to }),
    staleTime: 30_000,
  })

  // Table columns
  const columnHelper = createColumnHelper<CartRow>()
  const columns = useMemo<Array<ColumnDef<CartRow, any>>>(
    () => [
      // Selection
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => row.toggleSelected(e.target.checked)}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        enableSorting: false,
        size: 24,
      },

      columnHelper.accessor('customer', {
        header: 'Customer',
        cell: (info) => (
          <div>
            <div className="font-medium">{info.getValue()}</div>
            <div className="text-xs text-zinc-500">
              {info.row.original.email}
            </div>
          </div>
        ),
      }),

      columnHelper.accessor('items', {
        header: 'Items',
        size: 60,
      }),

      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="tabular-nums">${info.getValue().toFixed(2)}</span>
        ),
        sortingFn: 'alphanumeric',
      }),

      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const s = info.getValue() as CartStatus
          const intent =
            s === 'active'
              ? 'success'
              : s === 'recovering'
                ? 'warning'
                : 'default'
          return <Badge intent={intent}>{s}</Badge>
        },
      }),

      columnHelper.accessor('updatedAt', {
        header: 'Last Update',
        cell: (info) => {
          const d = new Date(info.getValue())
          return (
            <div className="tabular-nums">
              {d.toLocaleDateString()}{' '}
              <span className="text-zinc-500">{d.toLocaleTimeString()}</span>
            </div>
          )
        },
      }),

      columnHelper.accessor('note', {
        header: 'Note',
        cell: (info) => (
          <NoteCell id={info.row.original.id} initial={info.getValue() ?? ''} />
        ),
        enableSorting: false,
      }),
    ],
    [],
  )

  const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
    const itemRank = rankItem(row.getValue(columnId), value)
    addMeta({ itemRank })
    return itemRank.passed
  }

  // React Table
  const table = useReactTable<CartRow>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: { fuzzy: fuzzyFilter } satisfies Record<'fuzzy', FilterFn<any>>,
    globalFilterFn: 'fuzzy',
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
      sorting: [{ id: 'customer', desc: false }],
    },
  })

  // Bulk status mutation (mock)
  const bulkMutation = useMutation({
    mutationFn: (vars: { ids: Array<string>; status: CartStatus }) =>
      server.bulkStatus(vars.ids, vars.status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carts'] })
      table.resetRowSelection()
    },
  })

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Active Carts</h1>
          <p className="text-sm text-zinc-600">
            {isLoading ? 'Loading carts…' : `${data.length} carts`}
          </p>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          <Button
            disabled={selectedIds.length === 0 || bulkMutation.isPending}
            onClick={() =>
              bulkMutation.mutate({ ids: selectedIds, status: 'recovering' })
            }
          >
            Mark Recovering
          </Button>
          <Button
            variant="ghost"
            disabled={selectedIds.length === 0}
            onClick={() =>
              exportCsv(table.getSelectedRowModel().rows.map((r) => r.original))
            }
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <Input
          placeholder="Search name or email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="abandoned">Abandoned</option>
          <option value="recovering">Recovering</option>
        </Select>
        <Input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From"
        />
        <Input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="To"
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
                    colSpan={h.colSpan}
                    className="select-none px-3 py-2 text-left font-medium text-zinc-700"
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
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-zinc-500"
                >
                  No carts match your filters.
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
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <span className="text-sm flex flex-row gap-1">
            Page{' '}
            <span className="font-medium">
              {table.getState().pagination.pageIndex + 1}
            </span>{' '}
            of <span className="font-medium">{table.getPageCount()}</span>
          </span>
          <Button
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
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

// -----------------------------
// Cell with inline form (react-form)
// -----------------------------

const NoteCell: React.FC<{ id: string; initial: string }> = ({
  id,
  initial,
}) => {
  const server = useFakeServer()
  const qc = useQueryClient()
  const [editing, setEditing] = useState(false)

  const mutation = useMutation({
    mutationFn: (note: string) => server.updateNote(id, note),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['carts'] })
      setEditing(false)
    },
  })

  const form = useForm({
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    defaultValues: { note: initial ?? '' },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value.note)
    },
  })

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="line-clamp-2 max-w-[320px] whitespace-pre-wrap">
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
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex w-full max-w-[360px] items-center gap-2"
    >
      <form.Field
        name="note"
        children={(field) => (
          <Input
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            placeholder="Add a note…"
          />
        )}
      />
      <Button type="submit" disabled={mutation.isPending}>
        Save
      </Button>
      <Button variant="ghost" type="button" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </form>
  )
}

// -----------------------------
// CSV export helper
// -----------------------------

function exportCsv(rows: Array<CartRow>) {
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

// -----------------------------
// Route factory
// -----------------------------

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/activeCarts',
    getParentRoute: () => parentRoute,
    component: ActiveCartsComponent,
  })
