import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AllAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auctions_endpoint, nonce } = window.wpamData || {};
    if (!auctions_endpoint) return;

    axios
      .get(auctions_endpoint, {
        headers: { "X-WP-Nonce": nonce },
      })
      .then((res) => {
        setAuctions(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const columnHelper = createColumnHelper();
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", { header: "ID" }),
      columnHelper.accessor("title", { header: "Title" }),
      columnHelper.accessor("start", { header: "Start" }),
      columnHelper.accessor("end", { header: "End" }),
      columnHelper.accessor("state", { header: "State" }),
    ],
    []
  );

  const table = useReactTable({
    data: auctions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Auctions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b font-semibold text-left">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-2 py-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b last:border-b-0">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-2 py-1">
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
        )}
      </CardContent>
    </Card>
  );
}
