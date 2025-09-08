import { Trash2, UserMinus, UserPlus } from 'lucide-react'
import { useCR } from '../store'
import type { JSX } from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function BulkRoleActions({
  selectedIds,
  onAssign,
  onRemove,
  onDelete,
}: {
  selectedIds: Set<string>
  onAssign: (slug: string) => void
  onRemove: (slug: string) => void
  onDelete: () => void
}): JSX.Element {
  const {
    state: { roles },
  } = useCR()

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <UserPlus className="mr-2 h-4 w-4" /> Assign role
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {roles.map((r) => (
            <DropdownMenuItem
              key={r.slug}
              onClick={() => onAssign(r.slug)}
              disabled={selectedIds.size === 0}
            >
              {r.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <UserMinus className="mr-2 h-4 w-4" /> Remove role
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {roles.map((r) => (
            <DropdownMenuItem
              key={r.slug}
              onClick={() => onRemove(r.slug)}
              disabled={selectedIds.size === 0}
            >
              {r.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="destructive"
        onClick={onDelete}
        disabled={selectedIds.size === 0}
      >
        <Trash2 className="mr-2 h-4 w-4" /> Delete users
      </Button>
    </>
  )
}
