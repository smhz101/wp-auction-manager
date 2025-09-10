// /routes/features/sellers-dashboard/components/FiltersForm.tsx

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'

import { FiltersSchema } from '../schema'

import type { JSX } from 'react'
import type { Resolver } from 'react-hook-form'
import type { FiltersFormValues } from '../schema'

export default function FiltersForm(props: {
  defaultValues: FiltersFormValues
  onChange: (v: FiltersFormValues) => void
}): JSX.Element {
  const { defaultValues, onChange } = props

  const form = useForm<FiltersFormValues>({
    defaultValues,
    resolver: zodResolver(
      FiltersSchema,
    ) as unknown as Resolver<FiltersFormValues>,
    mode: 'onChange',
  })

  // push up on change
  form.watch((v) => onChange(v as FiltersFormValues))

  return (
    <div className="flex gap-2">
      <div className="grid gap-1">
        <Label htmlFor="status" className="text-xs text-zinc-600">
          Status
        </Label>
        <Select
          id="status"
          value={form.getValues('status')}
          onValueChange={(v) =>
            form.setValue('status', v as FiltersFormValues['status'], {
              shouldValidate: true,
            })
          }
        >
          <Select.Trigger className="w-48" />
          <Select.Content>
            <Select.Item value="all">All</Select.Item>
            <Select.Item value="live">Live</Select.Item>
            <Select.Item value="scheduled">Scheduled</Select.Item>
            <Select.Item value="ended">Ended</Select.Item>
            <Select.Item value="unsold">Unsold</Select.Item>
            <Select.Item value="paused">Paused</Select.Item>
          </Select.Content>
        </Select>
      </div>
      <div className="grid gap-1">
        <Label htmlFor="q" className="text-xs text-zinc-600">
          Search
        </Label>
        <Input
          id="q"
          placeholder="Search lots…"
          value={form.getValues('q')}
          onChange={(e) =>
            form.setValue('q', e.target.value, { shouldValidate: true })
          }
          className="w-56"
        />
      </div>
    </div>
  )
}
