// /features/help/components/FaqAccordion.tsx
import React from 'react'
import { HelpQueryContext } from '../HelpPage'
import { FAQS } from '../data'
import type { JSX } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export default function FaqAccordion(): JSX.Element {
  const { query } = React.useContext(HelpQueryContext)
  const [local, setLocal] = React.useState<string>('')

  const q = (local || query).toLowerCase().trim()
  const filtered = q
    ? FAQS.filter(
        (f) =>
          f.q.toLowerCase().includes(q) ||
          f.a.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q)),
      )
    : FAQS

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Search FAQs…"
          className="w-64"
        />
        <div className="text-xs text-zinc-500">{filtered.length} result(s)</div>
      </div>

      <Accordion type="multiple" className="rounded-xl border p-2">
        {filtered.map((f) => (
          <AccordionItem key={f.id} value={f.id} id={`faq-${f.id}`}>
            <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-zinc-700">{f.a}</p>
              <div className="mt-2 flex gap-1">
                {f.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-10 text-sm text-zinc-500">
            No FAQs match your search.
          </div>
        )}
      </Accordion>
    </div>
  )
}
