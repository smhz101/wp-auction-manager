// /features/help/components/GuidesGrid.tsx
import React from 'react'
import { HelpQueryContext } from '../HelpPage'
import { GUIDES } from '../data'
import type { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export default function GuidesGrid(): JSX.Element {
  const { query } = React.useContext(HelpQueryContext)
  const [openId, setOpenId] = React.useState<string>('')

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GUIDES
    return GUIDES.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q) ||
        g.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [query])

  const open = !!openId
  const active = filtered.find((g) => g.id === openId) ?? null

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((g) => (
          <Card key={g.id} id={`guide-${g.id}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-base">{g.title}</span>
                <Badge variant="outline">{g.audience}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-zinc-600">{g.summary}</p>
              <div className="flex flex-wrap gap-1">
                {g.tags.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
              <div className="text-xs text-zinc-500">
                Updated {new Date(g.lastUpdated).toLocaleDateString()}
              </div>
              <Button variant="outline" onClick={() => setOpenId(g.id)}>
                Read guide
              </Button>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-sm text-zinc-500">
            No guides match your search.
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          if (!v) setOpenId('')
        }}
      >
        <DialogContent className="sm:max-w-[720px]">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle>{active.title}</DialogTitle>
              </DialogHeader>
              <div className="prose prose-zinc max-w-none text-sm">
                <pre className="whitespace-pre-wrap text-sm">
                  {active.content}
                </pre>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
