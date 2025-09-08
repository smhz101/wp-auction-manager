// Header.tsx — tweak classes + scope to kill WP focus/box-shadow bleed
// - Adds a `.wpam-scope` wrapper so we can safely override WP admin CSS
// - Removes “mystery border” on click via focus/box-shadow resets
// - Keeps keyboard a11y (we still show focus via bg hover states if you want)

import { useState } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import type { LinkProps } from '@tanstack/react-router'

import './Header.css'

type Tab = { to: LinkProps['to']; label: string; exact?: boolean }

const tabs: Array<Tab> = [
  { to: '/', label: 'Dashboard', exact: true },
  { to: '/activeCarts', label: 'Active Carts' },
  { to: '/bidsManager', label: 'Bids Manager' },
  { to: '/publicAuctions', label: 'Public Auctions' },
  { to: '/customerRoles', label: 'Customer Roles' },
  { to: '/sellersDashboard', label: 'Sellers' },
  { to: '/settings', label: 'Settings' },
  { to: '/help', label: 'Help' },
]

// Tailwind tab classes (no unexpected focus border/outline)
const baseTab =
  // layout
  'relative inline-flex items-center whitespace-nowrap rounded-t-md px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-[0.95rem] font-medium transition-colors ' +
  // border logic
  'border-b-2 border-transparent ' +
  // kill outlines/box-shadows even if WP admin injects them
  'focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:[box-shadow:none] focus-visible:[box-shadow:none] ' +
  // a:active quirks
  'active:[box-shadow:none]'
const activeTab = 'text-indigo-700 border-indigo-600 bg-indigo-50/60'
const inactiveTab =
  'text-gray-600 hover:text-gray-900 hover:bg-gray-50/60 hover:border-gray-200'
const pendingTab = 'opacity-80'

export default function Header() {
  const { location, isLoading } = useRouterState()
  const currentPath = location.pathname
  const [query, setQuery] = useState('')

  const isActive = (to: LinkProps['to'], exact?: boolean): boolean => {
    const path = String(to)
    return exact ? currentPath === path : currentPath.startsWith(path)
  }

  return (
    <header className="wpam-scope flex flex-col gap-2 bg-white !text-gray-900">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 sm:px-4">
        <Link
          to="/"
          preload="intent"
          className="flex items-center gap-2 no-underline"
        >
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-indigo-600 text-white shadow-sm">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 3l7.5 4.33v9.34L12 21l-7.5-4.33V7.33L12 3z" />
              <path d="M12 8v13" />
              <path d="M4.5 11.5L12 16l7.5-4.5" />
            </svg>
          </span>
          <span className="text-base font-semibold tracking-tight sm:text-lg !text-gray-900">
            Auctions
          </span>
        </Link>

        <form
          role="search"
          aria-label="Site search"
          className="relative w-full max-w-xs sm:max-w-sm"
          onSubmit={(e) => {
            e.preventDefault()
            // TODO: wire search
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            placeholder="Search…"
            aria-label="Search"
            className="w-full rounded-full bg-gray-50 py-2 pl-9 pr-3 text-sm ring-1 ring-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-3.6-3.6" />
          </svg>
        </form>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <nav
          className="flex w-full max-w-7xl items-end overflow-x-auto px-2 sm:px-3"
          aria-label="Primary"
        >
          <ul className="flex min-w-full gap-1 sm:gap-2">
            {tabs.map(({ to, label, exact }) => {
              const active = isActive(to, exact)
              const classes = [
                baseTab,
                active ? activeTab : inactiveTab,
                isLoading ? pendingTab : '',
              ].join(' ')
              return (
                <li key={String(to)} className="flex !mb-0">
                  <Link
                    to={to}
                    preload="intent"
                    activeOptions={{ exact: !!exact }}
                    className={`${classes} !text-gray-900 !font-normal`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </header>
  )
}
