import type { Boot, Settings } from '../types/settings'

const getBoot = (): Boot | undefined =>
  (globalThis as any).MY_PLUGIN_BOOT as Boot | undefined

export const defaultSettings = (): Settings => ({
  wpam_default_increment: 1,
  wpam_default_relist_limit: 0,
  wpam_max_extensions: 0,
  wpam_soft_close: 0,
  wpam_soft_close_extend: 30,
  wpam_soft_close_threshold: 30,
  wpam_license_key: '',

  wpam_enable_email: true,
  wpam_enable_firebase: false,
  wpam_enable_proxy_bidding: false,
  wpam_enable_silent_bidding: false,
  wpam_enable_toasts: true,
  wpam_enable_twilio: false,
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

  wpam_brand_logo_url: '',
  wpam_brand_primary: '#000000',

  wpam_buyer_premium: 0,
  wpam_seller_fee: 0,
})

export async function fetchSettings(): Promise<Settings> {
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
  await new Promise((r) => setTimeout(r, 120))
  return defaultSettings()
}

export async function saveSettings(payload: Settings): Promise<Settings> {
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
  await new Promise((r) => setTimeout(r, 150))
  return payload
}
