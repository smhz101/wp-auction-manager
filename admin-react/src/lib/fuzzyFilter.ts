import { rankItem } from '@tanstack/match-sorter-utils'
import type { FilterFn } from '@tanstack/react-table'

export const fuzzy: FilterFn<unknown> = (row, columnId, value, addMeta) => {
  const itemRank = rankItem(
    String(row.getValue(columnId) ?? ''),
    String(value ?? ''),
  )
  addMeta({ itemRank })
  return itemRank.passed
}
