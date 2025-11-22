// /routes/features/customer-roles/types.ts

export type UserStatus = 'active' | 'disabled'

export type Capability = {
  key: string // e.g. "manage_auctions"
  label: string // e.g. "Manage auctions"
  group?: string // e.g. "auctions"
  description?: string
}

export type CapabilityGroup = {
  key: string // e.g. "auctions"
  label: string // e.g. "Auctions"
  order?: number
}

export type Role = {
  id: string // server id
  name: string // display name
  slug: string // e.g. "auction_manager"
  description?: string
  isSystem?: boolean
  usersCount?: number
  capabilities: string[] // capability keys
}

export type User = {
  id: string
  email: string
  name: string
  status: UserStatus
  roles: string[] // role slugs
  createdAt: string // ISO
}

export type BootRolesPayload = {
  roles: Role[]
  users: User[]
  capabilities: Capability[]
  groups?: CapabilityGroup[]
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error'
export type SaveState = 'idle' | 'saving' | 'success' | 'error'
