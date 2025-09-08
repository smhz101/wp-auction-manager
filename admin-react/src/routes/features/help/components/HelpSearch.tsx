// /features/help/components/HelpSearch.tsx
import React from 'react'
import { useRouter } from '@tanstack/react-router'
import { HelpQueryContext } from '../HelpPage'
import { FAQS, GUIDES, QUICK_LINKS } from '../data'
import type { JSX } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'

type Guide = (typeof GUIDES)[number]
type FAQ = (typeof FAQS)[number]

export default function HelpSearch(): JSX.Element {
  const router = useRouter()
  const { query, setQuery } = React.useContext(HelpQueryContext)

  // Activator input → opens modal
  const [open, setOpen] = React.useState<boolean>(false)
  const [local, setLocal] = React.useState<string>(query)

  // keep page-wide query in sync (light debounce feels nicer)
  React.useEffect(() => {
    const id = setTimeout(() => setQuery(local), 120)
    return () => clearTimeout(id)
  }, [local, setQuery])

  // keyboard shortcuts: "/" open, "Escape" close
  React.useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      const tag = (e.target as HTMLElement).tagName
      const typing =
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        (e.target as HTMLElement).isContentEditable
      if (!typing && e.key === '/') {
        e.preventDefault()
        setOpen(true)
      }
      if (open && e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // focus CommandInput when dialog opens
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  React.useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10)
  }, [open])

  const q = (local || query).trim().toLowerCase()
  const topGuides: Array<Guide> = React.useMemo(() => {
    if (!q) return GUIDES.slice(0, 8)
    return GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)),
    ).slice(0, 12)
  }, [q])

  const topFaqs: Array<FAQ> = React.useMemo(() => {
    if (!q) return FAQS.slice(0, 8)
    return FAQS.filter(
      (f) =>
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.tags.some((t) => t.toLowerCase().includes(q)),
    ).slice(0, 12)
  }, [q])

  const topLinks = React.useMemo(() => {
    if (!q) return QUICK_LINKS.slice(0, 6)
    return QUICK_LINKS.filter(
      (l) =>
        l.label.toLowerCase().includes(q) ||
        (l.hint ?? '').toLowerCase().includes(q),
    ).slice(0, 8)
  }, [q])

  // simple highlight
  function highlight(text: string): JSX.Element {
    if (!q) return <>{text}</>
    const idx = text.toLowerCase().indexOf(q)
    if (idx === -1) return <>{text}</>
    const before = text.slice(0, idx)
    const match = text.slice(idx, idx + q.length)
    const after = text.slice(idx + q.length)
    return (
      <>
        {before}
        <mark className="bg-yellow-200/60 rounded px-0.5">{match}</mark>
        {after}
      </>
    )
  }

  function go(to: string, hash?: string): void {
    router.navigate({ to, ...(hash ? { hash } : {}) })
    setOpen(false)
  }

  return (
    <>
      {/* Activator (compact, full-width on small screens) */}
      <div className="relative">
        <Input
          readOnly
          placeholder="Search guides, FAQs, and quick links… (press /)"
          value={local}
          onClick={() => setOpen(true)}
          className="cursor-text"
        />
      </div>

      {/* Focused Search Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden">
          <Command className="rounded-none">
            <CommandInput
              ref={inputRef}
              placeholder="Type to search…"
              value={local}
              onValueChange={setLocal}
            />
            <CommandList>
              <CommandEmpty>No results. Try a different keyword.</CommandEmpty>

              <CommandGroup heading="Quick links">
                {topLinks.map((link) => (
                  <CommandItem key={link.href} onSelect={() => go(link.href)}>
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {highlight(link.label)}
                      </span>
                      {link.hint && (
                        <span className="text-xs text-zinc-500">
                          {highlight(link.hint)}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="Guides">
                {topGuides.map((g) => (
                  <CommandItem
                    key={g.id}
                    onSelect={() => go('/help', `guide-${g.id}`)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{highlight(g.title)}</span>
                      <span className="text-xs text-zinc-500">
                        {highlight(g.summary)}
                      </span>
                      <div className="mt-1 flex gap-1">
                        {g.tags.map((t) => (
                          <Badge key={t} variant="outline">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>

              <CommandGroup heading="FAQs">
                {topFaqs.map((f) => (
                  <CommandItem
                    key={f.id}
                    onSelect={() => go('/help', `faq-${f.id}`)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{highlight(f.q)}</span>
                      <span className="text-xs text-zinc-500 line-clamp-1">
                        {highlight(f.a)}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  )
}
