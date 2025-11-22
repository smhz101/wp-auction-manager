import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { selectCR } from '../store'
import type { UserStatus } from '../types'
import type { JSX } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const UserFormSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  email: z.string().email('Invalid email'),
  status: z.enum(['active', 'pending', 'banned']),
  roles: z.array(z.string()).min(1, 'Select at least one role'),
})
type UserFormValues = z.infer<typeof UserFormSchema>

export function CreateEditUserDialog({
  open,
  onOpenChange,
  userId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  userId: string | null
}): JSX.Element {
  const {
    state: { users, roles },
    actions,
  } = selectCR()
  const editing = users.find((u) => u.id === userId) ?? null

  const form = useForm<UserFormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: editing
      ? {
          name: editing.name,
          email: editing.email,
          status: editing.status,
          roles: [...editing.roles],
        }
      : { name: '', email: '', status: 'active', roles: ['registered'] },
    mode: 'onChange',
  })

  React.useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        email: editing.email,
        status: editing.status,
        roles: [...editing.roles],
      })
    } else {
      form.reset({
        name: '',
        email: '',
        status: 'active',
        roles: ['registered'],
      })
    }
  }, [editing, open])

  function onSubmit(values: UserFormValues): void {
    if (editing) {
      actions.updateUser({ ...editing, ...values })
    } else {
      actions.createUser(values as any) // id/createdAt are added in action
    }
    onOpenChange(false)
  }

  const selectedRoles = form.watch('roles')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>Manage user details and roles.</DialogDescription>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label>Status</Label>
            <Select
              value={form.getValues('status')}
              onValueChange={(v) =>
                form.setValue('status', v as UserStatus, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.status && (
              <p className="text-xs text-red-600">
                {form.formState.errors.status.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label>Roles</Label>
            <div className="flex flex-wrap gap-2">
              {roles.map((r) => {
                const checked = selectedRoles.includes(r.slug)
                return (
                  <Button
                    key={r.slug}
                    type="button"
                    variant={checked ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const set = new Set<string>(form.getValues('roles'))
                      checked ? set.delete(r.slug) : set.add(r.slug)
                      form.setValue('roles', Array.from(set), {
                        shouldValidate: true,
                      })
                    }}
                  >
                    {r.name}
                  </Button>
                )
              })}
            </div>
            {form.formState.errors.roles && (
              <p className="text-xs text-red-600">
                {form.formState.errors.roles.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!form.formState.isValid}>
              {editing ? 'Save changes' : 'Create user'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DeleteUsersAlert({
  open,
  onOpenChange,
  ids,
  onDone,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  ids: Array<string>
  onDone: () => void
}): JSX.Element {
  const { actions } = useCR()
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {ids.length} user(s)?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => {
              actions.deleteUsers(ids)
              onDone()
              onOpenChange(false)
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
