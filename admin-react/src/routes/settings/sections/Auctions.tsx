import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import { Button, Grid, Input, Row, Section } from '../components/UI'
import { defaultSettings, fetchSettings, saveSettings } from '../mock/settings'
import type { AnyRoute } from '@tanstack/react-router'

function Auctions() {
  const qc = useQueryClient()
  const { data: initial = defaultSettings() } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 60_000,
  })
  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: (next) => qc.setQueryData(['settings'], next),
  })
  const form = useForm({
    defaultValues: initial,
    onSubmit: async ({ value }) => mutation.mutateAsync(value),
  })

  return (
    <Section title="Auctions">
      <Grid>
        <form.Field
          name="wpam_webhook_url"
          children={(f) => (
            <Row label="Webhook URL">
              <Input
                type="url"
                value={f.state.value}
                onChange={(e) => f.handleChange(e.target.value)}
              />
            </Row>
          )}
        />
        <form.Field
          name="wpam_buyer_premium"
          children={(f) => (
            <Row label="Buyer Premium %">
              <Input
                step="0.01"
                type="number"
                value={String((f.state.value as any) ?? 0)}
                onChange={(e) => f.handleChange(Number(e.target.value) as any)}
              />
            </Row>
          )}
        />
        <form.Field
          name="wpam_seller_fee"
          children={(f) => (
            <Row label="Seller Fee %">
              <Input
                step="0.01"
                type="number"
                value={String((f.state.value as any) ?? 0)}
                onChange={(e) => f.handleChange(Number(e.target.value) as any)}
              />
            </Row>
          )}
        />
      </Grid>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => form.handleSubmit()} type="button">
          Save
        </Button>
      </div>
    </Section>
  )
}

export default (parent: AnyRoute) =>
  createRoute({
    component: Auctions,
    getParentRoute: () => parent,
    path: 'auctions',
  })
