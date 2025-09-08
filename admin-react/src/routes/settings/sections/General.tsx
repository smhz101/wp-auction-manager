import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import { Grid, Input, Row, Section, Select, Switch } from '../components/UI'
import { Button } from '../../../components/ui/button'
import { defaultSettings, fetchSettings, saveSettings } from '../mock/settings'
import type { AnyRoute } from '@tanstack/react-router'

export function General() {
  const qc = useQueryClient()
  const { data: initial = defaultSettings(), isLoading } = useQuery({
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
      <Section title="Auction Defaults">
        {isLoading ? (
          <div className="text-sm text-zinc-600">Loading…</div>
        ) : null}
        <Grid>
          <form.Field
            name="wpam_soft_close_threshold"
            children={(f) => (
              <Row label="Soft Close Threshold (seconds)">
                <Input
                  type="number"
                  value={String(f.state.value)}
                  onChange={(e) => f.handleChange(Number(e.target.value))}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_soft_close_extend"
            children={(f) => (
              <Row label="Extension Duration (seconds)">
                <Input
                  type="number"
                  value={String(f.state.value)}
                  onChange={(e) => f.handleChange(Number(e.target.value))}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_max_extensions"
            children={(f) => (
              <Row label="Maximum Extensions">
                <Input
                  type="number"
                  value={String(f.state.value)}
                  onChange={(e) => f.handleChange(Number(e.target.value))}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_default_increment"
            children={(f) => (
              <Row label="Default Bid Increment">
                <Input
                  step="0.01"
                  type="number"
                  value={String(f.state.value)}
                  onChange={(e) => f.handleChange(Number(e.target.value))}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_default_relist_limit"
            children={(f) => (
              <Row label="Default Relist Limit">
                <Input
                  type="number"
                  value={String(f.state.value)}
                  onChange={(e) => f.handleChange(Number(e.target.value))}
                />
              </Row>
            )}
          />
          <form.Field
            name="wpam_soft_close"
            children={(f) => (
              <Row label="Soft Close Duration (minutes)">
                <Input
                  type="number"
                  value={String(f.state.value)}
                  onChange={(e) => f.handleChange(Number(e.target.value))}
                />
              </Row>
            )}
          />
        </Grid>
      </Section>

      <Section title="Features">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
            name="wpam_require_kyc"
            children={(f) => (
              <Row label="Require KYC">
                <div className="flex items-center gap-3">
                  <Switch checked={f.state.value} onChange={f.handleChange} />
                  <span className="text-sm">
                    {f.state.value ? 'Required' : 'Not required'}
                  </span>
                </div>
              </Row>
            )}
          />
          <form.Field
            name="wpam_default_auction_type"
            children={(f) => (
              <Row label="Default Auction Type">
                <Select
                  value={f.state.value ?? 'english'}
                  onChange={(e) => f.handleChange(e.target.value)}
                >
                  <option value="english">English</option>
                  <option value="sealed">Sealed</option>
                </Select>
              </Row>
            )}
          />
        </div>
      </Section>

      <div className="flex justify-end">
        <Button
          disabled={mutation.isPending}
          onClick={() => form.handleSubmit()}
          type="button"
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default (parent: AnyRoute) =>
  createRoute({
    component: General,
    getParentRoute: () => parent,
    path: 'general',
  })
