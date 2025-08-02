import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Bids() {
  const [bids, setBids] = useState([]);
  const [auctionId, setAuctionId] = useState(
    new URLSearchParams(window.location.search).get('auction_id') || ''
  );
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const { bids_endpoint, nonce } = window.wpamData || {};
    if (!bids_endpoint) return;
    setLoading(true);
    setError('');
    axios
      .get(bids_endpoint, {
        headers: { 'X-WP-Nonce': nonce },
        params: {
          auction_id: auctionId || undefined,
          page,
          per_page: 10,
        },
      })
      .then((res) => {
        setBids(res.data.data || []);
        setPageCount(Math.ceil(res.data.total / 10));
      })
      .catch(() => setError('Failed to load bids.'))
      .finally(() => setLoading(false));
  }, [auctionId, page]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bids</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-end gap-2">
          <div className="w-40">
            <Input
              placeholder="Auction ID"
              value={auctionId}
              onChange={(e) => setAuctionId(e.target.value)}
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
                  <th className="px-2 py-1">User</th>
                  <th className="px-2 py-1">Amount</th>
                  <th className="px-2 py-1">Bid Time</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((bid, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="px-2 py-1">{bid.user}</td>
                    <td className="px-2 py-1">{bid.amount}</td>
                    <td className="px-2 py-1">{bid.bid_time}</td>
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
