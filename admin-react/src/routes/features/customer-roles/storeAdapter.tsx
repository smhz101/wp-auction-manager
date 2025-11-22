// /routes/features/customer-roles/storeAdapter.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'
import { rolesApi, usersApi, capsApi } from './api'
import { CAPABILITIES, GROUPS, ROLES, USERS } from './seed'
import type { JSX } from 'react'
import type {
  BootRolesPayload,
  Capability,
  CapabilityGroup,
  LoadState,
  Role,
  SaveState,
  User,
} from './types'

type CRState = {
  roles: Role[]
  users: User[]
  capabilities: Capability[]
  groups: CapabilityGroup[]
  loadState: LoadState
  saveState: SaveState
  error: string
}

type CRActions = {
  // data bootstrap
  refreshAll: () => Promise<void>

  // roles
  createRole: (
    r: Omit<Role, 'id' | 'isSystem' | 'usersCount'>,
  ) => Promise<Role | null>
  updateRole: (r: Role) => Promise<void>
  deleteRole: (roleId: string) => Promise<void>
  duplicateRole: (roleId: string) => Promise<Role | null>

  // users
  assignRoleToUsers: (roleSlug: string, ids: string[]) => Promise<void>
  removeRoleFromUsers: (roleSlug: string, ids: string[]) => Promise<void>
  createUser: (u: Omit<User, 'id' | 'createdAt'>) => Promise<User | null>
  updateUser: (u: User) => Promise<void>
  deleteUsers: (ids: string[]) => Promise<void>

  // capabilities
  upsertCapability: (c: Capability) => Promise<void>
  deleteCapability: (key: string) => Promise<void>
}

const initialState: CRState = {
  roles: [],
  users: [],
  capabilities: [],
  groups: [],
  loadState: 'idle',
  saveState: 'idle',
  error: '',
}

