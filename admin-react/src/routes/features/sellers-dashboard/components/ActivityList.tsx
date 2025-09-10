// /routes/features/sellers-dashboard/components/ActivityList.tsx

import { Card } from '@/components/ui/card'

import type { JSX } from 'react'
import type { Activity } from '../types'

export default function ActivityList(props: {
  items: Array<Activity>
}): JSX.Element {
  const { items } = props
  return (
    <Card className="rounded-2xl p-5">
      <h3 className="text-lg font-semibold">Recent Activity</h3>
      <ul className="mt-3 space-y-2">
        {items.map((act) => (
          <li key={act.id} className="text-sm text-zinc-700">
            <span className="text-zinc-500">
              {new Date(act.time).toLocaleString()} —{' '}
            </span>
            {act.text}
          </li>
        ))}
      </ul>
    </Card>
  )
}
