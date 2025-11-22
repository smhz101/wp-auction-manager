// /routes/features/customer-roles/api.ts
import { wpHttp } from '@/lib/api/client'
import type { BootRolesPayload, Role, User, Capability } from './types'

// Adjust namespace if your PHP registers differently
const BASE = '/wpam/v1'

export const rolesApi = {
  async fetchAll(): Promise<BootRolesPayload> {
    // server can return { roles, users, capabilities, groups? }
    return wpHttp.get<BootRolesPayload>(`${BASE}/roles/boot`)
  },
  async createRole(
    payload: Omit<Role, 'id' | 'usersCount' | 'isSystem'>,
  ): Promise<Role> {
    return wpHttp.post<Role>(`${BASE}/roles`, payload)
  },
  async updateRole(id: string, payload: Partial<Role>): Promise<Role> {
    return wpHttp.putJson<Role>(`${BASE}/roles/${id}`, payload)
  },
  async deleteRole(id: string): Promise<{ ok: boolean }> {
    return wpHttp.deleteJson<{ ok: boolean }>(`${BASE}/roles/${id}`)
  },
  async duplicateRole(id: string): Promise<Role> {
    return wpHttp.post<Role>(`${BASE}/roles/${id}/duplicate`)
  },
}

export const usersApi = {
  async assignRole(roleSlug: string, ids: string[]): Promise<{ ok: boolean }> {
    return wpHttp.post<{ ok: boolean }>(`${BASE}/users/assign-role`, {
      roleSlug,
      ids,
    })
  },
  async removeRole(roleSlug: string, ids: string[]): Promise<{ ok: boolean }> {
    return wpHttp.post<{ ok: boolean }>(`${BASE}/users/remove-role`, {
      roleSlug,
      ids,
    })
  },
  async createUser(payload: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return wpHttp.post<User>(`${BASE}/users`, payload)
  },
  async updateUser(payload: User): Promise<User> {
    return wpHttp.putJson<User>(`${BASE}/users/${payload.id}`, payload)
  },
  async deleteUsers(ids: string[]): Promise<{ ok: boolean }> {
    return wpHttp.post<{ ok: boolean }>(`${BASE}/users/bulk-delete`, { ids })
  },
}

export const capsApi = {
  async upsertCapability(c: Capability): Promise<Capability> {
    return wpHttp.putJson<Capability>(
      `${BASE}/capabilities/${encodeURIComponent(c.key)}`,
      c,
    )
  },
  async deleteCapability(key: string): Promise<{ ok: boolean }> {
    return wpHttp.deleteJson<{ ok: boolean }>(
      `${BASE}/capabilities/${encodeURIComponent(key)}`,
    )
  },
}
