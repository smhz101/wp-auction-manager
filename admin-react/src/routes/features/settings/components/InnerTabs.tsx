// /features/settings/components/InnerTabs.tsx

import { FieldRow } from './FieldRenderer'
import type { JSX } from 'react'
import type { Section } from '../fields'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function InnerTabs(props: { section: Section }): JSX.Element {
  const { section } = props
  const first = section.groups[0]?.id ?? 'general'

  return (
    <Tabs defaultValue={first} className="space-y-4">
      <TabsList>
        {section.groups.map((g) => (
          <TabsTrigger key={g.id} value={g.id}>
            {g.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {section.groups.map((g) => (
        <TabsContent key={g.id} value={g.id}>
          <div className="grid gap-4 md:grid-cols-2">
            {g.fields.map((f) => (
              <FieldRow key={String(f.key)} field={f} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
