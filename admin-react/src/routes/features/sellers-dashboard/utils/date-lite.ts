// /routes/features/sellers-dashboard/utils/date-lite.ts

export function addMinutes(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60_000)
}
export function addHours(d: Date, hrs: number): Date {
  return new Date(d.getTime() + hrs * 3_600_000)
}
export function addDays(d: Date, days: number): Date {
  return new Date(d.getTime() + days * 86_400_000)
}
