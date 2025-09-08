// /features/public-auctions/store.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LOTS, SELLERS } from './data'
import type { JSX } from 'react'
import type { FilterValues, Lot, Seller } from './types'

type PublicAuctionsState = {
  lots: Array<Lot>
  sellers: Array<Seller>
  watchlist: Set<string>
  savedSearches: Array<{ id: string; name: string; values: FilterValues }>
}

type PublicAuctionsActions = {
  toggleWatch: (lotId: string) => void
  saveSearch: (name: string, values: FilterValues) => void
  removeSavedSearch: (id: string) => void
}

const Ctx = createContext<{
  state: PublicAuctionsState
  actions: PublicAuctionsActions
} | null>(null)

export function PublicAuctionsProvider(props: {
  children: JSX.Element | Array<JSX.Element>
}): JSX.Element {
  const [lots] = useState<Array<Lot>>(() => LOTS)
  const [watchlist, setWatchlist] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem('wpam.watch')
      return raw ? new Set<string>(JSON.parse(raw) as Array<string>) : new Set()
    } catch {
      return new Set()
    }
  })
  const [savedSearches, setSavedSearches] = useState<
    Array<{ id: string; name: string; values: any }>
  >(() => {
    try {
      return JSON.parse(localStorage.getItem('wpam.savedSearches') ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(
    () =>
      localStorage.setItem('wpam.watch', JSON.stringify(Array.from(watchlist))),
    [watchlist],
  )
  useEffect(
    () =>
      localStorage.setItem('wpam.savedSearches', JSON.stringify(savedSearches)),
    [savedSearches],
  )

  const actions: PublicAuctionsActions = useMemo(
    () => ({
      toggleWatch: (id) => {
        setWatchlist((prev) => {
          const next = new Set(prev)
          next.has(id) ? next.delete(id) : next.add(id)
          return next
        })
      },
      saveSearch: (name, values) => {
        const id = `ss-${Math.random().toString(36).slice(2, 9)}`
        setSavedSearches((prev) => [{ id, name, values }, ...prev])
      },
      removeSavedSearch: (id) =>
        setSavedSearches((prev) => prev.filter((s) => s.id !== id)),
    }),
    [],
  )

  const value = {
    state: { lots, sellers: SELLERS, watchlist, savedSearches },
    actions,
  }
  return <Ctx.Provider value={value}>{props.children}</Ctx.Provider>
}

export function usePublicAuctions(): {
  state: PublicAuctionsState
  actions: PublicAuctionsActions
} {
  const ctx = useContext(Ctx)
  if (!ctx)
    throw new Error(
      'usePublicAuctions must be used within PublicAuctionsProvider',
    )
  return ctx
}
