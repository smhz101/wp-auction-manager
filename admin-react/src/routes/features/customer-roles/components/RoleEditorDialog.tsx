import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCR } from '../storeAdapter'
import { slugify } from '../utils'
import type { JSX } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const RoleFormSchema = z.object({
  name: z.string().min(2, 'Role name is too short'),
  slug: z
    .string()
    .min(2, 'Slug is too short')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and dashes',
    ),
  description: z.string().optional(),
})
type RoleFormValues = z.infer<typeof RoleFormSchema>

export default function RoleEditorDialog({
  open,
  onOpenChange,
  roleId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  roleId: string
}): JSX.Element {
  const {
    state: { roles },
    actions,
  } = useCR()
  const role = roles.find((r) => r.id === roleId)!
  const isSystem = !!role.isSystem

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
      name: role.name,
      slug: role.slug,
      description: role.description ?? '',
    },
    mode: 'onChange',
  })

  React.useEffect(() => {
    form.reset({
      name: role.name,
      slug: role.slug,
      description: role.description ?? '',
    })
  }, [roleId, open])

  function onSubmit(values: RoleFormValues): void {
    actions.updateRole({
      ...role,
      ...values,
      slug: slugify(values.slug || values.name),
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Edit Role</DialogTitle>
          <DialogDescription>
            Update role name, slug and description.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-1">
            <label className="text-sm" htmlFor="role-name">
              Name
            </label>
            <Input
              id="role-name"
              disabled={isSystem}
              {...form.register('name')}
              onChange={(e) => {
                form.register('name').onChange(e)
                form.setValue(
                  'slug',
                  slugify(e.target.value || form.getValues('slug')),
                  { shouldValidate: true },
                )
              }}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <label className="text-sm" htmlFor="role-slug">
              Slug
            </label>
            <Input
              id="role-slug"
              disabled={isSystem}
              {...form.register('slug', { setValueAs: (v) => slugify(v) })}
            />
            {form.formState.errors.slug && (
              <p className="text-xs text-red-600">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <label className="text-sm" htmlFor="role-desc">
              Description
            </label>
            <Textarea
              id="role-desc"
              disabled={isSystem}
              {...form.register('description')}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSystem || !form.formState.isValid}
            >
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
