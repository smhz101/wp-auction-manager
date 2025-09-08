// /features/settings/types.ts

export type HttpEndpoints = {
  fetchUrl: string
  updateUrl: string
}

export type OptionsApiConfig = {
  axiosBaseUrl?: string
  endpoints: HttpEndpoints
  authHeaderName?: string
  getAuthToken?: () => string | null
}

export type LoadState = 'idle' | 'loading' | 'success' | 'error'
export type SaveState = 'idle' | 'saving' | 'success' | 'error'

/**
 * Flat options map – keys are exactly the wpam_* option names from your IA.
 * Types are picked pragmatically for admin inputs. Everything exists; defaults in schema.
 */
export type FlatOptions = {
  // DASHBOARD
  wpam_enabled: boolean
  wpam_license_status: string // readonly (shown)
  wpam_pusher_status: string // readonly (shown)
  wpam_log_level: 'debug' | 'info' | 'warn' | 'error'
  wpam_maintenance_mode: boolean

  // AUCTIONS → General
  wpam_default_auction_type: string
  wpam_default_duration_minutes: number
  wpam_default_increment: number
  wpam_increment_tiers: string
  wpam_default_relist_limit: number
  wpam_autostart_on_publish: boolean

  // AUCTIONS → Soft Close
  wpam_soft_close: boolean
  wpam_soft_close_threshold: number
  wpam_soft_close_extend: number
  wpam_max_extensions: number
  wpam_server_time_source: string

  // AUCTIONS → Proxy Bidding
  wpam_enable_proxy_bidding: boolean
  wpam_proxy_enabled: boolean
  wpam_proxy_increment_strategy: 'fixed' | 'tiered'
  wpam_proxy_max_auto_bid_multiplier: number
  wpam_proxy_min_gap_percent: number
  wpam_proxy_rebid_latency_ms: number
  wpam_proxy_rebid_jitter_ms: number
  wpam_proxy_rebid_failure_retry: number
  wpam_proxy_tie_breaker: 'earliest' | 'highest' | 'random'
  wpam_proxy_user_limit_per_auction: number

  // AUCTIONS → Silent / Sealed
  wpam_enable_silent_bidding: boolean
  wpam_silent_enabled: boolean
  wpam_silent_hide_current_price: boolean
  wpam_silent_hide_bid_count: boolean
  wpam_silent_anonymize_bidders: boolean
  wpam_silent_allow_single_reveal_on_end: boolean
  wpam_silent_minimum_confidence_gap: number
  wpam_silent_blind_proxy_support: boolean
  wpam_silent_audit_visibility: 'none' | 'admin' | 'seller' | 'everyone'

  // BIDDING & FAIRNESS → Rules
  wpam_min_bid_increment_enforced: boolean
  wpam_block_retract_bids: boolean
  wpam_require_account_balance: boolean
  wpam_max_auto_bid_limit: number

  // BIDDING & FAIRNESS → Anti-Abuse
  wpam_bid_throttle_ms: number
  wpam_rate_limit_per_ip_min: number
  wpam_geo_blocklist: string

  // FEES & PAYMENTS → Fees
  wpam_buyer_premium: number
  wpam_seller_fee: number
  wpam_tax_behavior: 'inclusive' | 'exclusive' | 'none'
  wpam_deposit_required: boolean
  wpam_deposit_amount: number

  // FEES & PAYMENTS → Orders & Deadlines
  wpam_auto_create_order: boolean
  wpam_payment_deadline_hours: number
  wpam_second_chance_offers: boolean

  // FEES & PAYMENTS → Escrow
  wpam_escrow_provider: 'none' | 'stripe' | 'mangopay' | 'custom'
  wpam_escrow_auto_release_on_delivery: boolean

  // MESSAGING → Channels
  wpam_enable_email: boolean
  wpam_enable_twilio: boolean
  wpam_enable_firebase: boolean

  // MESSAGING → Templates (strings / JSON)
  wpam_tpl_bid_placed_email: string
  wpam_tpl_outbid_email: string
  wpam_tpl_auction_started_email: string
  wpam_tpl_auction_ending_soon_email: string
  wpam_tpl_auction_won_email: string
  wpam_tpl_payment_reminder_email: string
  wpam_tpl_seller_item_sold_email: string
  wpam_tpl_generic_sms: string
  wpam_tpl_push_payload_override: string

  // MESSAGING → Rules & Digest
  wpam_msg_transport_matrix: string
  wpam_msg_quiet_hours_start: string
  wpam_msg_quiet_hours_end: string
  wpam_msg_rate_limit_per_user_min: number
  wpam_msg_digest_enabled: boolean
  wpam_msg_digest_frequency: 'hourly' | 'daily' | 'weekly'
  wpam_msg_template_locale_fallback: boolean
  wpam_msg_unsubscribe_link_enabled: boolean
  wpam_msg_test_mode: boolean

  // REALTIME → Provider
  wpam_realtime_provider: 'none' | 'pusher' | 'ably' | 'firebase'
  wpam_pusher_enabled: boolean
  wpam_ably_enabled: boolean

  // REALTIME → Credentials
  wpam_pusher_app_id: string
  wpam_pusher_key: string
  wpam_pusher_secret: string
  wpam_pusher_cluster: string
  wpam_ably_key: string
  wpam_firebase_server_key: string

  // REALTIME → Diagnostics (ro)
  // wpam_pusher_status already declared

  // DESIGN → Theme
  wpam_theme_preset: string
  wpam_theme_dark_auto: boolean
  wpam_theme_rtl_enabled: boolean
  wpam_ui_layout_compact_mode: boolean
  wpam_ui_countdown_format: string

  // DESIGN → Palette
  wpam_theme_palette_primary: string
  wpam_theme_palette_secondary: string
  wpam_theme_palette_accent: string
  wpam_theme_palette_success: string
  wpam_theme_palette_warning: string
  wpam_theme_palette_error: string

  // DESIGN → Components
  wpam_theme_typography_scale: number
  wpam_theme_border_radius: number
  wpam_theme_spacing_scale: number
  wpam_ui_show_bid_history_public: boolean
  wpam_ui_mask_bidder_identity: boolean
  wpam_enable_toasts: boolean
  wpam_ui_component_overrides: string

  // DESIGN → Custom CSS
  wpam_theme_custom_css_enabled: boolean
  wpam_theme_custom_css: string

  // USERS & KYC
  wpam_sellers: string
  wpam_bidders: string
  wpam_min_account_age_days: number
  wpam_mfa_required_for_bids: boolean
  wpam_require_kyc: boolean

  // CATALOG
  wpam_default_visibility: 'public' | 'private'
  wpam_default_stock_qty: number
  wpam_media_required: boolean

  // INTEGRATIONS → Email
  wpam_sendgrid_enabled: boolean
  wpam_sendgrid_key: string
  wpam_mailgun_enabled: boolean
  wpam_mailgun_domain: string
  wpam_mailgun_key: string
  wpam_ses_enabled: boolean
  wpam_ses_region: string
  wpam_ses_access_key: string
  wpam_ses_secret_key: string

  // INTEGRATIONS → SMS & Push
  wpam_twilio_sid: string
  wpam_twilio_token: string
  wpam_twilio_from: string

  // INTEGRATIONS → Webhooks
  wpam_webhook_url: string
  wpam_webhook_events: Array<string>
  wpam_webhook_signing_secret: string
  wpam_webhook_sign_webhooks: boolean

  // INTEGRATIONS → Captcha
  wpam_captcha_provider: 'none' | 'recaptcha' | 'turnstile'
  wpam_recaptcha_site_key: string
  wpam_recaptcha_secret_key: string
  wpam_turnstile_site_key: string
  wpam_turnstile_secret_key: string

  // SECURITY & COMPLIANCE
  wpam_personal_data_masking: boolean
  wpam_gdpr_export_enabled: boolean
  wpam_export_mask_usernames: boolean
  wpam_audit_log_retention_days: number

  // SYSTEM
  wpam_cron_driver: 'wp_cron' | 'external'
  wpam_close_worker_batch: number
  wpam_queue_driver: 'sync' | 'redis' | 'sqs'

  // LICENSING
  wpam_license_key: string
  wpam_license_activation_email: string
  wpam_license_site_limit: number
  wpam_license_grace_period_days: number
  // wpam_license_status: string
  wpam_update_channel: 'stable' | 'beta'
  wpam_telemetry_opt_in: boolean
}
