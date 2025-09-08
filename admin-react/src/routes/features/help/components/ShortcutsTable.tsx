// /features/help/components/ShortcutsTable.tsx
import { SHORTCUTS } from '../data'
import type { JSX } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ShortcutsTable(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Keyboard Shortcuts</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-zinc-600">
            <tr>
              <th className="px-3 py-2">Scope</th>
              <th className="px-3 py-2">Combo</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {SHORTCUTS.map((s, i) => (
              <tr key={`${s.scope}-${i}`} className="border-t">
                <td className="px-3 py-2">{s.scope}</td>
                <td className="px-3 py-2 font-mono">{s.combo}</td>
                <td className="px-3 py-2">{s.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
