// /routes/features/customer-roles/CustomerRolesPage.tsx
import React from 'react'
import { CustomerRolesProvider, useCR } from './storeAdapter'
import type { JSX } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

function RolesPane(): JSX.Element {
  const { state, actions } = useCR()
  const [filter, setFilter] = React.useState('')

  const roles = React.useMemo(
    () =>
      state.roles
        .slice()
        .sort((a, b) => (a.isSystem === b.isSystem ? 0 : a.isSystem ? -1 : 1))
        .filter((r) =>
          filter ? r.name.toLowerCase().includes(filter.toLowerCase()) : true,
        ),
    [state.roles, filter],
  )

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Roles</h3>
          <div className="flex gap-2">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search roles…"
            />
            <Button
              onClick={() =>
                actions.createRole({
                  name: 'New Role',
                  slug: `role_${Math.random().toString(36).slice(2, 8)}`,
                  description: '',
                  capabilities: [],
                })
              }
            >
              New Role
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {roles.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div className="space-y-0.5">
                <div className="font-medium">
                  {r.name} {r.isSystem && <Badge>System</Badge>}
                </div>
                <div className="text-xs text-zinc-500">
                  {r.slug} • {r.usersCount ?? 0} users
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => actions.duplicateRole(r.id)}
                >
                  Duplicate
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    actions.updateRole({
                      ...r,
                      description: (r.description ?? '') + ' (edited)',
                    })
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  disabled={!!r.isSystem}
                  onClick={() => actions.deleteRole(r.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {roles.length === 0 && (
            <div className="text-sm text-zinc-500 py-6 text-center">
              No roles.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function UsersPane(): JSX.Element {
  const { state, actions } = useCR()
  const [selRole, setSelRole] = React.useState<string>('')

  const users = React.useMemo(
    () => state.users.slice().sort((a, b) => a.name.localeCompare(b.name)),
    [state.users],
  )

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Users</h3>
          <div className="flex gap-2">
            <select
              className="rounded border px-2 py-1 text-sm"
              value={selRole}
              onChange={(e) => setSelRole(e.target.value)}
            >
              <option value="">— Assign role —</option>
              {state.roles.map((r) => (
                <option key={r.slug} value={r.slug}>
                  {r.name}
                </option>
              ))}
            </select>
            <Button
              onClick={() => {
                if (!selRole) return
                const ids = users.slice(0, 1).map((u) => u.id) // demo: assign to first user
                actions.assignRoleToUsers(selRole, ids)
              }}
              disabled={!selRole || users.length === 0}
            >
              Assign to first user
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded border p-3"
            >
              <div className="space-y-0.5">
                <div className="font-medium">
                  {u.name}{' '}
                  <span className="text-zinc-500 text-xs">({u.email})</span>
                </div>
                <div className="text-xs text-zinc-500">
                  Roles: {u.roles.join(', ') || '—'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    actions.updateUser({ ...u, name: u.name + ' *' })
                  }
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => actions.deleteUsers([u.id])}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="text-sm text-zinc-500 py-6 text-center">
              No users.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function CapsPane(): JSX.Element {
  const { state, actions } = useCR()
  const [key, setKey] = React.useState('')
  const [label, setLabel] = React.useState('')

  const caps = React.useMemo(
    () => state.capabilities.slice().sort((a, b) => a.key.localeCompare(b.key)),
    [state.capabilities],
  )

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold">Capabilities</h3>
          <div className="flex items-center gap-2">
            <Input
              placeholder="key"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <Input
              placeholder="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Button
              onClick={() => {
                if (!key || !label) return
                actions.upsertCapability({ key, label })
                setKey('')
                setLabel('')
              }}
            >
              Upsert
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {caps.map((c) => (
            <div
              key={c.key}
              className="flex items-center justify-between rounded border p-3"
            >
              <div>
                <div className="font-medium">{c.label}</div>
                <div className="text-xs text-zinc-500">{c.key}</div>
              </div>
              <Button
                variant="destructive"
                onClick={() => actions.deleteCapability(c.key)}
              >
                Delete
              </Button>
            </div>
          ))}
          {caps.length === 0 && (
            <div className="text-sm text-zinc-500 py-6 text-center">
              No capabilities.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function PageContent(): JSX.Element {
  const { state } = useCR()
  const busy = state.loadState === 'loading' || state.saveState === 'saving'

  return (
    <div className="p-6 space-y-6" aria-busy={busy}>
      <h1 className="text-2xl font-bold">Customer Roles</h1>

      {state.error && (
        <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {state.error}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <RolesPane />
        <UsersPane />
      </div>

      <CapsPane />
    </div>
  )
}

export default function CustomerRolesPage(): JSX.Element {
  return (
    <CustomerRolesProvider>
      <PageContent />
    </CustomerRolesProvider>
  )
}
