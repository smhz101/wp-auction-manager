export function uid(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

export function isoFromNow(amount: number, unit: 'm' | 'h' | 'd'): string {
  const ms =
    unit === 'm'
      ? amount * 60_000
      : unit === 'h'
        ? amount * 3_600_000
        : amount * 86_400_000
  return new Date(Date.now() + ms).toISOString()
}
