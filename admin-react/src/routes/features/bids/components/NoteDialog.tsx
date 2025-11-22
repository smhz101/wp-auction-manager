import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useAppDispatch } from '@/store/hooks'
import { updateBidNote } from '../store'
import { NoteSchema } from '../schema'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { JSX } from 'react'
import type { Resolver } from 'react-hook-form'
import type { NoteFormValues } from '../schema'

type Props = {
  id: string
  initial: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function NoteDialog({
  id,
  initial,
  open,
  onOpenChange,
}: Props): JSX.Element {
  const dispatch = useAppDispatch()
  const form = useForm<NoteFormValues>({
    defaultValues: { note: initial ?? '' },
    resolver: zodResolver(NoteSchema) as unknown as Resolver<NoteFormValues>,
    mode: 'onChange',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            className="space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              await dispatch(updateBidNote({ id, note: values.note }) as any)
              onOpenChange(false)
            })}
          >
            <div>
              <Label className="mb-1 block text-xs text-zinc-600">Note</Label>
              <Textarea
                rows={5}
                {...form.register('note')}
                placeholder="Add a note…"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
