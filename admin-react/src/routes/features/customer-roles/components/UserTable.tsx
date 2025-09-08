// /features/customer-roles/components/UserTable.tsx
import { useMemo } from 'react'
import { useCR } from '../store'
import type { JSX } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type Props = {
  query: string
  roleFilter: string
  statusFilter: string
  sort: 'name' | 'createdDesc' | 'createdAsc'
  selectedIds: Set<string>
  onSelectedIdsChange: (s: Set<string>) => void
  onEdit: (id: string) => void
  onDelete: (ids: Array<string>) => void
}

export default function UserTable(props: Props): JSX.Element {
  const {
    state: { users, roles },
  } = useCR()
  const {
    query,
    roleFilter,
    statusFilter,
    sort,
    selectedIds,
    onSelectedIdsChange,
    onEdit,
    onDelete,
  } = props

  const filtered = useMemo(() => {
    let list = [...users]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
      )
    }
    if (roleFilter !== 'All')
      list = list.filter((u) => u.roles.includes(roleFilter))
    if (statusFilter !== 'All')
      list = list.filter((u) => u.status === statusFilter)
    switch (sort) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'createdAsc':
        list.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
        break
      case 'createdDesc':
        list.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        break
    }
    return list
  }, [users, query, roleFilter, statusFilter, sort])

  const allSelected =
    filtered.length > 0 && filtered.every((u) => selectedIds.has(u.id))

  function toggleAll(): void {
    const next = new Set<string>(selectedIds)
    if (allSelected) filtered.forEach((u) => next.delete(u.id))
    else filtered.forEach((u) => next.add(u.id))
    onSelectedIdsChange(next)
  }
  function toggleOne(id: string): void {
    const next = new Set<string>(selectedIds)
    next.has(id) ? next.delete(id) : next.add(id)
    onSelectedIdsChange(next)
  }

  return (
    <div className="rounded-2xl border bg-white overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="text-left text-zinc-600">
          <tr>
            <th className="px-3 py-2">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            </th>
            <th className="px-3 py-2">User</th>
            <th className="px-3 py-2">Email</th>
            <th className="px-3 py-2">Roles</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Created</th>
            <th className="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-3 py-2">
                <Checkbox
                  checked={selectedIds.has(u.id)}
                  onCheckedChange={() => toggleOne(u.id)}
                />
              </td>
              <td className="px-3 py-2 font-medium">{u.name}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {u.roles.map((rs) => (
                    <Badge key={rs} variant="secondary">
                      {roles.find((x) => x.slug === rs)?.name ?? rs}
                    </Badge>
                  ))}
                </div>
              </td>
              <td className="px-3 py-2">
                <Badge
                  variant={
                    u.status === 'active'
                      ? 'default'
                      : u.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                  }
                >
                  {u.status}
                </Badge>
              </td>
              <td className="px-3 py-2 text-zinc-500">
                {new Date(u.createdAt).toLocaleString()}
              </td>
              <td className="px-3 py-2">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(u.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete([u.id])}
                  >
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3 py-10 text-center text-zinc-500">
                No users match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
