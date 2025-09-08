// /features/help/components/ContactSupportDialog.tsx
import React from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type { JSX } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const SupportSchema = z.object({
  email: z.string().email('Enter a valid email'),
  category: z.enum([
    'General',
    'Active Carts',
    'Roles & Capabilities',
    'Sellers',
    'Public Auctions',
  ]),
  subject: z.string().min(4, 'Please write a brief subject'),
  message: z.string().min(10, 'Tell us a bit more so we can help'),
  attachmentUrl: z.string().url().optional().or(z.literal('')),
})
type SupportValues = z.infer<typeof SupportSchema>

export default function ContactSupportDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}): JSX.Element {
  const form = useForm<SupportValues>({
    resolver: zodResolver(SupportSchema),
    defaultValues: {
      email: '',
      category: 'General',
      subject: '',
      message: '',
      attachmentUrl: '',
    },
    mode: 'onChange',
  })

  function submit(values: SupportValues): void {
    // Wire to your API here (e.g., fetch('/api/support', { method:'POST', body: JSON.stringify(values) }))
    console.log('Support ticket:', values)
    onOpenChange(false)
    form.reset()
  }

  const severityHint = React.useMemo(() => {
    switch (form.watch('category')) {
      case 'Active Carts':
        return 'Payments'
      case 'Roles & Capabilities':
        return 'Access'
      case 'Sellers':
        return 'Operations'
      default:
        return 'General'
    }
  }, [form])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Contact Support</DialogTitle>
          <DialogDescription>
            We usually reply within one business day.
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-3" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register('email')} />
            {form.formState.errors.email && (
              <p className="text-xs text-red-600">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label>Category</Label>
            <Select
              value={form.getValues('category')}
              onValueChange={(v) =>
                form.setValue('category', v as SupportValues['category'], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="Active Carts">Active Carts</SelectItem>
                <SelectItem value="Roles & Capabilities">
                  Roles & Capabilities
                </SelectItem>
                <SelectItem value="Sellers">Sellers</SelectItem>
                <SelectItem value="Public Auctions">Public Auctions</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-xs text-zinc-500">
              Triage: <Badge variant="secondary">{severityHint}</Badge>
            </div>
          </div>

          <div className="grid gap-1">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...form.register('subject')} />
            {form.formState.errors.subject && (
              <p className="text-xs text-red-600">
                {form.formState.errors.subject.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={6} {...form.register('message')} />
            {form.formState.errors.message && (
              <p className="text-xs text-red-600">
                {form.formState.errors.message.message}
              </p>
            )}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="attachment">Attachment URL (optional)</Label>
            <Input
              id="attachment"
              placeholder="https://…"
              {...form.register('attachmentUrl')}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!form.formState.isValid}>
              Send
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
