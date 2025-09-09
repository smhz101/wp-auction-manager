// /features/active-carts/components/CartsTable.tsx

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { rankItem } from '@tanstack/match-sorter-utils'

import { useEffect, useMemo, useState } from 'react'

import NoteDialog from './NoteDialog'

import type { JSX } from 'react'
import type { ColumnDef, FilterFn, Row, Table } from '@tanstack/react-table'
import type { Cart } from '../types'

import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

/** Custom fuzzy filter (TanStack doesn't export one) */
const fuzzyFilter: FilterFn<Cart> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(row.getValue(columnId), value)
  addMeta({ itemRank })
  return itemRank.passed
}

/** Augment filter function registry typing */
declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<Cart>
  }
}

interface CartsTableProps {
  rows: Array<Cart>
  total: number
  pageIndex: number
  pageSize: number
  onPageChange: (idx: number) => void
  onPageSizeChange: (size: number) => void
  onSelectionChange: (ids: Array<string>) => void
}

export default function CartsTable({
  rows,
  total,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
}: CartsTableProps): JSX.Element {
  const col = createColumnHelper<Cart>()
  const [note, setNote] = useState<{
    id: string
    open: boolean
    initial: string
  }>({
    id: '',
    open: false,
    initial: '',
  })

  /** Columns: properly typed (no `unknown as` cast) */
  const columns: Array<ColumnDef<Cart, any>> = useMemo(() => {
    return [
      {
        id: 'select',
        header: ({ table }: { table: Table<Cart> }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(Boolean(v))}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }: { row: Row<Cart> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        enableSorting: false,
        size: 24,
      },

      col.accessor('customer', {
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

      col.accessor('items', { header: 'Items', size: 60 }),

      col.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="tabular-nums">£{info.getValue().toFixed(2)}</span>
        ),
      }),

      col.accessor('status', {
        header: 'Status',
        cell: (info) => <Badge status={info.getValue()} />,
      }),

      col.accessor('updatedAt', {
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

      col.accessor('note', {
        header: 'Note',
        enableSorting: false,
        cell: (info) => {
          const v = info.getValue() ?? ''
          return (
            <div className="flex items-center gap-2">
              <span className="line-clamp-2 max-w-[320px] whitespace-pre-wrap">
                {v || <span className="text-zinc-400">—</span>}
              </span>
              <Button
                variant="ghost"
                onClick={() =>
                  setNote({ id: info.row.original.id, initial: v, open: true })
                }
              >
                Edit
              </Button>
            </div>
          )
        },
      }),
    ]
  }, []) // columns stable

  const table = useReactTable<Cart>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex, pageSize },
      sorting: [{ id: 'customer', desc: false }],
    },
    manualPagination: true,
    filterFns: { fuzzy: fuzzyFilter },
    /** keep pagination controlled to props */
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater
      if (next.pageIndex !== pageIndex) onPageChange(next.pageIndex)
      if (next.pageSize !== pageSize) onPageSizeChange(next.pageSize)
    },
  })

  /**
   * Push selection up (useEffect, not useMemo!), and only when
   * rowSelection actually changes to avoid render loops.
   */
  useEffect(() => {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id)
    onSelectionChange(ids)
    // depend on the internal rowSelection state object, which is stable when unchanged
  }, [onSelectionChange, table.getState().rowSelection, table])

  return (
    <>
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

            {rows.length === 0 && (
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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-600">
          Showing <span className="font-medium">{rows.length}</span> of{' '}
          <span className="font-medium">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => table.previousPage()}
            disabled={pageIndex === 0}
          >
            Prev
          </Button>
          <span className="text-sm flex flex-row gap-1">
            Page <span className="font-medium">{pageIndex + 1}</span>
          </span>
          <Button
            variant="ghost"
            onClick={() => table.nextPage()}
            disabled={(pageIndex + 1) * pageSize >= total}
          >
            Next
          </Button>
          <select
            className="rounded border border-zinc-200 bg-white px-2 py-1 text-sm"
            value={pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 30, 50].map((sz) => (
              <option key={sz} value={sz}>
                Show {sz}
              </option>
            ))}
          </select>
        </div>
      </div>

      <NoteDialog
        id={note.id}
        initial={note.initial}
        open={note.open}
        onOpenChange={(v) => setNote((s) => ({ ...s, open: v }))}
      />
    </>
  )
}

/** Tiny status badge */
function Badge(props: { status: Cart['status'] }): JSX.Element {
  const map: Record<Cart['status'], string> = {
    active: 'bg-emerald-100 text-emerald-700',
    abandoned: 'bg-zinc-100 text-zinc-700',
    recovering: 'bg-amber-100 text-amber-800',
  }
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${map[props.status]}`}
    >
      {props.status}
    </span>
  )
}
