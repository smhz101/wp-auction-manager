// /features/public-auctions/types.ts
export type LotStatus = 'ended' | 'live' | 'upcoming'

export type ShippingScope = 'local' | 'regional' | 'worldwide'

export type Lot = {
  id: string
  title: string
  imageUrl: string
  sellerId: string
  status: LotStatus
  currentBid: number
  buyNowPrice?: number
  currency: string
  bidsCount: number
  endsAt: string // ISO
  categories: Array<string>
  condition: 'new' | 'used' | 'refurbished'
  location: string
  reserveMet: boolean
  shipping: ShippingScope
  tags: Array<string>
}

export type Seller = {
  id: string
  name: string
  rating: number // 0..5
  country: string
}

export type FilterValues = {
  query: string
  categories: Array<string>
  status: Array<LotStatus>
  minPrice?: number
  maxPrice?: number
  endingWithin?: '6h' | '24h' | '3d' | '7d'
  shipping?: Array<ShippingScope>
  condition?: Array<'new' | 'used' | 'refurbished'>
  buyNowOnly?: boolean
  reserveMetOnly?: boolean
}

export type SortKey =
  | 'endingSoon'
  | 'newest'
  | 'priceAsc'
  | 'priceDesc'
  | 'mostBids'
