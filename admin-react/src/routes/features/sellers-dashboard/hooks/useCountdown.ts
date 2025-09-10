// /routes/features/sellers-dashboard/hooks/useCountdown.ts

import { useEffect, useState } from 'react'

export function useCountdown(targetISO: string): string {
  const [left, setLeft] = useState<string>('—')

  useEffect(() => {
    const tick = () => {
      const diff = +new Date(targetISO) - Date.now()
      if (diff <= 0) {
        setLeft('Ended')
        return
      }
      const d = Math.floor(diff / 86_400_000)
      const h = Math.floor((diff % 86_400_000) / 3_600_000)
      const m = Math.floor((diff % 3_600_000) / 60_000)
      setLeft(d > 0 ? `${d}d ${h}h` : `${h}h ${m}m`)
    }
    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [targetISO])

  return left
}
