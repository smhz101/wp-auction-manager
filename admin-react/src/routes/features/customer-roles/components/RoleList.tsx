import React from 'react'
import { Plus } from 'lucide-react'
import { useCR } from '../store'
import type { JSX } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

type Props = {
  selectedRoleId: string
  onSelect: (id: string) => void
  showCreateButton?: boolean
  onCreate?: () => void
}

export default function RoleList({
  selectedRoleId,
  onSelect,
  showCreateButton = true,
  onCreate,
}: Props): JSX.Element {
  const {
    state: { roles },
  } = useCR()
  const [q, setQ] = React.useState<string>('')

  const filtered = React.useMemo(() => {
    if (!q.trim()) return roles
    const t = q.toLowerCase()
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(t) ||
        r.slug.toLowerCase().includes(t) ||
        (r.description ?? '').toLowerCase().includes(t),
    )
  }, [roles, q])

  return (
    <div className="rounded-2xl border bg-white">
      <div className="border-b p-3 flex items-center gap-2">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search roles…"
          className="h-8"
        />
        {showCreateButton && onCreate && (
          <Button variant="outline" size="sm" onClick={onCreate}>
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-[70vh]">
        <div className="p-2 space-y-1">
          {filtered.map((role) => (
            <Button
              key={role.id}
              variant={selectedRoleId === role.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onSelect(role.id)}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex text-left">
                  <div className="font-medium">{role.name}</div>
                  <div className="text-xs text-zinc-500">/{role.slug}</div>
                  {role.isSystem && (
                    <div className="mt-1 text-[10px] inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-700">
                      System
                    </div>
                  )}
                </div>
                <Badge variant="secondary">{role.usersCount}</Badge>
              </div>
            </Button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-4 text-sm text-zinc-500">
              No roles match your search.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
