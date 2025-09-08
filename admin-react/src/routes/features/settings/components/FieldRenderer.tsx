// /features/settings/components/FieldRenderer.tsx
import { Controller, useFormContext } from 'react-hook-form'

import type { JSX } from 'react'
import type { FieldDef } from '../fields'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FieldRow(props: { field: FieldDef }): JSX.Element {
  const { field } = props
  const form = useFormContext()

  return (
    <div className="grid gap-1">
      <Label>{field.label}</Label>

      <Controller
        control={form.control}
        name={field.key as any}
        render={({ field: rhf }) => {
          switch (field.type) {
            case 'switch':
              return (
                <Switch checked={!!rhf.value} onCheckedChange={rhf.onChange} />
              )
            case 'number':
              return (
                <Input
                  type="number"
                  value={rhf.value ?? ''}
                  onChange={(e) =>
                    rhf.onChange(
                      e.target.value === '' ? '' : Number(e.target.value),
                    )
                  }
                />
              )
            case 'textarea':
              return (
                <Textarea
                  rows={field.rows ?? 4}
                  placeholder={field.placeholder}
                  value={rhf.value ?? ''}
                  onChange={rhf.onChange}
                />
              )
            case 'select':
              return (
                <Select
                  value={String(rhf.value ?? '')}
                  onValueChange={rhf.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )
            case 'color':
              return (
                <Input
                  type="color"
                  value={rhf.value ?? '#000000'}
                  onChange={rhf.onChange}
                />
              )
            case 'multiselect':
              // simple CSV in/out (keep UI minimal)
              return (
                <Input
                  placeholder={field.placeholder ?? 'a,b,c'}
                  value={
                    Array.isArray(rhf.value)
                      ? (rhf.value as Array<string>).join(',')
                      : (rhf.value ?? '')
                  }
                  onChange={(e) =>
                    rhf.onChange(
                      e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    )
                  }
                />
              )
            case 'text':
            default:
              return (
                <Input
                  placeholder={field.placeholder}
                  value={rhf.value ?? ''}
                  onChange={rhf.onChange}
                />
              )
          }
        }}
      />

      {field.help && <p className="text-xs text-zinc-500">{field.help}</p>}
    </div>
  )
}
