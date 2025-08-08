import { useEffect, useState } from 'react';
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

export default function Auctions() {
  const { highlightSubmenu } = useSubmenu();
  const [auctions, setAuctions] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    highlightSubmenu('/all-auctions');
  }, [highlightSubmenu]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/wp-json/wpam/v1/auctions?page=${page}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        setAuctions(data.items || data || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [page]);

  return (
    <>
      <Header>
        <Search placeholder="Search auctions" />
      </Header>
      <Main fixed>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auctions.map((auction) => (
              <TableRow key={auction.id}>
                <TableCell>{auction.id}</TableCell>
                <TableCell>{auction.title || auction.name}</TableCell>
                <TableCell>{auction.status}</TableCell>
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