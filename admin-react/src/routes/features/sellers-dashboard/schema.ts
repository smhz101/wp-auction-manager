// /routes/features/sellers-dashboard/schema.ts

import { z } from 'zod'

export const FiltersSchema = z.object({
  q: z.string().default(''),
  status: z
    .enum(['all', 'live', 'scheduled', 'ended', 'unsold', 'paused'])
    .default('all'),
})

export type FiltersFormValues = z.infer<typeof FiltersSchema>
