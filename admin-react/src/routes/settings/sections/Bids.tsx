import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import { Button, Grid, Input, Row, Section, Switch } from '../components/UI'
import { defaultSettings, fetchSettings, saveSettings } from '../mock/settings'
import type { AnyRoute } from '@tanstack/react-router'

function Bids() {
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
    <Section title="Bids">
      <Grid>
        <form.Field
          name="wpam_enable_silent_bidding"
          children={(f) => (
            <Row label="Silent Bidding">
              <div className="flex items-center gap-3">
                <Switch checked={f.state.value} onChange={f.handleChange} />
                <span className="text-sm">
                  {f.state.value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </Row>
          )}
        />
        <form.Field
          name="wpam_enable_proxy_bidding"
          children={(f) => (
            <Row label="Proxy Bidding">
              <div className="flex items-center gap-3">
                <Switch checked={f.state.value} onChange={f.handleChange} />
                <span className="text-sm">
                  {f.state.value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </Row>
          )}
        />
        <form.Field
          name="wpam_default_increment"
          children={(f) => (
            <Row label="Default Increment">
              <Input
                step="0.01"
                type="number"
                value={String(f.state.value)}
                onChange={(e) => f.handleChange(Number(e.target.value))}
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
    component: Bids,
    getParentRoute: () => parent,
    path: 'bids',
  })
