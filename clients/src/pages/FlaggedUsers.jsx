import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FlaggedUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { flagged_endpoint, nonce } = window.wpamData || {};
    if (!flagged_endpoint) return;
    setLoading(true);
    setError('');
    axios
      .get(flagged_endpoint, {
        headers: { 'X-WP-Nonce': nonce },
        params: { page, per_page: 10 },
      })
      .then((res) => {
        setUsers(res.data.data || []);
        setPageCount(Math.ceil(res.data.total / 10));
      })
      .catch(() => setError('Failed to load flagged users.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flagged Users</CardTitle>
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
                  <th className="px-2 py-1">User</th>
                  <th className="px-2 py-1">Reason</th>
                  <th className="px-2 py-1">Flagged At</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{u.user}</td>
                    <td className="px-2 py-1">{u.reason}</td>
                    <td className="px-2 py-1">{u.flagged_at}</td>
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
