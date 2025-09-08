import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import {
  Button,
  Grid,
  Input,
  Row,
  Section,
  Select,
  Switch,
} from '../components/UI'
import { defaultSettings, fetchSettings, saveSettings } from '../mock/settings'
import type { AnyRoute } from '@tanstack/react-router'

function Providers() {
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
    <div className="flex flex-col gap-4">
      <Section title="Providers">
        <Grid>
          <form.Field
            name="wpam_enable_email"
            children={(f) => (
              <Row label="Email Notifications">
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
            name="wpam_enable_twilio"
            children={(f) => (
              <Row label="Twilio">
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
            name="wpam_enable_firebase"
            children={(f) => (
              <Row label="Firebase">
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
            name="wpam_realtime_provider"
            children={(f) => (
              <Row label="Realtime Provider">
                <Select
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value as any)}
                >
                  <option value="none">None</option>
                  <option value="pusher">Pusher</option>
                </Select>
              </Row>
            )}
          />
        </Grid>
      </Section>

      <Section title="Credentials & Keys">
        <Grid>
          <form.Field
            name="wpam_sendgrid_key"
            children={(f) => (
              <Row label="SendGrid API Key">
                <Input
                  autoComplete="off"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_firebase_server_key"
            children={(f) => (
              <Row label="Firebase Server Key">
                <Input
                  autoComplete="off"
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_twilio_sid"
            children={(f) => (
              <Row label="Twilio SID">
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_twilio_token"
            children={(f) => (
              <Row label="Twilio Token">
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_twilio_from"
            children={(f) => (
              <Row label="Twilio From Number">
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_pusher_app_id"
            children={(f) => (
              <Row label="Pusher App ID">
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_pusher_key"
            children={(f) => (
              <Row label="Pusher Key">
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_pusher_secret"
            children={(f) => (
              <Row label="Pusher Secret">
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_pusher_cluster"
            children={(f) => (
              <Row label="Pusher Cluster">
                <Input
                  value={f.state.value}
                  onChange={(e) => f.handleChange(e.target.value)}
                />
              </Row>
            )}
          />
        </Grid>
      </Section>

      <div className="flex justify-end">
        <Button onClick={() => form.handleSubmit()} type="button">
          Save
        </Button>
      </div>
    </div>
  )
}

export default (parent: AnyRoute) =>
  createRoute({
    component: Providers,
    getParentRoute: () => parent,
    path: 'providers',
  })
