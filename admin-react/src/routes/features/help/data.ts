// /features/help/data.ts
import type { ChangeLogEntry, Faq, Guide, QuickLink, Shortcut } from './types'

export const QUICK_LINKS: Array<QuickLink> = [
  {
    label: 'Customer Roles',
    href: '/customerRoles',
    hint: 'Manage roles & capabilities',
  },
  {
    label: 'Public Auctions',
    href: '/publicAuctions',
    hint: 'Browse & filter lots',
  },
  {
    label: 'Sellers Dashboard',
    href: '/sellersDashboard',
    hint: 'Manage auctions',
  },
]

export const GUIDES: Array<Guide> = [
  {
    id: 'active-carts',
    title: 'Active Carts: recovery & conversions',
    summary:
      'Understand “Active Carts”, abandonment thresholds, soft reservations, and recovery workflows.',
    audience: 'Admin',
    lastUpdated: '2025-06-15T10:00:00Z',
    tags: ['carts', 'payments', 'recovery'],
    content: `
What are Active Carts?
- Sessions holding won lots, buy-now, or deposits that have not converted to an order.

Key states:
- active → abandoned → recovering → converted | expired | invalidated

Timers:
- Abandonment job runs every 5–10 mins; threshold 30–60 mins.
- Optional auto-expire abandoned carts after N hours (releases lot reservation).

Recovery:
- 2-stage nudges: immediate + 24h later.
- Include payment link and support contact. Respect opt-outs.

Endpoints (wpam/v1/carts):
GET /carts
GET /carts/:id
POST /carts/:id/status
POST /carts/:id/recover
POST /carts/:id/convert
`.trim(),
  },
  {
    id: 'roles-capabilities',
    title: 'Customer Roles & Capabilities',
    summary:
      'Create, edit, and assign roles. Control access with granular capabilities.',
    audience: 'Admin',
    lastUpdated: '2025-05-24T12:00:00Z',
    tags: ['roles', 'capabilities', 'permissions'],
    content: `
Concepts:
- Roles group capabilities (Access, Bidding, Payments, Perks)
- System roles are locked; cannot delete or rename.

Tips:
- Keep "Verified" minimal; add perks via "VIP".
- Use bulk assign/remove for campaign-based upgrades.
`.trim(),
  },
  {
    id: 'sellers-dashboard',
    title: 'Sellers Dashboard',
    summary: 'Create auctions, upload lots, and monitor performance.',
    audience: 'Seller',
    lastUpdated: '2025-04-10T09:00:00Z',
    tags: ['seller', 'auctions'],
    content: `
Workflow:
1) Create an auction → add lots → set start/end.
2) Track bids, reserves, and settlement.
3) Export CSV and reconcile fees.
`.trim(),
  },
  {
    id: 'public-auctions',
    title: 'Public Auctions page',
    summary: 'Filters, sorting, and watchlist tips for bidders.',
    audience: 'Bidder',
    lastUpdated: '2025-03-19T17:00:00Z',
    tags: ['bidding', 'filters'],
    content: `
Quick tips:
- Use "Ending soon" + price filters to find opportunities.
- Watchlist to get reminders before close.
`.trim(),
  },
]

export const FAQS: Array<Faq> = [
  {
    id: 'faq-abandon-threshold',
    q: 'What is the default abandonment threshold?',
    a: 'Typically 30–60 minutes since the last activity. You can configure this in settings.',
    tags: ['carts', 'timers'],
  },
  {
    id: 'faq-deposit',
    q: 'Can I require a deposit before bidding?',
    a: 'Yes. Add a "deposit" item to pre-qualify bidders; carts will hold the deposit obligation.',
    tags: ['payments', 'deposit'],
  },
  {
    id: 'faq-roles-delete',
    q: 'Why can’t I delete a role?',
    a: 'System roles are locked. Non-system roles with users assigned must be detached from users first.',
    tags: ['roles', 'capabilities'],
  },
  {
    id: 'faq-export',
    q: 'How do I export reports?',
    a: 'Use the Sellers Dashboard → Reports tab to export CSV summaries for bids, conversions, and fees.',
    tags: ['reports', 'export'],
  },
]

export const SHORTCUTS: Array<Shortcut> = [
  { scope: 'Global', combo: 'Shift + /', action: 'Open help' },
  { scope: 'Users', combo: 'U then N', action: 'New user dialog' },
  { scope: 'Roles', combo: 'R then N', action: 'New role dialog' },
  { scope: 'Tables', combo: '↑/↓', action: 'Navigate rows' },
  { scope: 'Tables', combo: 'Space', action: 'Toggle selection' },
]

export const CHANGELOG: Array<ChangeLogEntry> = [
  {
    version: '1.6.0',
    date: '2025-08-28T00:00:00Z',
    type: 'Added',
    highlights: [
      'Active Carts recovery analytics dashboard',
      'Bulk role unassign in Users tab',
      'Help page with searchable guides (this!)',
    ],
    links: [{ label: 'Active Carts', href: '/customerRoles?tab=carts' }],
  },
  {
    version: '1.5.2',
    date: '2025-07-02T00:00:00Z',
    type: 'Fixed',
    highlights: ['Resolved lot reservation drift on quick convert'],
  },
  {
    version: '1.5.0',
    date: '2025-06-14T00:00:00Z',
    type: 'Changed',
    highlights: ['Refined capability groups and defaults'],
  },
]
