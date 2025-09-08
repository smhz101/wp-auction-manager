// /features/settings/components/Shell.tsx

import type { JSX } from 'react'
import type { Section } from '../fields'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'

export default function Shell(props: {
  sections: Array<Section>
  activeId: string
  onSelect: (id: string) => void
  children: JSX.Element
}): JSX.Element {
  const { sections, activeId, onSelect, children } = props

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="rounded-2xl border bg-white">
        <div className="border-b p-3 text-sm text-zinc-600">Settings</div>
        <ScrollArea className="max-h-[78vh]">
          <div className="p-2 space-y-1">
            {sections.map((s) => (
              <Button
                key={s.id}
                variant={activeId === s.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => onSelect(s.id)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-4">{children}</div>
    </div>
  )
}
