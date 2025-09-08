// /features/public-auctions/components/QuickStats.tsx
import type { JSX } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface QuickStatsProps {
  counts: { all: number; live: number; upcoming: number; ended: number }
}

export default function QuickStats({ counts }: QuickStatsProps): JSX.Element {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <Stat label="All" value={counts.all} />
      <Stat label="Live" value={counts.live} />
      <Stat label="Upcoming" value={counts.upcoming} />
      <Stat label="Ended" value={counts.ended} />
    </div>
  )
}

function Stat(props: { label: string; value: number }): JSX.Element {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs text-zinc-500">{props.label}</div>
        <div className="text-xl font-semibold">{props.value}</div>
      </CardContent>
    </Card>
  )
}
