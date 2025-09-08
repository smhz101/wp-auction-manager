import React, { createContext, useEffect, useMemo, useState } from 'react'
import { load, save } from './utils'
import { DEFAULT_CAPABILITIES, DEFAULT_ROLES, DEFAULT_USERS } from './seed'
import type { JSX } from 'react'
import type { Capability, Role, User } from './types'

type CRState = {
  capabilities: Array<Capability>
  roles: Array<Role>
  users: Array<User>
}

type CRActions = {
  // Users
  createUser: (u: Omit<User, 'id' | 'createdAt'>) => void
  updateUser: (u: User) => void
  deleteUsers: (ids: Array<string>) => void
  assignRoleToUsers: (roleSlug: string, ids: Array<string>) => void
  removeRoleFromUsers: (roleSlug: string, ids: Array<string>) => void
  // Roles
  createRole: (r: Omit<Role, 'id' | 'usersCount'>) => Role
  updateRole: (r: Role) => void
  deleteRole: (roleId: string) => void
  duplicateRole: (roleId: string) => Role | null
  bumpRoleCounts: (slugs: Array<string>, delta: number) => void
  // Capabilities
  upsertCapability: (c: Capability) => void
  deleteCapability: (key: string) => void
}

const CRContext = createContext<{ state: CRState; actions: CRActions } | null>(
  null,
)

export function CustomerRolesProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [capabilities, setCapabilities] = useState<Array<Capability>>(() =>
    load('wpam.capabilities', DEFAULT_CAPABILITIES),
  )
  const [roles, setRoles] = useState<Array<Role>>(() =>
    load('wpam.roles', DEFAULT_ROLES),
  )
  const [users, setUsers] = useState<Array<User>>(() =>
    load('wpam.users', DEFAULT_USERS),
  )

  useEffect(() => save('wpam.capabilities', capabilities), [capabilities])
  useEffect(() => save('wpam.roles', roles), [roles])
  useEffect(() => save('wpam.users', users), [users])

  const actions: CRActions = useMemo(
    () => ({
      // Users
      createUser: (u) => {
        const id =
          crypto.randomUUID?.() ??
          `usr-${Math.random().toString(36).slice(2, 9)}`
        const newUser: User = { ...u, id, createdAt: new Date().toISOString() }
        setUsers((prev) => [newUser, ...prev])
        if (u.roles.length) bumpRoleCountsInternal(u.roles, +1)
      },
      updateUser: (nu) => {
        const old = users.find((x) => x.id === nu.id)
        setUsers((prev) => prev.map((x) => (x.id === nu.id ? nu : x)))
        if (old) {
          const added = nu.roles.filter((r) => !old.roles.includes(r))
          const removed = old.roles.filter((r) => !nu.roles.includes(r))
          bumpRoleCountsInternal(added, +1)
          bumpRoleCountsInternal(removed, -1)
        }
      },
      deleteUsers: (ids) => {
        if (ids.length === 0) return
        const roleDelta: Record<string, number> = {}
        users.forEach((u) => {
          if (ids.includes(u.id))
            u.roles.forEach((r) => {
              roleDelta[r] = (roleDelta[r] || 0) - 1
            })
        })
        setUsers((prev) => prev.filter((u) => !ids.includes(u.id)))
        setRoles((prev) =>
          prev.map((r) => ({
            ...r,
            usersCount: Math.max(
              0,
              (r.usersCount || 0) + (roleDelta[r.slug] || 0),
            ),
          })),
        )
      },
      assignRoleToUsers: (roleSlug, ids) => {
        if (!roleSlug || ids.length === 0) return
        setUsers((prev) =>
          prev.map((u) =>
            ids.includes(u.id) && !u.roles.includes(roleSlug)
              ? { ...u, roles: [...u.roles, roleSlug] }
              : u,
          ),
        )
        bumpRoleCountsInternal([roleSlug], ids.length)
      },
      removeRoleFromUsers: (roleSlug, ids) => {
        if (!roleSlug || ids.length === 0) return
        setUsers((prev) =>
          prev.map((u) =>
            ids.includes(u.id) && u.roles.includes(roleSlug)
              ? { ...u, roles: u.roles.filter((r) => r !== roleSlug) }
              : u,
          ),
        )
        bumpRoleCountsInternal([roleSlug], -ids.length)
      },

      // Roles
      createRole: (r) => {
        const id =
          crypto.randomUUID?.() ??
          `role-${Math.random().toString(36).slice(2, 9)}`
        const newRole: Role = { ...r, id, usersCount: 0 }
        setRoles((prev) => [newRole, ...prev])
        return newRole
      },
      updateRole: (nr) =>
        setRoles((prev) => prev.map((r) => (r.id === nr.id ? nr : r))),
      deleteRole: (roleId) => {
        const role = roles.find((r) => r.id === roleId)
        if (!role || role.isSystem || role.usersCount > 0) return
        setRoles((prev) => prev.filter((r) => r.id !== roleId))
        const slug = role.slug
        setUsers((prev) =>
          prev.map((u) =>
            u.roles.includes(slug)
              ? { ...u, roles: u.roles.filter((s) => s !== slug) }
              : u,
          ),
        )
      },
      duplicateRole: (roleId) => {
        const src = roles.find((r) => r.id === roleId)
        if (!src) return null
        const id =
          crypto.randomUUID?.() ??
          `role-${Math.random().toString(36).slice(2, 9)}`
        const name = `${src.name} Copy`
        let slug = `${src.slug}-copy`
        const used = new Set(roles.map((r) => r.slug))
        let i = 2
        while (used.has(slug)) {
          slug = `${src.slug}-copy-${i++}`
        }
        const dup: Role = {
          ...src,
          id,
          name,
          slug,
          usersCount: 0,
          isSystem: false,
        }
        setRoles((prev) => [dup, ...prev])
        return dup
      },
      bumpRoleCounts: (slugs, delta) => bumpRoleCountsInternal(slugs, delta),

      // Capabilities
      upsertCapability: (c) =>
        setCapabilities((prev) => {
          const exists = prev.some((x) => x.key === c.key)
          return exists
            ? prev.map((x) => (x.key === c.key ? c : x))
            : [...prev, c]
        }),
      deleteCapability: (key) => {
        setCapabilities((prev) => prev.filter((c) => c.key !== key))
        setRoles((prev) =>
          prev.map((r) => ({
            ...r,
            capabilities: r.capabilities.filter((k) => k !== key),
          })),
        )
      },
    }),
    [users, roles, capabilities],
  )

  function bumpRoleCountsInternal(slugs: Array<string>, delta: number): void {
    if (!delta || slugs.length === 0) return
    setRoles((prev) =>
      prev.map((r) =>
        slugs.includes(r.slug)
          ? { ...r, usersCount: Math.max(0, (r.usersCount || 0) + delta) }
          : r,
      ),
    )
  }

  const value = { state: { capabilities, roles, users }, actions }
  return <CRContext.Provider value={value}>{children}</CRContext.Provider>
}

export function useCR(): { state: CRState; actions: CRActions } {
  const ctx = React.useContext(CRContext)
  if (!ctx) throw new Error('useCR must be used within CustomerRolesProvider')
  return ctx
}
