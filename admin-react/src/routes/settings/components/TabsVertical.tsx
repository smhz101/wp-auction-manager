// ---------------------------------------------
// Vertical tabs using TanStack Router <Link>
// ---------------------------------------------

import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'

type Item = { to: string; label: string }

export const TabsVertical: React.FC<{ items: Array<Item> }> = ({ items }) => {
  const location = useRouterState({ select: (s) => s.location.href })
  return (
    <nav className="w-56 shrink-0 rounded border border-zinc-200 bg-white">
      <ul className="!p-1">
        {items.map((it) => {
          const active = location.includes(it.to)
          return (
            <li key={it.to}>
              <Link
                to={it.to}
                className={`block rounded px-3 py-2 text-sm !text-black ${
                  active ? 'bg-black !text-white' : 'hover:bg-zinc-100'
                }`}
              >
                {it.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
