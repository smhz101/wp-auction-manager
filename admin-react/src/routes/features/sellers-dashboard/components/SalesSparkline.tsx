// /routes/features/sellers-dashboard/components/SalesSparkline.tsx

import type { JSX } from 'react'

export default function SalesSparkline(props: {
  data: Array<number>
  w?: number
  h?: number
}): JSX.Element {
  const { data, w = 600, h = 64 } = props
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = Math.max(1, max - min)
  const step = w / (data.length - 1)
  const d = data
    .map(
      (v, i) =>
        `${i === 0 ? 'M' : 'L'} ${i * step} ${h - ((v - min) / range) * (h - 6) - 3}`,
    )
    .join(' ')
  return (
    <svg width={w} height={h} className="overflow-visible">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        className="text-zinc-400"
        strokeWidth={2}
      />
    </svg>
  )
}
