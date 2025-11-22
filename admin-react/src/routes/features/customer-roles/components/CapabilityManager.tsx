import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, Trash2 } from 'lucide-react'
import { useCR } from '../storeAdapter'
import { GROUPS } from '../seed'
import { slugify } from '../utils'
import type { Capability, CapabilityGroup } from '../types'
import type { JSX } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const CapabilitySchema = z.object({
  key: z
    .string()
    .min(2, 'Key is too short')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Use lowercase letters, numbers, and dashes',
    ),
  label: z.string().min(2, 'Label is too short'),
  group: z.enum(['Access', 'Bidding', 'Payments', 'Perks']),
  help: z.string().optional(),
})
type CapabilityValues = z.infer<typeof CapabilitySchema>

export default function CapabilityManager(): JSX.Element {
  const {
    state: { capabilities },
    actions,
  } = useCR()

  const [capOpen, setCapOpen] = React.useState<boolean>(false)
  const [delOpen, setDelOpen] = React.useState<boolean>(false)
  const [toDelete, setToDelete] = React.useState<Capability | null>(null)

  const form = useForm<CapabilityValues>({
    resolver: zodResolver(CapabilitySchema),
    defaultValues: { key: '', label: '', group: 'Access', help: '' },
    mode: 'onChange',
  })

  function openNew(): void {
    form.reset({ key: '', label: '', group: 'Access', help: '' })
    setCapOpen(true)
  }

  function save(values: CapabilityValues): void {
    actions.upsertCapability({ ...values, key: slugify(values.key) })
    setCapOpen(false)
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Capability Manager</h4>
        <Button variant="outline" size="sm" onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" /> New capability
        </Button>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-600">
            <tr>
              <th className="px-2 py-2">Key</th>
              <th className="px-2 py-2">Label</th>
              <th className="px-2 py-2">Group</th>
              <th className="px-2 py-2">Help</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {capabilities.map((c) => (
              <tr key={c.key} className="border-t">
                <td className="px-2 py-2 font-mono text-xs">{c.key}</td>
                <td className="px-2 py-2">
                  <Input
                    value={c.label}
                    onChange={(e) =>
                      actions.upsertCapability({ ...c, label: e.target.value })
                    }
                    className="w-56"
                  />
                </td>
                <td className="px-2 py-2">
                  <Select
                    value={c.group}
                    onValueChange={(v) =>
                      actions.upsertCapability({
                        ...c,
                        group: v as CapabilityGroup,
                      })
                    }
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GROUPS.map((g) => (
                        <SelectItem key={g} value={g}>
                          {g}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-2 py-2">
                  <Input
                    value={c.help ?? ''}
                    onChange={(e) =>
                      actions.upsertCapability({ ...c, help: e.target.value })
                    }
                    className="w-72"
                  />
                </td>
                <td className="px-2 py-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setToDelete(c)
                      setDelOpen(true)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </td>
              </tr>
            ))}
            {capabilities.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-2 py-10 text-center text-zinc-500"
                >
                  No capabilities.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Capability (react-hook-form + zod) */}
      <Dialog open={capOpen} onOpenChange={setCapOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Create Capability</DialogTitle>
            <DialogDescription>
              Add a new capability and its group.
            </DialogDescription>
          </DialogHeader>

          <form className="grid gap-3" onSubmit={form.handleSubmit(save)}>
            <div className="grid gap-1">
              <label className="text-sm" htmlFor="cap-key">
                Key
              </label>
              <Input
                id="cap-key"
                {...form.register('key', { setValueAs: (v) => slugify(v) })}
              />
              {form.formState.errors.key && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.key.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <label className="text-sm" htmlFor="cap-label">
                Label
              </label>
              <Input id="cap-label" {...form.register('label')} />
              {form.formState.errors.label && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.label.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Group</label>
              <Select
                value={form.getValues('group')}
                onValueChange={(v) =>
                  form.setValue('group', v as CapabilityGroup, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GROUPS.map((g) => (
                    <SelectItem key={g} value={g}>
                      {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.group && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.group.message}
                </p>
              )}
            </div>
            <div className="grid gap-1">
              <label className="text-sm" htmlFor="cap-help">
                Help
              </label>
              <Input id="cap-help" {...form.register('help')} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCapOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!form.formState.isValid}>
                Save capability
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete capability?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove it from all roles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (toDelete) actions.deleteCapability(toDelete.key)
                setDelOpen(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
