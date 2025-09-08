import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { SavedSearchDialogSchema } from '../schema'

import type { JSX } from 'react'
import type { FilterValues } from '../types'
import type { Resolver, SubmitHandler } from 'react-hook-form'
import type { SavedSearchDialogValues } from '../schema'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface SavedSearchDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  initialFilters: FilterValues
  onSave: (name: string, values: FilterValues) => void
}

export default function SavedSearchDialog({
  open,
  onOpenChange,
  initialFilters,
  onSave,
}: SavedSearchDialogProps): JSX.Element {
  const form = useForm<SavedSearchDialogValues>({
    resolver: zodResolver(
      SavedSearchDialogSchema,
    ) as unknown as Resolver<SavedSearchDialogValues>,
    defaultValues: { name: '', emailAlert: false },
    mode: 'onChange',
  })

  const onSubmit: SubmitHandler<SavedSearchDialogValues> = (v) => {
    onSave(v.name, initialFilters)
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Save search</DialogTitle>
          <DialogDescription>
            Name this search to reuse it later.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <Label htmlFor="ss-name">Name</Label>
            <Input id="ss-name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!form.formState.isValid}>
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
