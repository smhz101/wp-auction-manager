// /features/public-auctions/components/AuctionsFilters.tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { CATEGORIES } from '../data'
import {
  AuctionFilterSchema,
  CONDITIONS,
  ENDING_WITHIN_OPTIONS,
  LOT_STATUS,
  SHIPPING_SCOPES,
} from '../schema'
import type { JSX } from 'react'
import type { FilterValues, LotStatus, ShippingScope } from '../types'
import type { AuctionFilterFormValues } from '../schema'
import type { Resolver } from 'react-hook-form'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface AuctionsFiltersProps {
  defaultValues: FilterValues
  onChange: (values: FilterValues) => void
  onClear: () => void
}

export default function AuctionsFilters({
  defaultValues,
  onChange,
  onClear,
}: AuctionsFiltersProps): JSX.Element {
  const form = useForm<AuctionFilterFormValues>({
    defaultValues: {
      query: defaultValues.query || '',
      categories: defaultValues.categories,
      status: defaultValues.status,
      minPrice: defaultValues.minPrice,
      maxPrice: defaultValues.maxPrice,
      endingWithin: defaultValues.endingWithin,
      shipping: defaultValues.shipping,
      condition: defaultValues.condition,
      buyNowOnly: defaultValues.buyNowOnly,
      reserveMetOnly: defaultValues.reserveMetOnly,
    },
    resolver: zodResolver(
      AuctionFilterSchema,
    ) as unknown as Resolver<AuctionFilterFormValues>,
    mode: 'onChange',
  })

  // Subscribe exactly once to avoid render → watch → setState loops
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    const subscription = form.watch((values) => {
      onChangeRef.current(values as FilterValues)
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Read-only watch for rendering (does not re-subscribe each render)
  const values = useWatch({ control: form.control })

  function toggleArrayField(
    field: keyof AuctionFilterFormValues,
    item: string,
  ): void {
    const current = form.getValues(field) as Array<string>
    const set = new Set<string>(current)

    if (set.has(item)) {
      set.delete(item)
    } else {
      set.add(item)
    }

    form.setValue(field, Array.from(set) as any, { shouldValidate: true })
  }

  const handleClearFilters = () => {
    form.reset({
      query: '',
      categories: [],
      status: [],
      minPrice: undefined,
      maxPrice: undefined,
      endingWithin: undefined,
      shipping: undefined,
      condition: undefined,
      buyNowOnly: undefined,
      reserveMetOnly: undefined,
    })
    onClear()
  }

  return (
    <div className="rounded-2xl border bg-white">
      <ScrollArea className="max-h-[78vh]">
        <div className="p-4 space-y-5">
          <div>
            <Label htmlFor="q" className="text-xs text-zinc-600">
              Search
            </Label>
            <Input
              id="q"
              placeholder="Title, tag, seller…"
              {...form.register('query')}
            />
          </div>

          <Separator />

          <section>
            <div className="mb-2 font-medium">Categories</div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => {
                const isSelected =
                  values.categories?.includes(category) ?? false
                return (
                  <Badge
                    key={category}
                    variant={isSelected ? 'default' : 'secondary'}
                    className="cursor-pointer"
                    onClick={() => toggleArrayField('categories', category)}
                  >
                    {category}
                  </Badge>
                )
              })}
            </div>
          </section>

          <section>
            <div className="mb-2 font-medium">Price</div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                {...form.register('minPrice')}
                className="w-24"
              />
              <span className="text-zinc-400">—</span>
              <Input
                type="number"
                placeholder="Max"
                {...form.register('maxPrice')}
                className="w-24"
              />
            </div>
          </section>

          <section>
            <div className="mb-2 font-medium">Status</div>
            <div className="grid grid-cols-2 gap-2">
              {LOT_STATUS.map((status) => (
                <label key={status} className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      values.status?.includes(status as LotStatus) ?? false
                    }
                    onCheckedChange={() => toggleArrayField('status', status)}
                  />
                  <span className="capitalize">{status}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 font-medium">Ending within</div>
            <div className="flex flex-wrap gap-2">
              {ENDING_WITHIN_OPTIONS.map((option) => (
                <Badge
                  key={option}
                  variant={
                    values.endingWithin === option ? 'default' : 'secondary'
                  }
                  className="cursor-pointer"
                  onClick={() =>
                    form.setValue(
                      'endingWithin',
                      values.endingWithin === option ? undefined : option,
                      { shouldValidate: true },
                    )
                  }
                >
                  {option}
                </Badge>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 font-medium">Shipping</div>
            <div className="grid grid-cols-2 gap-2">
              {SHIPPING_SCOPES.map((scope) => (
                <label key={scope} className="flex items-center gap-2">
                  <Checkbox
                    checked={
                      values.shipping?.includes(scope as ShippingScope) ?? false
                    }
                    onCheckedChange={() => toggleArrayField('shipping', scope)}
                  />
                  <span className="capitalize">{scope}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-2 font-medium">Condition</div>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map((condition) => (
                <label key={condition} className="flex items-center gap-2">
                  <Checkbox
                    checked={values.condition?.includes(condition) ?? false}
                    onCheckedChange={() =>
                      toggleArrayField('condition', condition)
                    }
                  />
                  <span className="capitalize">{condition}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="grid gap-2">
            <label className="flex items-center gap-2">
              <Checkbox
                checked={values.buyNowOnly ?? false}
                onCheckedChange={(checked) =>
                  form.setValue('buyNowOnly', Boolean(checked), {
                    shouldValidate: true,
                  })
                }
              />
              <span>Buy Now only</span>
            </label>
            <label className="flex items-center gap-2">
              <Checkbox
                checked={values.reserveMetOnly ?? false}
                onCheckedChange={(checked) =>
                  form.setValue('reserveMetOnly', Boolean(checked), {
                    shouldValidate: true,
                  })
                }
              />
              <span>Reserve met</span>
            </label>
          </section>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
