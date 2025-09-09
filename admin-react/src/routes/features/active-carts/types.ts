// /features/active-carts/types.ts

export type CartStatus = 'active' | 'abandoned' | 'recovering'

export type Cart = {
  id: string
  customer: string
  email: string
  items: number
  total: number
  updatedAt: string
  status: CartStatus
  note?: string
}

export type CartListParams = {
  q?: string
  status?: CartStatus | 'all'
  from?: string
  to?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type ListResponse = {
  rows: Array<Cart>
  total: number
}

export type CartsApiEndpoints = {
  listUrl: string // GET with query params
  updateNoteUrl: (id: string) => string // PUT { note }
  bulkStatusUrl: string // POST { ids, status }
}

export type CartsApiConfig = {
  axiosBaseUrl?: string
  endpoints: CartsApiEndpoints
  authHeaderName?: string
  getAuthToken?: () => string | null
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error'
export type SaveState = 'idle' | 'saving' | 'success' | 'error'
