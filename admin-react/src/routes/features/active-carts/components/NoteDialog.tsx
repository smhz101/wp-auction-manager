import { zodResolver } from '@hookform/resolvers/zod'
import { FormProvider, useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'

import { updateNote } from '../store'
import { NoteSchema } from '../schema'
import type { JSX } from 'react'
import type { Resolver } from 'react-hook-form'
import type { NoteFormValues } from '../schema'

import { useAppDispatch } from '@/store/hooks'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

export default function NoteDialog(props: {
  id: string
  initial: string
  open: boolean
  onOpenChange: (v: boolean) => void
}): JSX.Element {
  const dispatch = useAppDispatch()
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<NoteFormValues>({
    defaultValues: { note: props.initial ?? '' },
    resolver: zodResolver(NoteSchema) as unknown as Resolver<NoteFormValues>,
    mode: 'onChange',
  })
  const { handleSubmit, register, reset } = form

  // Keep initial note in sync if dialog is reopened for another row
  useEffect(() => {
    reset({ note: props.initial ?? '' })
  }, [props.initial, reset])

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form
            className="mt-3 grid gap-3"
            onSubmit={handleSubmit(async (v) => {
              try {
                setSubmitting(true)
                await dispatch(
                  updateNote({ id: props.id, note: v.note }),
                ).unwrap()
                props.onOpenChange(false)
              } finally {
                setSubmitting(false)
              }
            })}
          >
            <Textarea
              placeholder="Add a note…"
              rows={5}
              {...register('note')}
            />

            <div className="mt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => props.onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                Save
              </Button>
            </div>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
