import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function AllAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  useEffect(() => {
    const { auctions_endpoint, nonce } = window.wpamData || {};
    if (!auctions_endpoint) return;

    setLoading(true);
    axios
      .get(auctions_endpoint, {
        headers: { 'X-WP-Nonce': nonce },
        params: {
          page: pagination.pageIndex + 1,
          per_page: pagination.pageSize,
          search: search || undefined,
          status: status || undefined,
          type: type || undefined,
        },
      })
      .then((res) => {
        setAuctions(res.data.data || []);
        setPageCount(Math.ceil(res.data.total / pagination.pageSize));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pagination.pageIndex, pagination.pageSize, search, status, type]);

  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor('id', { header: 'ID', enableSorting: true }),
      columnHelper.accessor('title', { header: 'Title', enableSorting: true }),
      columnHelper.accessor('start', { header: 'Start', enableSorting: true }),
      columnHelper.accessor('end', { header: 'End', enableSorting: true }),
      columnHelper.accessor('state', { header: 'State', enableSorting: true }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: auctions,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount,
  });

  return (
    <main>
      <Card className={'rounded-none shadow-none border-none'}>
        <CardHeader>
          <CardTitle>All Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='mb-4 flex flex-wrap items-end gap-2'>
            <div className='w-full sm:w-40'>
              <Input
                placeholder='Search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className='w-full sm:w-40'>
              <Select
                value={status}
                onChange={setStatus}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'active', label: 'Active' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'ended', label: 'Ended' },
                ]}
              />
            </div>
            <div className='w-full sm:w-40'>
              <Select
                value={type}
                onChange={setType}
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'standard', label: 'Standard' },
                  { value: 'sealed', label: 'Sealed' },
                  { value: 'reverse', label: 'Reverse' },
                ]}
              />
            </div>
            <Button
              onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
              variant='secondary'
            >
              Apply
            </Button>
          </div>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <table className='min-w-full text-sm'>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr
                      key={headerGroup.id}
                      className='border-b font-semibold text-left'
                    >
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className='cursor-pointer select-none px-2 py-1'
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getIsSorted() === 'asc' && ' \u25B2'}
                          {header.column.getIsSorted() === 'desc' && ' \u25BC'}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className='border-b last:border-b-0'>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className='px-2 py-1'>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='mt-4 flex items-center justify-between gap-2'>
                <Button
                  variant='outline'
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <span>
                  Page {table.getState().pagination.pageIndex + 1} of{' '}
                  {pageCount}
                </span>
                <Button
                  variant='outline'
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
