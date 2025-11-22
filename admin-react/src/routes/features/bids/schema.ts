import { z } from 'zod'

// UI filters live as strings for empty/partial fields
export const FiltersSchema = z.object({
  q: z.string().optional().default(''),
  status: z
    .enum(['all', 'leading', 'outbid', 'won', 'lost'])
    .optional()
    .default('all'),
  min: z.string().optional().default(''),
  max: z.string().optional().default(''),
  from: z.string().optional().default(''),
  to: z.string().optional().default(''),
})
export type FiltersFormValues = z.infer<typeof FiltersSchema>

export const NoteSchema = z.object({
  note: z.string().max(1000, 'Max 1000 chars').optional().default(''),
})
export type NoteFormValues = z.infer<typeof NoteSchema>
