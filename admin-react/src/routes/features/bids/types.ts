// /features/bids/types.ts

export type BidStatus = 'leading' | 'outbid' | 'won' | 'lost'

export type Bid = {
  id: string
  auction: string
  lot: string
  bidder: string
  email: string
  amount: number
  placedAt: string
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
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type ListResponse = {
  rows: Array<Bid>
  total: number
}

export type BidsApiEndpoints = {
  listUrl: string // GET with query params
  updateNoteUrl: (id: string) => string // PUT { note }
  bulkTagLostUrl: string // POST { ids }
}

export type BidsApiConfig = {
  axiosBaseUrl?: string
  endpoints: BidsApiEndpoints
  authHeaderName?: string
  getAuthToken?: () => string | null
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error'
export type SaveState = 'idle' | 'saving' | 'success' | 'error'
