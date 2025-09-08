// /features/public-auctions/utils.ts
export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function isoFromNow(amount: number, unit: 'h' | 'd'): string {
  const ms = unit === 'h' ? amount * 3_600_000 : amount * 86_400_000
  return new Date(Date.now() + ms).toISOString()
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function hoursUntil(dateISO: string): number {
  const diff = +new Date(dateISO) - Date.now()
  return Math.max(0, Math.round(diff / 3_600_000))
}
