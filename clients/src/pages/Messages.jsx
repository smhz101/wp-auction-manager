import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const { messages_endpoint, nonce } = window.wpamData || {};
    if (!messages_endpoint) return;
    setLoading(true);
    setError('');
    axios
      .get(messages_endpoint, {
        headers: { 'X-WP-Nonce': nonce },
        params: {
          search: search || undefined,
          page,
          per_page: 10,
        },
      })
      .then((res) => {
        setMessages(res.data.data || []);
        setPageCount(Math.ceil(res.data.total / 10));
      })
      .catch(() => setError('Failed to load messages.'))
      .finally(() => setLoading(false));
  }, [search, page]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Messages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-end gap-2">
          <div className="w-40">
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => setPage(1)} variant="secondary">
            Apply
          </Button>
        </div>
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
                  <th className="px-2 py-1">User</th>
                  <th className="px-2 py-1">Message</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{msg.auction}</td>
                    <td className="px-2 py-1">{msg.user}</td>
                    <td className="px-2 py-1">{msg.message}</td>
                    <td className="px-2 py-1">{msg.status}</td>
                    <td className="px-2 py-1">{msg.date}</td>
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
