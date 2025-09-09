import type { FilterFn } from '@tanstack/react-table'

export {}
declare module '@tanstack/react-table' {
  interface FilterFns {
    fuzzy: FilterFn<unknown>
  }
}
