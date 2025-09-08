// /features/help/components/ChangelogList.tsx
import { CHANGELOG } from '../data'
import type { JSX } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function ChangelogList(): JSX.Element {
  return (
    <div className="grid gap-4">
      {CHANGELOG.map((entry) => (
        <Card key={entry.version}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">v{entry.version}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    entry.type === 'Added'
                      ? 'default'
                      : entry.type === 'Changed'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {entry.type}
                </Badge>
                <span className="text-xs text-zinc-500">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <ul className="list-disc pl-5 text-sm">
              {entry.highlights.map((h, idx) => (
                <li key={idx}>{h}</li>
              ))}
            </ul>
            {entry.links && entry.links.length > 0 && (
              <div className="flex gap-2">
                {entry.links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    className="text-xs underline text-zinc-700 hover:text-zinc-900"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
