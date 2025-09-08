import { isoFromNow, uid } from './utils'

import type {
  Capability,
  CapabilityGroup,
  Role,
  User,
  UserStatus,
} from './types'

export const GROUPS: Array<CapabilityGroup> = [
  'Access',
  'Bidding',
  'Payments',
  'Perks',
]

export const DEFAULT_CAPABILITIES: Array<Capability> = [
  { key: 'view_public', label: 'View public auctions', group: 'Access' },
  {
    key: 'vip_only_access',
    label: 'Access VIP-only lots',
    group: 'Access',
    help: 'Gate lots for premium customers.',
  },
  { key: 'early_access', label: 'Early access to new lots', group: 'Access' },

  { key: 'bid', label: 'Place bids', group: 'Bidding' },
  {
    key: 'auto_bid',
    label: 'Use Auto-bid',
    group: 'Bidding',
    help: 'Automatic incremental bidding up to a limit.',
  },
  { key: 'watchlist', label: 'Add to Watchlist', group: 'Bidding' },

  { key: 'buy_now', label: 'Buy Now', group: 'Payments' },
  {
    key: 'deposit_required',
    label: 'Deposit required to bid',
    group: 'Payments',
    help: 'Pre-authorization or deposit.',
  },
  {
    key: 'credit_checkout',
    label: 'Credit/Invoice checkout',
    group: 'Payments',
    help: 'Invoice/net terms for trusted roles.',
  },

  { key: 'live_chat_support', label: 'Live chat support', group: 'Perks' },
  { key: 'priority_support', label: 'Priority support', group: 'Perks' },
  {
    key: 'premium_notifications',
    label: 'Premium notifications',
    group: 'Perks',
    help: 'SMS/push for outbids & endings.',
  },
]

export const DEFAULT_ROLES: Array<Role> = [
  {
    id: 'role-guest',
    slug: 'guest',
    name: 'Guest',
    description: 'Anonymous visitor',
    isSystem: true,
    usersCount: 0,
    capabilities: ['view_public', 'watchlist'],
  },
  {
    id: 'role-registered',
    slug: 'registered',
    name: 'Registered',
    description: 'Email-verified',
    isSystem: true,
    usersCount: 1284,
    capabilities: [
      'view_public',
      'watchlist',
      'bid',
      'buy_now',
      'premium_notifications',
    ],
  },
  {
    id: 'role-verified',
    slug: 'verified',
    name: 'Verified',
    description: 'KYC/phone verified',
    isSystem: true,
    usersCount: 376,
    capabilities: [
      'view_public',
      'watchlist',
      'bid',
      'auto_bid',
      'buy_now',
      'premium_notifications',
      'live_chat_support',
    ],
  },
  {
    id: 'role-vip',
    slug: 'vip',
    name: 'VIP',
    description: 'High-value customer',
    usersCount: 42,
    capabilities: [
      'view_public',
      'watchlist',
      'bid',
      'auto_bid',
      'buy_now',
      'vip_only_access',
      'early_access',
      'live_chat_support',
      'priority_support',
      'premium_notifications',
      'credit_checkout',
    ],
  },
  {
    id: 'role-banned',
    slug: 'banned',
    name: 'Banned',
    description: 'Blocked for fraud/abuse',
    isSystem: true,
    usersCount: 5,
    capabilities: [],
  },
]

export const DEFAULT_USERS: Array<User> = [
  mkUser('Ali Raza', 'ali@example.com', ['registered'], 'active', -12, 'd'),
  mkUser('Sana Khan', 'sana@example.com', ['verified'], 'active', -2, 'd'),
  mkUser('John Doe', 'john@example.com', ['vip'], 'active', -1, 'd'),
  mkUser('Mahak', 'mahak@example.com', ['registered'], 'pending', -5, 'd'),
  mkUser('Eman Noor', 'eman@example.com', ['registered'], 'active', -8, 'd'),
  mkUser('Noor Ul Ain', 'noor@example.com', ['verified'], 'active', -2, 'h'),
  mkUser('Ayesha', 'ayesha@example.com', ['guest'], 'active', -4, 'd'),
  mkUser('Usman', 'usman@example.com', ['banned'], 'banned', -20, 'd'),
]

function mkUser(
  name: string,
  email: string,
  roles: Array<string>,
  status: UserStatus,
  delta: number,
  unit: 'h' | 'd',
): User {
  return {
    id: uid('usr'),
    name,
    email,
    roles,
    status,
    createdAt: isoFromNow(delta, unit),
  }
}
