// /features/public-auctions/components/Pagination.tsx
import type { JSX } from 'react'
import { Button } from '@/components/ui/button'

export default function Pagination(props: {
  page: number
  pageSize: number
  total: number
  onPageChange: (p: number) => void
}): JSX.Element {
  const { page, pageSize, total, onPageChange } = props
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return <></>

  const prev = Math.max(1, page - 1)
  const next = Math.min(pages, page + 1)

  return (
    <div className="mt-4 flex items-center justify-center gap-2">
      <Button
        variant="outline"
        onClick={() => onPageChange(prev)}
        disabled={page === 1}
      >
        Prev
      </Button>
      <div className="text-sm text-zinc-600">
        Page {page} / {pages}
      </div>
      <Button
        variant="outline"
        onClick={() => onPageChange(next)}
        disabled={page === pages}
      >
        Next
      </Button>
    </div>
  )
}
