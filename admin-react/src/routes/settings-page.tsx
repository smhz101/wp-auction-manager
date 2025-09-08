/**
 * routes/settings-page.tsx
 *
 * Dummy "Settings" page that:
 * - Loads/saves settings via @tanstack/react-query (real WP REST if available, else local mock)
 * - Uses @tanstack/react-form for a typed, inline form
 * - Is TS/ESLint friendly:
 *   - `import type` for types
 *   - Members sorted alphabetically
 *   - Uses `Array<T>` instead of `T[]`
 *   - Avoids unnecessary optional chains/nullish coalescing
 *
 * WP REST integration:
 * - Reads `window.MY_PLUGIN_BOOT` injected by PHP (restUrl, nonce)
 * - Uses cookie auth + `X-WP-Nonce` header (see docs)
 *
 * Source: WP REST nonce header — https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/#cookie-authentication
 */

import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRoute } from '@tanstack/react-router'
import type { RootRoute } from '@tanstack/react-router'

/** ---------- Types ---------- */

type Settings = {
  // Core numbers
  wpam_default_increment: number
  wpam_default_relist_limit: number
  wpam_max_extensions: number
  wpam_soft_close: number
  wpam_soft_close_extend: number
  wpam_soft_close_threshold: number

  // Feature toggles
  wpam_enable_email: boolean
  wpam_enable_firebase: boolean
  wpam_enable_twilio: boolean
  wpam_enable_toasts: boolean
  wpam_enable_proxy_bidding: boolean
  wpam_enable_silent_bidding: boolean
  wpam_require_kyc: boolean

  // Providers
  wpam_realtime_provider: 'none' | 'pusher'
  wpam_default_auction_type?: string

  // Keys/Secrets (dummy for UI)
  wpam_firebase_server_key: string
  wpam_sendgrid_key: string
  wpam_twilio_sid: string
  wpam_twilio_token: string
  wpam_twilio_from: string
  wpam_pusher_app_id: string
  wpam_pusher_key: string
  wpam_pusher_secret: string
  wpam_pusher_cluster: string
  wpam_webhook_url: string
}

type Boot = {
  adminUrl: string
  nonce: string
  restUrl: string
}

/** ---------- UI atoms ---------- */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="rounded border border-zinc-200 bg-white">
    <div className="border-b border-zinc-200 px-4 py-3">
      <h2 className="text-sm font-semibold">{title}</h2>
    </div>
    <div className="p-4">{children}</div>
  </section>
)

const Grid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
)

const Row: React.FC<{
  label: string
  hint?: string
  children: React.ReactNode
}> = ({ label, hint, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium">{label}</span>
    {children}
    {hint ? <span className="text-xs text-zinc-500">{hint}</span> : null}
  </label>
)

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props,
) => (
  <input
    {...props}
    className={`w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 ${props.className ?? ''}`}
  />
)

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props,
) => (
  <select
    {...props}
    className={`w-full rounded border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10 ${props.className ?? ''}`}
  />
)

const Switch: React.FC<{
  checked: boolean
  onChange: (val: boolean) => void
}> = ({ checked, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    aria-pressed={checked}
    className={`h-6 w-11 rounded-full transition ${
      checked ? 'bg-black' : 'bg-zinc-200'
    } relative`}
  >
    <span
      className={`absolute left-0.5 top-0.5 inline-block h-5 w-5 rounded-full bg-white transition ${
        checked ? 'translate-x-5' : ''
      }`}
    />
  </button>
)

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'primary' | 'ghost'
  }
> = ({ className = '', variant = 'primary', ...props }) => {
  const styles: Record<string, string> = {
    primary: 'bg-black text-white hover:bg-zinc-800',
    ghost: 'bg-transparent hover:bg-zinc-100',
  }
  return (
    <button
      {...props}
      className={`inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-medium ${styles[variant]} ${className}`}
    />
  )
}

/** ---------- Data layer (real WP REST if available, else mock) ---------- */

const getBoot = (): Boot | undefined => {
  // Typed as possibly undefined so optional access is valid under ESLint rules.
  return (globalThis as any).MY_PLUGIN_BOOT as Boot | undefined
}