type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; payload: BootRolesPayload }
  | { type: 'LOAD_ERROR'; error: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_END' }
  | { type: 'UPSERT_ROLE'; role: Role }
  | { type: 'DELETE_ROLE'; roleId: string }
  | { type: 'UPSERT_USER'; user: User }
  | { type: 'DELETE_USERS'; ids: string[] }
  | { type: 'UPSERT_CAP'; cap: Capability }
  | { type: 'DELETE_CAP'; key: string }

function reducer(state: CRState, act: Action): CRState {
  switch (act.type) {
    case 'LOAD_START':
      return { ...state, loadState: 'loading', error: '' }
    case 'LOAD_SUCCESS':
      return {
        ...state,
        loadState: 'success',
        roles: act.payload.roles || [],
        users: act.payload.users || [],
        capabilities: act.payload.capabilities || [],
        groups: act.payload.groups || [],
      }
    case 'LOAD_ERROR':
      return { ...state, loadState: 'error', error: act.error }
    case 'SAVE_START':
      return { ...state, saveState: 'saving' }
    case 'SAVE_END':
      return { ...state, saveState: 'idle' }
    case 'UPSERT_ROLE': {
      const i = state.roles.findIndex((r) => r.id === act.role.id)
      const roles =
        i >= 0
          ? state.roles.map((r) => (r.id === act.role.id ? act.role : r))
          : [act.role, ...state.roles]
      return { ...state, roles }
    }
    case 'DELETE_ROLE': {
      const roles = state.roles.filter((r) => r.id !== act.roleId)
      // strip removed role from users
      const roleSlug = state.roles.find((r) => r.id === act.roleId)?.slug
      const users = roleSlug
        ? state.users.map((u) => ({
            ...u,
            roles: u.roles.filter((s) => s !== roleSlug),
          }))
        : state.users
      return { ...state, roles, users }
    }
    case 'UPSERT_USER': {
      const i = state.users.findIndex((u) => u.id === act.user.id)
      const users =
        i >= 0
          ? state.users.map((u) => (u.id === act.user.id ? act.user : u))
          : [act.user, ...state.users]
      return { ...state, users }
    }
    case 'DELETE_USERS': {
      const users = state.users.filter((u) => !act.ids.includes(u.id))
      // recalc usersCount per role
      const counts: Record<string, number> = {}
      users.forEach((u) =>
        u.roles.forEach((s) => (counts[s] = (counts[s] || 0) + 1)),
      )
      const roles = state.roles.map((r) => ({
        ...r,
        usersCount: counts[r.slug] || 0,
      }))
      return { ...state, users, roles }
    }
    case 'UPSERT_CAP': {
      const i = state.capabilities.findIndex((c) => c.key === act.cap.key)
      const capabilities =
        i >= 0
          ? state.capabilities.map((c) => (c.key === act.cap.key ? act.cap : c))
          : [act.cap, ...state.capabilities]
      return { ...state, capabilities }
    }
    case 'DELETE_CAP': {
      const capabilities = state.capabilities.filter((c) => c.key !== act.key)
      const roles = state.roles.map((r) => ({
        ...r,
        capabilities: r.capabilities.filter((k) => k !== act.key),
      }))
      return { ...state, capabilities, roles }
    }
    default:
      return state
  }
}

const CRContext = createContext<{ state: CRState; actions: CRActions } | null>(
  null,
)

export function CustomerRolesProvider({
  children,
}: {
  children: React.ReactNode
}): JSX.Element {
  const [state, dispatch] = useReducer(reducer, initialState)

  const actions: CRActions = useMemo(
    () => ({
      // -------- bootstrap
      async refreshAll() {
        dispatch({ type: 'LOAD_START' })
        try {
          const payload = await rolesApi.fetchAll()
          dispatch({ type: 'LOAD_SUCCESS', payload })
        } catch (e: any) {
          // Fallback: show seeded data so UI is usable offline
          dispatch({
            type: 'LOAD_SUCCESS',
            payload: {
              roles: ROLES,
              users: USERS,
              capabilities: CAPABILITIES,
              groups: GROUPS,
            },
          })
          dispatch({
            type: 'LOAD_ERROR',
            error: e?.message || 'Failed to load roles data',
          })
        }
      },

      // -------- roles
      async createRole(r) {
        dispatch({ type: 'SAVE_START' })
        try {
          const created = await rolesApi.createRole(r)
          dispatch({ type: 'UPSERT_ROLE', role: created })
          return created
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
      async updateRole(r) {
        dispatch({ type: 'SAVE_START' })
        try {
          const next = await rolesApi.updateRole(r.id, r)
          dispatch({ type: 'UPSERT_ROLE', role: next })
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
      async deleteRole(roleId) {
        dispatch({ type: 'SAVE_START' })
        try {
          await rolesApi.deleteRole(roleId)
          dispatch({ type: 'DELETE_ROLE', roleId })
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
      async duplicateRole(roleId) {
        dispatch({ type: 'SAVE_START' })
        try {
          const dup = await rolesApi.duplicateRole(roleId)
          dispatch({ type: 'UPSERT_ROLE', role: dup })
          return dup
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },

      // -------- users
      async assignRoleToUsers(roleSlug, ids) {
        dispatch({ type: 'SAVE_START' })
        try {
          await usersApi.assignRole(roleSlug, ids)
          // update local users + counts
          ids.forEach((id) => {
            const u = state.users.find((x) => x.id === id)
            if (u && !u.roles.includes(roleSlug)) {
              dispatch({
                type: 'UPSERT_USER',
                user: { ...u, roles: [...u.roles, roleSlug] },
              })
            }
          })
          // recalc counts
          const counts: Record<string, number> = {}
          state.users.forEach((u) =>
            u.roles.forEach((s) => (counts[s] = (counts[s] || 0) + 1)),
          )
          state.roles.forEach((r) => (r.usersCount = counts[r.slug] || 0))
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
      async removeRoleFromUsers(roleSlug, ids) {
        dispatch({ type: 'SAVE_START' })
        try {
          await usersApi.removeRole(roleSlug, ids)
          ids.forEach((id) => {
            const u = state.users.find((x) => x.id === id)
            if (u && u.roles.includes(roleSlug)) {
              dispatch({
                type: 'UPSERT_USER',
                user: { ...u, roles: u.roles.filter((s) => s !== roleSlug) },
              })
            }
          })
          const counts: Record<string, number> = {}
          state.users.forEach((u) =>
            u.roles.forEach((s) => (counts[s] = (counts[s] || 0) + 1)),
          )
          state.roles.forEach((r) => (r.usersCount = counts[r.slug] || 0))
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
      async createUser(u) {
        dispatch({ type: 'SAVE_START' })
        try {
          const created = await usersApi.createUser(u)
          dispatch({ type: 'UPSERT_USER', user: created })
          return created
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
      async updateUser(u) {
        dispatch({ type: 'SAVE_START' })
        try {
          const next = await usersApi.updateUser(u)
          dispatch({ type: 'UPSERT_USER', user: next })
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
      async deleteUsers(ids) {
        dispatch({ type: 'SAVE_START' })
        try {
          await usersApi.deleteUsers(ids)
          dispatch({ type: 'DELETE_USERS', ids })
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },

      // -------- capabilities
      async upsertCapability(c) {
        dispatch({ type: 'SAVE_START' })
        try {
          const saved = await capsApi.upsertCapability(c)
          dispatch({ type: 'UPSERT_CAP', cap: saved })
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
      async deleteCapability(key) {
        dispatch({ type: 'SAVE_START' })
        try {
          await capsApi.deleteCapability(key)
          dispatch({ type: 'DELETE_CAP', key })
        } finally {
          dispatch({ type: 'SAVE_END' })
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.users, state.roles, state.capabilities],
  )

  useEffect(() => {
    // auto bootstrap on mount
    actions.refreshAll().catch(() => void 0)
  }, []) // eslint-disable-line

  const value = useMemo(() => ({ state, actions }), [state, actions])
  return <CRContext.Provider value={value}>{children}</CRContext.Provider>
}

export function useCR(): { state: CRState; actions: CRActions } {
  const ctx = useContext(CRContext)
  if (!ctx) throw new Error('useCR must be used within CustomerRolesProvider')
  return ctx
}
