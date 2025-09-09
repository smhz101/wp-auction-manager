// /features/bids/components/BidsFilters.tsx

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { FiltersSchema } from '../schema'
import { fetchBids, setFilters, useAppDispatch, useAppSelector } from '../store'

import type { JSX } from 'react'
import type { FiltersFormValues } from '../schema'
import type { Resolver } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function BidsFilters(): JSX.Element {
  const dispatch = useAppDispatch()
  const filters = useAppSelector((s) => s.bids.filters)

  const form = useForm<FiltersFormValues>({
    defaultValues: filters,
    resolver: zodResolver(
      FiltersSchema,
    ) as unknown as Resolver<FiltersFormValues>,
    mode: 'onChange',
  })

  useEffect(() => {
    form.reset(filters)
  }, [filters])

  useEffect(() => {
    const sub = form.watch((v) => {
      dispatch(setFilters(v as FiltersFormValues))
      dispatch(fetchBids())
    })
    return () => sub.unsubscribe()
  }, [dispatch, form])

  return (
    <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-6">
      <div className="grid gap-1">
        <Label htmlFor="q">Search</Label>
        <Input
          id="q"
          placeholder="Auction, lot, bidder, email…"
          {...form.register('q')}
        />
      </div>

      <div className="grid gap-1">
        <Label>Status</Label>
        <Select
          value={form.getValues('status')}
          onValueChange={(v) =>
            form.setValue('status', v as any, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="leading">Leading</SelectItem>
            <SelectItem value="outbid">Outbid</SelectItem>
            <SelectItem value="won">Won</SelectItem>
            <SelectItem value="lost">Lost</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-1">
        <Label htmlFor="min">Min</Label>
        <Input
          id="min"
          type="number"
          placeholder="Min $"
          {...form.register('min')}
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="max">Max</Label>
        <Input
          id="max"
          type="number"
          placeholder="Max $"
          {...form.register('max')}
        />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="from">From</Label>
        <Input id="from" type="date" {...form.register('from')} />
      </div>

      <div className="grid gap-1">
        <Label htmlFor="to">To</Label>
        <Input id="to" type="date" {...form.register('to')} />
      </div>
    </div>
  )
}
