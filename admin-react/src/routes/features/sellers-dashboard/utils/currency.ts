// /routes/features/sellers-dashboard/utils/currency.ts

export function currencyFmt(n: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
    }).format(n)
  } catch {
    return `${currency} ${n.toLocaleString()}`
  }
}
