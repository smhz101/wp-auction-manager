// /features/public-auctions/data.ts
import { isoFromNow, uid } from './utils'
import type { Lot, Seller } from './types'

export const CATEGORIES: Array<string> = [
  'Art',
  'Cars',
  'Collectibles',
  'Electronics',
  'Fashion',
  'Furniture',
  'Jewelry',
]

export const SELLERS: Array<Seller> = [
  { id: 's-alex', name: 'Alex & Co.', rating: 4.7, country: 'UK' },
  { id: 's-luna', name: 'Luna House', rating: 4.9, country: 'DE' },
  { id: 's-kite', name: 'Kite Gallery', rating: 4.5, country: 'FR' },
]

function lot(p: Partial<Lot>): Lot {
  return {
    id: uid('lot'),
    title: 'Untitled',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop',
    sellerId: SELLERS[0].id,
    status: 'live',
    currentBid: 100,
    currency: 'GBP',
    bidsCount: 3,
    endsAt: isoFromNow(18, 'h'),
    categories: ['Collectibles'],
    condition: 'used',
    location: 'London, UK',
    reserveMet: false,
    shipping: 'worldwide',
    tags: [],
    ...p,
  }
}

export const LOTS: Array<Lot> = [
  lot({
    title: '1969 Classic Sports Car',
    imageUrl:
      'https://images.unsplash.com/photo-1541446654331-5f09be8a6c39?w=1200&q=80&auto=format&fit=crop',
    sellerId: 's-alex',
    status: 'live',
    currentBid: 42500,
    buyNowPrice: 52000,
    bidsCount: 12,
    endsAt: isoFromNow(6, 'h'),
    categories: ['Cars'],
    condition: 'used',
    location: 'Manchester, UK',
    reserveMet: true,
    tags: ['featured'],
  }),
  lot({
    title: 'Abstract Canvas by N. Floyd',
    imageUrl:
      'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&q=80&auto=format&fit=crop',
    sellerId: 's-kite',
    status: 'live',
    currentBid: 2600,
    bidsCount: 8,
    endsAt: isoFromNow(22, 'h'),
    categories: ['Art'],
    condition: 'new',
    location: 'Paris, FR',
    shipping: 'regional',
  }),
  lot({
    title: 'Vintage Rolex (Ref. 1601)',
    imageUrl:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80&auto=format&fit=crop',
    sellerId: 's-luna',
    status: 'upcoming',
    currentBid: 0,
    bidsCount: 0,
    endsAt: isoFromNow(3, 'd'),
    buyNowPrice: 9800,
    categories: ['Jewelry'],
    condition: 'refurbished',
    location: 'Berlin, DE',
    reserveMet: false,
    tags: ['buy-now'],
  }),
  lot({
    title: 'Eames Lounge Chair & Ottoman',
    imageUrl:
      'https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?w=1200&q=80&auto=format&fit=crop',
    sellerId: 's-alex',
    status: 'live',
    currentBid: 1400,
    bidsCount: 14,
    endsAt: isoFromNow(1, 'd'),
    categories: ['Furniture'],
    condition: 'used',
    location: 'London, UK',
    shipping: 'local',
    reserveMet: true,
  }),
  lot({
    title: ' Leica M10-P Camera',
    imageUrl:
      'https://images.unsplash.com/photo-1519183071298-a2962be96f83?w=1200&q=80&auto=format&fit=crop',
    sellerId: 's-luna',
    status: 'ended',
    currentBid: 5100,
    bidsCount: 27,
    endsAt: isoFromNow(-1, 'd'),
    categories: ['Electronics'],
    condition: 'used',
    location: 'Hamburg, DE',
    reserveMet: true,
  }),
]
