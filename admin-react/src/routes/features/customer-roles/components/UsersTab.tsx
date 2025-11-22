// /features/customer-roles/components/UsersTab.tsx
import React from 'react'
import { useCR } from '../storeAdapter'
import BulkRoleActions from './BulkRoleActions'
import UserTable from './UserTable'
import { CreateEditUserDialog, DeleteUsersAlert } from './UserDialogs'
import type { JSX } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

export default function UsersTab(): JSX.Element {
  const {
    state: { roles },
    actions,
  } = useCR()

  const [query, setQuery] = React.useState<string>('')
  const [roleFilter, setRoleFilter] = React.useState<string>('All')
  const [statusFilter, setStatusFilter] = React.useState<string>('All')
  const [sort, setSort] = React.useState<'name' | 'createdDesc' | 'createdAsc'>(
    'createdDesc',
  )

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())

  // Dialogs
  const [userOpen, setUserOpen] = React.useState<boolean>(false)
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = React.useState<boolean>(false)

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex flex-wrap gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email…"
              className="w-64"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All roles</SelectItem>
                {roles.map((r) => (
                  <SelectItem key={r.slug} value={r.slug}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(v) => setSort(v as typeof sort)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdDesc">Newest</SelectItem>
                <SelectItem value="createdAsc">Oldest</SelectItem>
                <SelectItem value="name">Name A–Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:ml-auto flex gap-2">
            <Button
              onClick={() => {
                setEditingId(null)
                setUserOpen(true)
              }}
            >
              New User
            </Button>
            <Button variant="outline" onClick={() => setSelectedIds(new Set())}>
              Clear selection
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <BulkRoleActions
            selectedIds={selectedIds}
            onAssign={(slug) =>
              actions.assignRoleToUsers(slug, Array.from(selectedIds))
            }
            onRemove={(slug) =>
              actions.removeRoleFromUsers(slug, Array.from(selectedIds))
            }
            onDelete={() => setDeleteOpen(true)}
          />
          <div className="ml-auto text-sm text-zinc-500">
            {selectedIds.size} selected
          </div>
        </div>
      </div>

      <UserTable
        query={query}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        sort={sort}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onEdit={(id) => {
          setEditingId(id)
          setUserOpen(true)
        }}
        onDelete={(ids) => {
          setSelectedIds(new Set(ids))
          setDeleteOpen(true)
        }}
      />

      <CreateEditUserDialog
        open={userOpen}
        onOpenChange={setUserOpen}
        userId={editingId}
      />
      <DeleteUsersAlert
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        ids={Array.from(selectedIds)}
        onDone={() => setSelectedIds(new Set())}
      />
    </div>
  )
}
