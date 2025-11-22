import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as api from './api'

import type { PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { Capability, LoadState, Role, SaveState, User } from './types'

export type CRState = {
  roles: Array<Role>
  users: Array<User>
  capabilities: Array<Capability>
  usersTotal: number
  loadState: LoadState
  saveState: SaveState
  error: string
  // UI selections
  selectedUserIds: Array<string>
  selectedRoleIds: Array<string>
}

const initialState: CRState = {
  roles: [],
  users: [],
  capabilities: [],
  usersTotal: 0,
  loadState: 'idle',
  saveState: 'idle',
  error: '',
  selectedUserIds: [],
  selectedRoleIds: [],
}

// -------- Thunks
export const fetchAll = createAsyncThunk('cr/fetchAll', async () => {
  const [roles, caps, usersRes] = await Promise.all([
    api.getRoles(),
    api.getCapabilities(),
    api.getUsers({ page: 1, per_page: 100 }), // adjust paging as needed
  ])
  return {
    roles,
    capabilities: caps,
    users: usersRes.rows,
    total: usersRes.total,
  }
})

export const createRoleThunk = createAsyncThunk(
  'cr/createRole',
  async (payload: Omit<Role, 'id' | 'usersCount'>) => api.createRole(payload),
)

export const updateRoleThunk = createAsyncThunk(
  'cr/updateRole',
  async ({ id, patch }: { id: string; patch: Partial<Role> }) =>
    api.updateRole(id, patch),
)

export const deleteRoleThunk = createAsyncThunk(
  'cr/deleteRole',
  async (id: string) => {
    await api.deleteRole(id)
    return id
  },
)

export const duplicateRoleThunk = createAsyncThunk(
  'cr/duplicateRole',
  async (id: string) => api.duplicateRole(id),
)

export const createUserThunk = createAsyncThunk(
  'cr/createUser',
  async (payload: Omit<User, 'id' | 'createdAt'>) => api.createUser(payload),
)

export const updateUserThunk = createAsyncThunk(
  'cr/updateUser',
  async ({ id, patch }: { id: string; patch: Partial<User> }) =>
    api.updateUser(id, patch),
)

export const deleteUsersThunk = createAsyncThunk(
  'cr/deleteUsers',
  async (ids: Array<string>) => {
    await api.bulkDeleteUsers(ids)
    return ids
  },
)

export const assignRoleThunk = createAsyncThunk(
  'cr/assignRole',
  async ({ roleSlug, ids }: { roleSlug: string; ids: Array<string> }) => {
    await api.assignRoleToUsers(roleSlug, ids)
    return { roleSlug, ids }
  },
)

export const removeRoleThunk = createAsyncThunk(
  'cr/removeRole',
  async ({ roleSlug, ids }: { roleSlug: string; ids: Array<string> }) => {
    await api.removeRoleFromUsers(roleSlug, ids)
    return { roleSlug, ids }
  },
)

export const upsertCapabilityThunk = createAsyncThunk(
  'cr/upsertCapability',
  async (cap: Capability) => api.upsertCapability(cap),
)

export const deleteCapabilityThunk = createAsyncThunk(
  'cr/deleteCapability',
  async (key: string) => {
    await api.deleteCapability(key)
    return key
  },
)

// -------- Slice
const slice = createSlice({
  name: 'cr',
  initialState,
  reducers: {
    setSelectedUsers(state, action: PayloadAction<Array<string>>) {
      state.selectedUserIds = action.payload
    },
    setSelectedRoles(state, action: PayloadAction<Array<string>>) {
      state.selectedRoleIds = action.payload
    },
    // Optional: local bump (used by old UI in a few places)
    bumpRoleCounts(
      state,
      action: PayloadAction<{ slugs: Array<string>; delta: number }>,
    ) {
      const { slugs, delta } = action.payload
      if (!delta || slugs.length === 0) return
      state.roles = state.roles.map((r) =>
        slugs.includes(r.slug)
          ? { ...r, usersCount: Math.max(0, (r.usersCount || 0) + delta) }
          : r,
      )
    },
  },
  extraReducers: (b) => {
    // fetch
    b.addCase(fetchAll.pending, (s) => {
      s.loadState = 'loading'
      s.error = ''
    })
    b.addCase(fetchAll.fulfilled, (s, a) => {
      s.loadState = 'success'
      s.roles = a.payload.roles
      s.capabilities = a.payload.capabilities
      s.users = a.payload.users
      s.usersTotal = a.payload.total
    })
    b.addCase(fetchAll.rejected, (s, a) => {
      s.loadState = 'error'
      s.error = a.error.message || 'Failed to load'
    })

    // role CRUD
    b.addCase(createRoleThunk.pending, (s) => {
      s.saveState = 'saving'
    })
    b.addCase(createRoleThunk.fulfilled, (s, a) => {
      s.saveState = 'success'
      s.roles = [a.payload, ...s.roles]
    })
    b.addCase(createRoleThunk.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to create role'
    })

    b.addCase(updateRoleThunk.pending, (s) => {
      s.saveState = 'saving'
    })
    b.addCase(updateRoleThunk.fulfilled, (s, a) => {
      s.saveState = 'success'
      const i = s.roles.findIndex((r) => r.id === a.payload.id)
      if (i >= 0) s.roles[i] = a.payload
    })
    b.addCase(updateRoleThunk.rejected, (s, a) => {
      s.saveState = 'error'
      s.error = a.error.message || 'Failed to update role'
    })

    b.addCase(deleteRoleThunk.fulfilled, (s, a) => {
      s.roles = s.roles.filter((r) => r.id !== a.payload)
    })

    b.addCase(duplicateRoleThunk.fulfilled, (s, a) => {
      s.roles = [a.payload, ...s.roles]
    })

    // user ops
    b.addCase(createUserThunk.fulfilled, (s, a) => {
      s.users = [a.payload, ...s.users]
      if (a.payload.roles.length) {
        s.roles = s.roles.map((r) =>
          a.payload.roles.includes(r.slug)
            ? { ...r, usersCount: (r.usersCount || 0) + 1 }
            : r,
        )
      }
    })

    b.addCase(updateUserThunk.fulfilled, (s, a) => {
      const old = s.users.find((u) => u.id === a.payload.id)
      s.users = s.users.map((u) => (u.id === a.payload.id ? a.payload : u))
      if (old) {
        const added = a.payload.roles.filter((r) => !old.roles.includes(r))
        const removed = old.roles.filter((r) => !a.payload.roles.includes(r))
        if (added.length || removed.length) {
          s.roles = s.roles.map((r) =>
            added.includes(r.slug)
              ? { ...r, usersCount: (r.usersCount || 0) + 1 }
              : removed.includes(r.slug)
                ? { ...r, usersCount: Math.max(0, (r.usersCount || 0) - 1) }
                : r,
          )
        }
      }
    })

    b.addCase(deleteUsersThunk.fulfilled, (s, a) => {
      const ids = new Set(a.payload)
      // recompute role counts for removed users
      const removed = s.users.filter((u) => ids.has(u.id))
      const delta: Record<string, number> = {}
      removed.forEach((u) =>
        u.roles.forEach((slug) => (delta[slug] = (delta[slug] || 0) - 1)),
      )
      s.users = s.users.filter((u) => !ids.has(u.id))
      s.roles = s.roles.map((r) => ({
        ...r,
        usersCount: Math.max(0, (r.usersCount || 0) + (delta[r.slug] || 0)),
      }))
      s.selectedUserIds = []
    })

    b.addCase(assignRoleThunk.fulfilled, (s, a) => {
      const { roleSlug, ids } = a.payload
      const set = new Set(ids)
      s.users = s.users.map((u) =>
        set.has(u.id) && !u.roles.includes(roleSlug)
          ? { ...u, roles: [...u.roles, roleSlug] }
          : u,
      )
      s.roles = s.roles.map((r) =>
        r.slug === roleSlug
          ? { ...r, usersCount: (r.usersCount || 0) + ids.length }
          : r,
      )
    })

    b.addCase(removeRoleThunk.fulfilled, (s, a) => {
      const { roleSlug, ids } = a.payload
      const set = new Set(ids)
      s.users = s.users.map((u) =>
        set.has(u.id) && u.roles.includes(roleSlug)
          ? { ...u, roles: u.roles.filter((x) => x !== roleSlug) }
          : u,
      )
      s.roles = s.roles.map((r) =>
        r.slug === roleSlug
          ? { ...r, usersCount: Math.max(0, (r.usersCount || 0) - ids.length) }
          : r,
      )
    })

    // capability ops
    b.addCase(upsertCapabilityThunk.fulfilled, (s, a) => {
      const i = s.capabilities.findIndex((c) => c.key === a.payload.key)
      if (i >= 0) s.capabilities[i] = a.payload
      else s.capabilities = [a.payload, ...s.capabilities]
    })

    b.addCase(deleteCapabilityThunk.fulfilled, (s, a) => {
      const key = a.payload
      s.capabilities = s.capabilities.filter((c) => c.key !== key)
      // remove from roles that had this cap
      s.roles = s.roles.map((r) => ({
        ...r,
        capabilities: r.capabilities.filter((k) => k !== key),
      }))
    })
  },
})

export const { setSelectedUsers, setSelectedRoles, bumpRoleCounts } =
  slice.actions
export default slice.reducer

// Selectors
export const selectCR = (s: RootState) => s.customerRoles
export const selectRoles = (s: RootState) => s.customerRoles.roles
export const selectUsers = (s: RootState) => s.customerRoles.users
export const selectCapabilities = (s: RootState) => s.customerRoles.capabilities
