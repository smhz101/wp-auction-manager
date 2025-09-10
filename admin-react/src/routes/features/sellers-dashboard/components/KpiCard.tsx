// /routes/features/sellers-dashboard/components/KpiCard.tsx

import { Card } from '@/components/ui/card'

import type { JSX } from 'react'

export default function KpiCard(props: {
  label: string
  value: string
  hint?: string
}): JSX.Element {
  const { label, value, hint } = props
  return (
    <Card className="rounded-2xl p-5">
      <div className="text-sm text-zinc-600">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-zinc-500">{hint}</div> : null}
    </Card>
  )
}
