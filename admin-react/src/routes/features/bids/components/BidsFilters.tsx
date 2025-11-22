import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { FiltersSchema } from '../schema'

import type { JSX } from 'react'
import type { Resolver } from 'react-hook-form'
import type { FiltersFormValues } from '../schema'

type Props = {
  initialValues: FiltersFormValues
  onChange: (partial: Partial<FiltersFormValues>) => void
  onSearch: () => void
}

export default function BidsFilters({
  initialValues,
  onChange,
  onSearch,
}: Props): JSX.Element {
  const form = useForm<FiltersFormValues>({
    defaultValues: initialValues,
    resolver: zodResolver(
      FiltersSchema,
    ) as unknown as Resolver<FiltersFormValues>,
    mode: 'onChange',
  })

  // keep in sync when store updates
  useEffect(() => {
    form.reset(initialValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialValues.q,
    initialValues.status,
    initialValues.min,
    initialValues.max,
    initialValues.from,
    initialValues.to,
  ])

  // push partials up on any change
  useEffect(() => {
    const sub = form.watch((v) => onChange(v as Partial<FiltersFormValues>))
    return () => sub.unsubscribe()
  }, [form, onChange])

  return (
    <FormProvider {...form}>
      <form
        className="grid grid-cols-1 gap-3 md:grid-cols-6"
        onSubmit={(e) => {
          e.preventDefault()
          onSearch()
        }}
      >
        <div className="col-span-2">
          <Label className="mb-1 block text-xs text-zinc-600">Search</Label>
          <Input
            placeholder="Auction, lot, bidder, email…"
            {...form.register('q')}
          />
        </div>

        <div>
          <Label className="mb-1 block text-xs text-zinc-600">Status</Label>
          <Select {...form.register('status')}>
            <option value="all">All</option>
            <option value="leading">Leading</option>
            <option value="outbid">Outbid</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </Select>
        </div>

        <div>
          <Label className="mb-1 block text-xs text-zinc-600">Min</Label>
          <Input type="number" placeholder="£" {...form.register('min')} />
        </div>

        <div>
          <Label className="mb-1 block text-xs text-zinc-600">Max</Label>
          <Input type="number" placeholder="£" {...form.register('max')} />
        </div>

        <div>
          <Label className="mb-1 block text-xs text-zinc-600">From</Label>
          <Input type="date" {...form.register('from')} />
        </div>

        <div>
          <Label className="mb-1 block text-xs text-zinc-600">To</Label>
          <Input type="date" {...form.register('to')} />
        </div>

        <div className="col-span-full flex gap-2">
          <Button type="submit">Apply</Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              form.reset(FiltersSchema.parse({}))
              onSearch()
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
