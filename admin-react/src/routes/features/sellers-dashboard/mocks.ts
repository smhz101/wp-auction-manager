// /routes/features/sellers-dashboard/mocks.ts

import { faker } from '@faker-js/faker'
import { addMinutes, addHours, addDays } from './utils/date-lite'
import type {
  Activity,
  DashboardData,
  Payout,
  SellerAuction,
  SellerOrder,
} from './types'

faker.seed(17)

function isoFromNow(amount: number, unit: 'm' | 'h' | 'd'): string {
  if (unit === 'm') return addMinutes(new Date(), amount).toISOString()
  if (unit === 'h') return addHours(new Date(), amount).toISOString()
  return addDays(new Date(), amount).toISOString()
}

const AUCTIONS: Array<SellerAuction> = [
  {
    id: 'lot-201',
    title: 'Omega Speedmaster 3570.50',
    image: 'https://picsum.photos/seed/omega/800/500',
    currentBid: 4120,
    watchers: 62,
    bids: 14,
    reserve: 3800,
    endsAt: isoFromNow(2, 'h'),
    status: 'live',
  },
  {
    id: 'lot-202',
    title: 'Pakistani Truck Art Canvas (36")',
    image: 'https://picsum.photos/seed/truck/800/500',
    currentBid: 260,
    watchers: 19,
    bids: 7,
    reserve: 300,
    endsAt: isoFromNow(1, 'd'),
    status: 'live',
  },
  {
    id: 'lot-203',
    title: 'Signed Cricket Bat – Babar Azam',
    image: 'https://picsum.photos/seed/cricket/800/500',
    currentBid: 980,
    watchers: 44,
    bids: 11,
    reserve: 900,
    endsAt: isoFromNow(3, 'h'),
    status: 'live',
  },
  {
    id: 'lot-204',
    title: 'Vintage Leica M6 Body',
    image: 'https://picsum.photos/seed/leica/800/500',
    currentBid: 0,
    watchers: 12,
    bids: 0,
    reserve: 1800,
    endsAt: isoFromNow(3, 'd'),
    status: 'scheduled',
  },
  {
    id: 'lot-205',
    title: 'Calligraphy Artwork on Wasli',
    image: 'https://picsum.photos/seed/art/800/500',
    currentBid: 520,
    watchers: 21,
    bids: 5,
    reserve: null,
    endsAt: isoFromNow(-2, 'd'),
    status: 'ended',
  },
  {
    id: 'lot-206',
    title: 'Seiko SKX007 Diver',
    image: 'https://picsum.photos/seed/seiko/800/500',
    currentBid: 0,
    watchers: 9,
    bids: 0,
    reserve: 250,
    endsAt: isoFromNow(-1, 'd'),
    status: 'unsold',
  },
  {
    id: 'lot-207',
    title: 'Porsche 911 Diecast (1:18)',
    image: 'https://picsum.photos/seed/porsche/800/500',
    currentBid: 180,
    watchers: 33,
    bids: 6,
    reserve: 150,
    endsAt: isoFromNow(6, 'h'),
    status: 'live',
  },
  {
    id: 'lot-208',
    title: 'Orient Bambino Gen 2',
    image: 'https://picsum.photos/seed/orient/800/500',
    currentBid: 90,
    watchers: 8,
    bids: 2,
    reserve: null,
    endsAt: isoFromNow(5, 'd'),
    status: 'scheduled',
  },
  {
    id: 'lot-209',
    title: 'Handmade Persian Rug (4x6)',
    image: 'https://picsum.photos/seed/rug/800/500',
    currentBid: 760,
    watchers: 17,
    bids: 4,
    reserve: 700,
    endsAt: isoFromNow(-5, 'h'),
    status: 'ended',
  },
]

const ORDERS: Array<SellerOrder> = [
  {
    id: 'ORD-10021',
    lotId: 'lot-203',
    lotTitle: 'Signed Cricket Bat – Babar Azam',
    buyer: 'Ali R.',
    amount: 980,
    status: 'paid',
    createdAt: isoFromNow(-2, 'h'),
  },
  {
    id: 'ORD-10022',
    lotId: 'lot-207',
    lotTitle: 'Porsche 911 Diecast (1:18)',
    buyer: 'Sana K.',
    amount: 180,
    status: 'processing',
    createdAt: isoFromNow(-5, 'h'),
  },
  {
    id: 'ORD-10023',
    lotId: 'lot-201',
    lotTitle: 'Omega Speedmaster 3570.50',
    buyer: 'John D.',
    amount: 4120,
    status: 'pending-payment',
    createdAt: isoFromNow(-1, 'h'),
  },
]

const PAYOUTS: Array<Payout> = [
  {
    id: 'PO-3001',
    amount: 1800,
    scheduledFor: isoFromNow(2, 'd'),
    status: 'scheduled',
  },
  {
    id: 'PO-2997',
    amount: 950,
    scheduledFor: isoFromNow(-6, 'd'),
    status: 'paid',
  },
]

const SALES_14D: Array<number> = [
  120, 220, 180, 90, 160, 280, 340, 200, 260, 180, 310, 380, 240, 290,
]

const ACTIVITY: Array<Activity> = [
  {
    id: 'a1',
    time: isoFromNow(-14, 'm'),
    text: 'Bid placed: +$30 on "Omega Speedmaster 3570.50".',
  },
  {
    id: 'a2',
    time: isoFromNow(-1, 'h'),
    text: 'Order created #ORD-10023 (pending payment).',
  },
  {
    id: 'a3',
    time: isoFromNow(-3, 'h'),
    text: 'You received a message from buyer "Sana K."',
  },
  {
    id: 'a4',
    time: isoFromNow(-1, 'd'),
    text:
      'Payout scheduled for $1,800 on ' +
      new Date(PAYOUTS[0].scheduledFor).toDateString() +
      '.',
  },
]

export function getMockDashboard(): DashboardData {
  return {
    auctions: AUCTIONS,
    orders: ORDERS,
    payouts: PAYOUTS,
    activity: ACTIVITY,
    sales14d: SALES_14D,
  }
}
