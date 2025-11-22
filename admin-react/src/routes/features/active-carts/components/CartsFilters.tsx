import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, FormProvider, useForm } from 'react-hook-form'

import { setFilters } from '../store'
import { FiltersSchema } from '../schema'

import type { JSX } from 'react'
import type { Resolver } from 'react-hook-form'
import type { FiltersFormValues } from '../schema'

import { useAppDispatch, useAppSelector } from '@/store/hooks'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CartsFilters(props: {
  onSearch: () => void
}): JSX.Element {
  const dispatch = useAppDispatch()
  const values = useAppSelector((s) => s.carts.filters)

  const form = useForm<FiltersFormValues>({
    defaultValues: values,
    resolver: zodResolver(
      FiltersSchema,
    ) as unknown as Resolver<FiltersFormValues>,
    mode: 'onChange',
  })
  const { register, control, handleSubmit, reset } = form

  return (
    <FormProvider {...form}>
      <form
        className="grid grid-cols-1 gap-3 md:grid-cols-4"
        onSubmit={handleSubmit((v) => {
          dispatch(setFilters(v))
          props.onSearch()
        })}
      >
        {/* q */}
        <Input placeholder="Search name or email…" {...register('q')} />

        {/* status (use Controller for shadcn Select) */}
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="abandoned">Abandoned</SelectItem>
                <SelectItem value="recovering">Recovering</SelectItem>
              </SelectContent>
            </Select>
          )}
        />

        {/* from */}
        <Input type="date" {...register('from')} />

        {/* to */}
        <Input type="date" {...register('to')} />

        <div className="md:col-span-4">
          <Button type="submit">Apply</Button>
          <Button
            type="button"
            className="ml-2"
            variant="ghost"
            onClick={() => {
              reset()
              // optional: also push default filters to store
              dispatch(setFilters(FiltersSchema.parse({})))
              props.onSearch()
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
