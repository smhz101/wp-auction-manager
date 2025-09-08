// /features/help/types.ts
export type QuickLink = {
  label: string
  href: string
  hint?: string
}

export type Guide = {
  id: string
  title: string
  summary: string
  audience: 'Admin' | 'Seller' | 'Bidder'
  lastUpdated: string // ISO
  content: string // plaintext/markdown-ish (rendered as pre-wrap)
  tags: Array<string>
}

export type Faq = {
  id: string
  q: string
  a: string
  tags: Array<string>
}

export type Shortcut = {
  scope: string
  combo: string
  action: string
}

export type ChangeLogEntry = {
  version: string
  date: string // ISO
  highlights: Array<string>
  type: 'Added' | 'Changed' | 'Fixed'
  links?: Array<{ label: string; href: string }>
}
