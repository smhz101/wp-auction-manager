// /routes/features/sellers-dashboard/types.ts

export type AuctionStatus = 'live' | 'scheduled' | 'ended' | 'unsold' | 'paused'

export type SellerAuction = {
  id: string
  title: string
  image: string
  currentBid: number
  watchers: number
  bids: number
  reserve: number | null
  endsAt: string // ISO
  status: AuctionStatus
}

export type OrderStatus =
  | 'pending-payment'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'refunded'

export type SellerOrder = {
  id: string
  lotId: string
  lotTitle: string
  buyer: string
  amount: number
  status: OrderStatus
  createdAt: string // ISO
}

export type Payout = {
  id: string
  amount: number
  scheduledFor: string // ISO
  status: 'scheduled' | 'processing' | 'paid'
}

export type Activity = {
  id: string
  time: string // ISO
  text: string
}

export type SalesSeries = Array<number>

export type DashboardData = {
  auctions: Array<SellerAuction>
  orders: Array<SellerOrder>
  payouts: Array<Payout>
  activity: Array<Activity>
  sales14d: SalesSeries
}
