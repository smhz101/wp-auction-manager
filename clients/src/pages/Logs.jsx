import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { logs_endpoint, nonce } = window.wpamData || {};
    if (!logs_endpoint) return;
    setLoading(true);
    setError('');
    axios
      .get(logs_endpoint, {
        headers: { 'X-WP-Nonce': nonce },
        params: { page, per_page: 10 },
      })
      .then((res) => {
        setLogs(res.data.data || []);
        setPageCount(Math.ceil(res.data.total / 10));
      })
      .catch(() => setError('Failed to load logs.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-destructive">{error}</p>
        ) : (
          <>
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b font-semibold text-left">
                  <th className="px-2 py-1">Auction</th>
                  <th className="px-2 py-1">Admin</th>
                  <th className="px-2 py-1">Action</th>
                  <th className="px-2 py-1">Details</th>
                  <th className="px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{log.auction}</td>
                    <td className="px-2 py-1">{log.admin}</td>
                    <td className="px-2 py-1">{log.action}</td>
                    <td className="px-2 py-1">{log.details}</td>
                    <td className="px-2 py-1">{log.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span>
                Page {page} of {pageCount || 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= pageCount}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
