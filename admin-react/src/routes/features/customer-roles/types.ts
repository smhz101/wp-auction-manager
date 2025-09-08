export type CapabilityGroup = 'Access' | 'Bidding' | 'Payments' | 'Perks'

export type Capability = {
  key: string
  label: string
  group: CapabilityGroup
  help?: string
}

export type Role = {
  id: string
  slug: string
  name: string
  description?: string
  isSystem?: boolean
  usersCount: number
  capabilities: Array<string>
}

export type UserStatus = 'active' | 'pending' | 'banned'

export type User = {
  id: string
  name: string
  email: string
  roles: Array<string>
  status: UserStatus
  createdAt: string
}
