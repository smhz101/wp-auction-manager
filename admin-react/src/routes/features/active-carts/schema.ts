// /features/active-carts/schema.ts

import { z } from 'zod'

export const FiltersSchema = z.object({
  q: z.string().default(''),
  status: z
    .enum(['all', 'active', 'abandoned', 'recovering'] as const)
    .default('all'),
  from: z.string().default(''),
  to: z.string().default(''),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(5).max(200).default(10),
  sortBy: z.string().default('customer'),
  sortDir: z.enum(['asc', 'desc'] as const).default('asc'),
})

export type FiltersFormValues = z.infer<typeof FiltersSchema>

export const NoteSchema = z.object({
  note: z.string().max(2000).default(''),
})

export type NoteFormValues = z.infer<typeof NoteSchema>

export const BulkStatusSchema = z.object({
  ids: z.array(z.string()).min(1),
  status: z.enum(['active', 'abandoned', 'recovering'] as const),
})

export type BulkStatusValues = z.infer<typeof BulkStatusSchema>
