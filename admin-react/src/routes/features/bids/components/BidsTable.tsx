import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type Row,
  type Table,
} from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { fuzzy } from '@/lib/fuzzyFilter'

import NoteDialog from './NoteDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

import type { JSX } from 'react'
import type { Bid } from '../types'

type Props = {
  rows: Array<Bid>
  total: number
  pageIndex: number
  pageSize: number
  onPageChange: (idx: number) => void
  onPageSizeChange: (size: number) => void
  onSelectionChange: (ids: Array<string>) => void
}

export default function BidsTable({
  rows,
  total,
  pageIndex,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSelectionChange,
}: Props): JSX.Element {
  const col = createColumnHelper<Bid>()
  const [note, setNote] = useState<{
    id: string
    open: boolean
    initial: string
  }>({
    id: '',
    open: false,
    initial: '',
  })

  const columns: Array<ColumnDef<Bid, any>> = useMemo(() => {
    return [
      {
        id: 'select',
        header: ({ table }: { table: Table<Bid> }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(Boolean(v))}
            aria-label="Select all rows"
          />
        ),
        cell: ({ row }: { row: Row<Bid> }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(v) => row.toggleSelected(Boolean(v))}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        enableSorting: false,
        size: 24,
      },

      col.accessor('auction', {
        header: 'Auction',
        cell: (info) => (
          <div className="max-w-[340px]">
            <div className="line-clamp-1 font-medium">{info.getValue()}</div>
            <div className="text-xs text-zinc-500">{info.row.original.lot}</div>
          </div>
        ),
      }),

      col.accessor('bidder', {
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

      col.accessor('amount', {
        header: 'Amount',
        cell: (info) => (
          <span className="tabular-nums">£{info.getValue().toFixed(2)}</span>
        ),
        size: 90,
      }),

      col.accessor('status', {
        header: 'Status',
        cell: (info) => {
          const s = info.getValue()
          const cls =
            s === 'leading'
              ? 'bg-emerald-100 text-emerald-700'
              : s === 'outbid'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-zinc-100 text-zinc-700'
          return <Badge className={cls}>{String(s)}</Badge>
        },
        size: 90,
      }),

      col.accessor('placedAt', {
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

      col.accessor('note', {
        header: 'Note',
        enableSorting: false,
        cell: (info) => {
          const v = info.getValue()
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
  }, [])

  const table = useReactTable<Bid>({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageIndex, pageSize },
      sorting: [{ id: 'placedAt', desc: true }],
    },
    manualPagination: true,
    filterFns: { fuzzy },
    globalFilterFn: 'fuzzy',
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

  // Push selection up when rowSelection changes (avoid loops)
  useEffect(() => {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id)
    onSelectionChange(ids)
  }, [table.getState().rowSelection, table, onSelectionChange])

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
                      {{ asc: '▲', desc: '▼' }[
                        h.column.getIsSorted() as string
                      ] ?? null}
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
                  No bids match your filters.
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
