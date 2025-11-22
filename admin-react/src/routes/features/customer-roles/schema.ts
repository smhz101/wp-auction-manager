import { z } from 'zod'

export const RoleSchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(64),
  isSystem: z.boolean().optional().default(false),
  capabilities: z.array(z.string()).default([]),
})

export type RoleFormValues = z.infer<typeof RoleSchema>

export const UserSchema = z.object({
  displayName: z.string().min(2).max(120),
  email: z.string().email(),
  roles: z.array(z.string()).default([]),
})

export type UserFormValues = z.infer<typeof UserSchema>

export const CapabilitySchema = z.object({
  key: z.string().min(2).max(80),
  label: z.string().min(2).max(120),
  description: z.string().max(400).optional().default(''),
})

export type CapabilityFormValues = z.infer<typeof CapabilitySchema>
