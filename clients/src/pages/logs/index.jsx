import { useEffect } from 'react'
import { useSubmenu } from '@/context/submenu-context'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

export default function Logs() {
  const { highlightSubmenu } = useSubmenu()

  useEffect(() => {
    highlightSubmenu('/logs')
  }, [highlightSubmenu])

  const logEntries = [
    { id: 1, action: 'Sample action', date: '2024-01-01' },
    { id: 2, action: 'Another action', date: '2024-01-02' },
  ]

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logEntries.map((log) => (
          <TableRow key={log.id}>
            <TableCell>{log.id}</TableCell>
            <TableCell>{log.action}</TableCell>
            <TableCell>{log.date}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
