// Domain + API types

export type BidStatus = 'leading' | 'outbid' | 'won' | 'lost'

export type Bid = {
  id: string
  auction: string
  lot: string
  bidder: string
  email: string
  amount: number
  placedAt: string // ISO
  status: BidStatus
  note: string
}

export type BidListParams = {
  q?: string
  status?: BidStatus | 'all'
  min?: number
  max?: number
  from?: string
  to?: string
  page?: number
  per_page?: number
  sort?: string
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error'
export type SaveState = 'idle' | 'saving' | 'success' | 'error'
