import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AllAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { auctions_endpoint, nonce } = window.wpamData || {};
    if (!auctions_endpoint) return;

    fetch(auctions_endpoint, {
      headers: { 'X-WP-Nonce': nonce },
    })
      .then((res) => res.json())
      .then((res) => {
        setAuctions(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Auctions</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>
            <h1>Hello............</h1>
            <p>Loading...</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b font-semibold text-left">
                <th className="px-2 py-1">ID</th>
                <th className="px-2 py-1">Title</th>
                <th className="px-2 py-1">Start</th>
                <th className="px-2 py-1">End</th>
                <th className="px-2 py-1">State</th>
              </tr>
            </thead>
            <tbody>
              {auctions.map((a) => (
                <tr key={a.id} className="border-b last:border-b-0">
                  <td className="px-2 py-1">{a.id}</td>
                  <td className="px-2 py-1">{a.title}</td>
                  <td className="px-2 py-1">{a.start}</td>
                  <td className="px-2 py-1">{a.end}</td>
                  <td className="px-2 py-1">{a.state}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}
