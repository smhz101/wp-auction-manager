// src/lib/form/resolver.ts
import { zodResolver } from '@hookform/resolvers/zod'
import type { Resolver } from 'react-hook-form'
import type { ZodTypeAny } from 'zod'

/**
 * makeResolver(schema) returns a typed react-hook-form Resolver<V>
 * so you don't have to do `as unknown as Resolver<...>` in each dialog.
 */
export function makeResolver<T extends ZodTypeAny, V = unknown>(
  schema: T,
): Resolver<V> {
  return zodResolver(schema) as unknown as Resolver<V>
}
