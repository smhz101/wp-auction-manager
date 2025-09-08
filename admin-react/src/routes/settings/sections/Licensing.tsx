import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import { Button, Grid, Input, Row, Section } from '../components/UI'
import { defaultSettings, fetchSettings, saveSettings } from '../mock/settings'
import type { AnyRoute } from '@tanstack/react-router'

function Licensing() {
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
    <Section title="Licensing">
      <Grid>
        <form.Field
          name="wpam_license_key"
          children={(f) => (
            <Row label="License Key">
              <Input
                autoComplete="off"
                value={f.state.value ?? ''}
                onChange={(e) => f.handleChange(e.target.value)}
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
    component: Licensing,
    getParentRoute: () => parent,
    path: 'licensing',
  })