const defaultSettings = (): Settings => ({
  wpam_default_increment: 1,
  wpam_default_relist_limit: 0,
  wpam_max_extensions: 0,
  wpam_soft_close: 0,
  wpam_soft_close_extend: 30,
  wpam_soft_close_threshold: 30,

  wpam_enable_email: true,
  wpam_enable_firebase: false,
  wpam_enable_twilio: false,
  wpam_enable_toasts: true,
  wpam_enable_proxy_bidding: false,
  wpam_enable_silent_bidding: false,
  wpam_require_kyc: false,

  wpam_realtime_provider: 'none',
  wpam_default_auction_type: 'english',

  wpam_firebase_server_key: '',
  wpam_sendgrid_key: '',
  wpam_twilio_sid: '',
  wpam_twilio_token: '',
  wpam_twilio_from: '',
  wpam_pusher_app_id: '',
  wpam_pusher_key: '',
  wpam_pusher_secret: '',
  wpam_pusher_cluster: '',
  wpam_webhook_url: '',
})

async function fetchSettings(): Promise<Settings> {
  const boot = getBoot()
  if (boot) {
    const res = await fetch(
      new URL('wpam/v1/settings', boot.restUrl).toString(),
      {
        credentials: 'same-origin',
        headers: { 'X-WP-Nonce': boot.nonce },
        method: 'GET',
      },
    )
    if (res.ok) {
      const json = (await res.json()) as Partial<Settings>
      return { ...defaultSettings(), ...json }
    }
  }
  // Fallback mock
  await new Promise((r) => setTimeout(r, 150))
  return defaultSettings()
}

async function saveSettings(payload: Settings): Promise<Settings> {
  const boot = getBoot()
  if (boot) {
    const res = await fetch(
      new URL('wpam/v1/settings', boot.restUrl).toString(),
      {
        body: JSON.stringify(payload),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': boot.nonce,
        },
        method: 'POST',
      },
    )
    if (res.ok) {
      const json = (await res.json()) as Partial<Settings>
      return { ...defaultSettings(), ...json }
    }
  }
  // Mock save (no-op)
  await new Promise((r) => setTimeout(r, 200))
  return payload
}

/** ---------- Page ---------- */

