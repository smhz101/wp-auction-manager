import React from 'react'
import { Copy, Pencil, Plus, Trash2 } from 'lucide-react'
import { useCR } from '../store'
import RoleEditorDialog from './RoleEditorDialog'
import CapabilitiesBoard from './CapabilitiesBoard'
import CapabilityManager from './CapabilityManager'
import type { JSX } from 'react'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'

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

export default function RolesTab(): JSX.Element {
  const {
    state: { roles },
    actions,
  } = useCR()
  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(
    roles[0]?.id ?? '',
  )
  const selected = roles.find((r) => r.id === selectedRoleId) ?? roles[0]

  // dialogs
  const [editOpen, setEditOpen] = React.useState<boolean>(false)
  const [deleteOpen, setDeleteOpen] = React.useState<boolean>(false)

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      {/* Sidebar */}
      <div className="rounded-2xl border bg-white">
        <div className="border-b p-3 flex items-center justify-between">
          <div className="text-sm text-zinc-600">Roles</div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // ✅ Pass only the fields allowed by `Omit<Role, 'id' | 'usersCount'>`
              const role = actions.createRole({
                name: 'Custom Role',
                slug: `custom-role-${Math.random().toString(36).slice(2, 7)}`,
                description: 'Describe this role…',
                isSystem: false,
                capabilities: ['view_public', 'watchlist'],
              })
              setSelectedRoleId(role.id)
              setEditOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> New
          </Button>
        </div>
        <ScrollArea className="max-h-[70vh]">
          <div className="p-2 space-y-1">
            {roles.map((role) => (
              <Button
                key={role.id}
                variant={selectedRoleId === role.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedRoleId(role.id)}
              >
                <div className="flex w-full items-center justify-between">
                  <div className="flex gap-3 text-left">
                    <div className="font-medium">{role.name}</div>
                    {/* <div className="text-xs text-zinc-500">/{role.slug}</div> */}
                    {role.isSystem && (
                      <div className="mt-1 text-[10px] inline-block rounded bg-zinc-100 px-1.5 py-0.5 text-zinc-700">
                        System
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary">{role.usersCount}</Badge>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main */}
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">{selected.name}</div>
            <div className="text-xs text-zinc-500">/{selected.slug}</div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const dup = actions.duplicateRole(selected.id)
                if (dup) setSelectedRoleId(dup.id)
              }}
            >
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </Button>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button
              variant="destructive"
              disabled={!!selected.isSystem || selected.usersCount > 0}
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Capabilities for selected role */}
        <div className="mt-6">
          <CapabilitiesBoard role={selected} />
        </div>

        {/* Capability manager table */}
        <div className="mt-6">
          <CapabilityManager />
        </div>
      </div>

      {/* Role edit modal */}
      <RoleEditorDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        roleId={selected.id}
      />

      {/* Delete role confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              You can’t delete system roles or roles with users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                actions.deleteRole(selected.id)
                setDeleteOpen(false)
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
