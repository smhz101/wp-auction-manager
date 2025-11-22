// /routes/features/customer-roles/seed.ts
import type { Capability, CapabilityGroup, Role, User } from './types'

export const GROUPS: CapabilityGroup[] = [
  { key: 'auctions', label: 'Auctions', order: 1 },
  { key: 'bids', label: 'Bids', order: 2 },
  { key: 'orders', label: 'Orders', order: 3 },
  { key: 'users', label: 'Users', order: 4 },
]

export const CAPABILITIES: Capability[] = [
  { key: 'view_auctions', label: 'View auctions', group: 'auctions' },
  { key: 'manage_auctions', label: 'Manage auctions', group: 'auctions' },
  { key: 'view_bids', label: 'View bids', group: 'bids' },
  { key: 'moderate_bids', label: 'Moderate bids', group: 'bids' },
  { key: 'view_orders', label: 'View orders', group: 'orders' },
  { key: 'fulfill_orders', label: 'Fulfill orders', group: 'orders' },
  { key: 'view_users', label: 'View users', group: 'users' },
  { key: 'manage_users', label: 'Manage users', group: 'users' },
]

export const ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    slug: 'administrator',
    description: 'Full access',
    isSystem: true,
    usersCount: 1,
    capabilities: CAPABILITIES.map((c) => c.key),
  },
  {
    id: 'role-auction-mgr',
    name: 'Auction Manager',
    slug: 'auction_manager',
    description: 'Manage auctions and bids',
    isSystem: false,
    usersCount: 2,
    capabilities: [
      'view_auctions',
      'manage_auctions',
      'view_bids',
      'moderate_bids',
    ],
  },
]

export const USERS: User[] = [
  {
    id: 'u-1',
    email: 'admin@example.com',
    name: 'Site Admin',
    status: 'active',
    roles: ['administrator'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u-2',
    email: 'manager@example.com',
    name: 'Auction Manager',
    status: 'active',
    roles: ['auction_manager'],
    createdAt: new Date().toISOString(),
  },
]
