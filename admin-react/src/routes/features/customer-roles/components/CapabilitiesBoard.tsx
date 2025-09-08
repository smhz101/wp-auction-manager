import React from 'react'

import { GROUPS } from '../seed'
import { useCR } from '../store'
import type { Role } from '../types'

import type { JSX } from 'react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'

export default function CapabilitiesBoard({
  role,
}: {
  role: Role
}): JSX.Element {
  const {
    state: { capabilities },
    actions,
  } = useCR()
  const [q, setQ] = React.useState<string>('')

  const filtered = React.useMemo(() => {
    if (!q.trim()) return capabilities
    const t = q.toLowerCase()
    return capabilities.filter(
      (c) =>
        c.key.toLowerCase().includes(t) ||
        c.label.toLowerCase().includes(t) ||
        (c.help ?? '').toLowerCase().includes(t),
    )
  }, [capabilities, q])

  function toggle(key: string): void {
    if (role.isSystem) return
    const has = role.capabilities.includes(key)
    const next = {
      ...role,
      capabilities: has
        ? role.capabilities.filter((k) => k !== key)
        : [...role.capabilities, key],
    }
    actions.updateRole(next)
  }

  function setGroup(group: string, enabled: boolean): void {
    if (role.isSystem) return
    const keys = filtered.filter((c) => c.group === group).map((c) => c.key)
    const set = new Set<string>(role.capabilities)
    enabled
      ? keys.forEach((k) => set.add(k))
      : keys.forEach((k) => set.delete(k))
    actions.updateRole({ ...role, capabilities: Array.from(set) })
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Capabilities</h3>
        <div className="flex items-center gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search capabilities…"
            className="w-64"
          />
          <Button variant="outline" onClick={() => setQ('')}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {GROUPS.map((group) => {
          const caps = filtered.filter((c) => c.group === group)
          if (caps.length === 0) return null
          const allOn = caps.every((c) => role.capabilities.includes(c.key))
          const anyOn =
            !allOn && caps.some((c) => role.capabilities.includes(c.key))
          return (
            <div key={group} className="rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="font-medium">{group}</div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!role.isSystem}
                    onClick={() => setGroup(group, true)}
                  >
                    Select all
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!!role.isSystem}
                    onClick={() => setGroup(group, false)}
                  >
                    Clear
                  </Button>
                  <span className="text-xs text-zinc-500">
                    {allOn ? 'All' : anyOn ? 'Some' : 'None'}
                  </span>
                </div>
              </div>
              <ul className="space-y-2">
                {caps.map((cap) => {
                  const checked = role.capabilities.includes(cap.key)
                  return (
                    <li key={cap.key} className="flex items-start gap-2">
                      <Checkbox
                        checked={checked}
                        disabled={!!role.isSystem}
                        onCheckedChange={() => toggle(cap.key)}
                        className="mt-1"
                      />
                      <div>
                        <div className="text-sm font-medium">{cap.label}</div>
                        <div className="text-xs text-zinc-500">
                          <code className="rounded bg-zinc-100 px-1">
                            {cap.key}
                          </code>
                          {cap.help ? ` — ${cap.help}` : ''}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
