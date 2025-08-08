import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useSubmenu } from '@/context/submenu-context';
import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import { Search } from '@/components/search';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';

export default function Bids() {
  const { highlightSubmenu } = useSubmenu();
  const [bids, setBids] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    highlightSubmenu('/bids');
  }, [highlightSubmenu]);

  useEffect(() => {
    const controller = new AbortController();

    api
      .get(window.wpamData.bids_endpoint, {
        params: { page },
        signal: controller.signal,
      })
      .then((res) => {
        const data = res.data;
        setBids(data.items || data || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [page]);

  return (
    <>
      <Header>
        <Search placeholder="Search bids" />
      </Header>
      <Main fixed>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Auction</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bids.map((bid) => (
              <TableRow key={bid.id}>
                <TableCell>{bid.id}</TableCell>
                <TableCell>{bid.auction_id || bid.auction}</TableCell>
                <TableCell>{bid.user_id || bid.user}</TableCell>
                <TableCell>{bid.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </Main>
    </>
  );
}