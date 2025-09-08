import { z } from 'zod'

// Constants derived from your existing types
const LOT_STATUS = ['ended', 'live', 'upcoming'] as const
const SHIPPING_SCOPES = ['local', 'regional', 'worldwide'] as const
const CONDITIONS = ['new', 'used', 'refurbished'] as const
const ENDING_WITHIN_OPTIONS = ['6h', '24h', '3d', '7d'] as const

// Schema that matches your existing FilterValues type structure
export const AuctionFilterSchema = z.object({
  query: z.string().default(''),
  categories: z.array(z.string()).default([]),
  status: z.array(z.enum(LOT_STATUS)).default([]),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  endingWithin: z.enum(ENDING_WITHIN_OPTIONS).optional(),
  shipping: z.array(z.enum(SHIPPING_SCOPES)).optional(),
  condition: z.array(z.enum(CONDITIONS)).optional(),
  buyNowOnly: z.boolean().optional(),
  reserveMetOnly: z.boolean().optional(),
})

// Export constants for use in components
export { LOT_STATUS, SHIPPING_SCOPES, CONDITIONS, ENDING_WITHIN_OPTIONS }

// Type that should match your existing FilterValues
export type AuctionFilterFormValues = z.infer<typeof AuctionFilterSchema>

/**
 * SavedSearchDialog Schema
 */
export const SavedSearchDialogSchema = z.object({
  name: z.string().min(2, 'Please enter a short name'),
  emailAlert: z.boolean().default(false),
})

export type SavedSearchDialogValues = z.infer<typeof SavedSearchDialogSchema>