function SettingsComponent() {
  const qc = useQueryClient()

  const { data: initial = defaultSettings(), isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 60_000,
  })

  const mutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: (next) => {
      qc.setQueryData(['settings'], next)
    },
  })

  const form = useForm({
    defaultValues: initial,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Settings</h1>
          <p className="text-sm text-zinc-600">
            {isLoading
              ? 'Loading settings…'
              : 'Manage auction defaults, providers, and integrations.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              form.reset()
            }}
            type="button"
            variant="ghost"
          >
            Reset
          </Button>
          <Button
            disabled={mutation.isPending}
            onClick={() => form.handleSubmit()}
            type="button"
          >
            Save Changes
          </Button>
        </div>
      </div>

      {mutation.isSuccess ? (
        <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Settings saved.
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        {/* Auction Defaults */}
        <Section title="Auction Defaults">
          <Grid>
            <form.Field
              name="wpam_soft_close_threshold"
              children={(field) => (
                <Row label="Soft Close Threshold (seconds)">
                  <Input
                    inputMode="numeric"
                    type="number"
                    value={String(field.state.value)}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_soft_close_extend"
              children={(field) => (
                <Row label="Extension Duration (seconds)">
                  <Input
                    inputMode="numeric"
                    type="number"
                    value={String(field.state.value)}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_max_extensions"
              children={(field) => (
                <Row label="Maximum Extensions">
                  <Input
                    inputMode="numeric"
                    type="number"
                    value={String(field.state.value)}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_default_increment"
              children={(field) => (
                <Row label="Default Bid Increment">
                  <Input
                    inputMode="decimal"
                    step="0.01"
                    type="number"
                    value={String(field.state.value)}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_default_relist_limit"
              children={(field) => (
                <Row label="Default Relist Limit">
                  <Input
                    inputMode="numeric"
                    type="number"
                    value={String(field.state.value)}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_soft_close"
              children={(field) => (
                <Row label="Soft Close Duration (minutes)">
                  <Input
                    inputMode="numeric"
                    type="number"
                    value={String(field.state.value)}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                  />
                </Row>
              )}
            />
          </Grid>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <form.Field
              name="wpam_enable_proxy_bidding"
              children={(field) => (
                <Row label="Enable Proxy Bidding">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <span className="text-sm">
                      {field.state.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </Row>
              )}
            />
            <form.Field
              name="wpam_enable_silent_bidding"
              children={(field) => (
                <Row label="Enable Silent Bidding">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <span className="text-sm">
                      {field.state.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </Row>
              )}
            />
            <form.Field
              name="wpam_require_kyc"
              children={(field) => (
                <Row label="Require KYC Verification">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <span className="text-sm">
                      {field.state.value ? 'Required' : 'Not required'}
                    </span>
                  </div>
                </Row>
              )}
            />
          </div>
        </Section>

        {/* Providers */}
        <Section title="Providers">
          <Grid>
            <form.Field
              name="wpam_enable_email"
              children={(field) => (
                <Row label="Enable Email Notifications">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <span className="text-sm">
                      {field.state.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </Row>
              )}
            />
            <form.Field
              name="wpam_enable_twilio"
              children={(field) => (
                <Row label="Enable Twilio">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <span className="text-sm">
                      {field.state.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </Row>
              )}
            />
            <form.Field
              name="wpam_enable_firebase"
              children={(field) => (
                <Row label="Enable Firebase">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <span className="text-sm">
                      {field.state.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </Row>
              )}
            />
            <form.Field
              name="wpam_enable_toasts"
              children={(field) => (
                <Row label="Enable Admin Toasts">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={field.state.value}
                      onChange={field.handleChange}
                    />
                    <span className="text-sm">
                      {field.state.value ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </Row>
              )}
            />
          </Grid>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field
              name="wpam_realtime_provider"
              children={(field) => (
                <Row label="Realtime Provider">
                  <Select
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(
                        e.target.value as Settings['wpam_realtime_provider'],
                      )
                    }
                  >
                    <option value="none">None</option>
                    <option value="pusher">Pusher</option>
                  </Select>
                </Row>
              )}
            />
            <form.Field
              name="wpam_default_auction_type"
              children={(field) => (
                <Row label="Default Auction Type">
                  <Select
                    value={field.state.value ?? 'english'}
                    onChange={(e) => field.handleChange(e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="sealed">Sealed</option>
                  </Select>
                </Row>
              )}
            />
          </div>
        </Section>

        {/* Credentials */}
        <Section title="Credentials & Keys">
          <Grid>
            <form.Field
              name="wpam_sendgrid_key"
              children={(field) => (
                <Row
                  label="SendGrid API Key"
                  hint="Used for email notifications"
                >
                  <Input
                    autoComplete="off"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_firebase_server_key"
              children={(field) => (
                <Row
                  label="Firebase Server Key"
                  hint="Used for push notifications"
                >
                  <Input
                    autoComplete="off"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_twilio_sid"
              children={(field) => (
                <Row label="Twilio SID">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_twilio_token"
              children={(field) => (
                <Row label="Twilio Token">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_twilio_from"
              children={(field) => (
                <Row label="Twilio From Number">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_webhook_url"
              children={(field) => (
                <Row label="Webhook URL">
                  <Input
                    type="url"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
          </Grid>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field
              name="wpam_pusher_app_id"
              children={(field) => (
                <Row label="Pusher App ID">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_pusher_key"
              children={(field) => (
                <Row label="Pusher Key">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_pusher_secret"
              children={(field) => (
                <Row label="Pusher Secret">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
            <form.Field
              name="wpam_pusher_cluster"
              children={(field) => (
                <Row label="Pusher Cluster">
                  <Input
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Row>
              )}
            />
          </div>
        </Section>
      </div>
    </div>
  )
}

/** ---------- Route factory ---------- */
function SettingsPage() {
  return <SettingsComponent />
}

export default (parentRoute: RootRoute) =>
  createRoute({
    component: SettingsPage,
    getParentRoute: () => parentRoute,
    path: '/settings',
  })
