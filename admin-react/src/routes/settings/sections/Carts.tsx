import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import { Button, Grid, Row, Section, Switch } from '../components/UI'
import { defaultSettings, fetchSettings, saveSettings } from '../mock/settings'
import type { AnyRoute } from '@tanstack/react-router'

function Carts() {
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
    <Section title="Carts">
      <Grid>
        <form.Field
          name="wpam_enable_toasts"
          children={(f) => (
            <Row label="Admin Toasts">
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
          name="wpam_enable_email"
          children={(f) => (
            <Row label="Cart Email Notifications">
              <div className="flex items-center gap-3">
                <Switch checked={f.state.value} onChange={f.handleChange} />
                <span className="text-sm">
                  {f.state.value ? 'Enabled' : 'Disabled'}
                </span>
              </div>
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
    component: Carts,
    getParentRoute: () => parent,
    path: 'carts',
  })
