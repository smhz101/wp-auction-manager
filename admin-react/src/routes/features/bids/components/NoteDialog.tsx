// /features/bids/components/NoteDialog.tsx

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { NoteSchema } from '../schema'
import { updateNote, useAppDispatch } from '../store'

import type { JSX } from 'react'
import type { NoteFormValues } from '../schema'
import type { Resolver } from 'react-hook-form'

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

export default function NoteDialog(props: {
  id: string
  initial: string
  open: boolean
  onOpenChange: (v: boolean) => void
}): JSX.Element {
  const { id, initial, open, onOpenChange } = props
  const dispatch = useAppDispatch()

  const form = useForm<NoteFormValues>({
    defaultValues: { note: initial },
    resolver: zodResolver(NoteSchema) as unknown as Resolver<NoteFormValues>,
    mode: 'onChange',
  })

  function submit(v: NoteFormValues): void {
    void dispatch(updateNote({ id, note: v.note })).then(() =>
      onOpenChange(false),
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
          <DialogDescription>
            Keep notes short and actionable.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-1">
            <Label htmlFor="note">Note</Label>
            <Input id="note" {...form.register('note')} />
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
