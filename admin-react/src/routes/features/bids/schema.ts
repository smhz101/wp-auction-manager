// /features/bids/schema.ts

import { z } from 'zod'

export const FiltersSchema = z.object({
  q: z.string().default(''),
  status: z
    .enum(['all', 'leading', 'outbid', 'won', 'lost'] as const)
    .default('all'),
  min: z.string().default(''),
  max: z.string().default(''),
  from: z.string().default(''),
  to: z.string().default(''),
  page: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(5).max(200).default(10),
  sortBy: z.string().default('placedAt'),
  sortDir: z.enum(['asc', 'desc'] as const).default('desc'),
})

export type FiltersFormValues = z.infer<typeof FiltersSchema>

export const NoteSchema = z.object({
  note: z.string().max(2000).default(''),
})

export type NoteFormValues = z.infer<typeof NoteSchema>
