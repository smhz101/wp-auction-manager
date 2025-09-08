// /features/settings/schema.ts

import { z } from 'zod'

export const optionsSchema = z.object({
  // DASHBOARD
  wpam_enabled: z.boolean().default(true),
  wpam_license_status: z.string().default('inactive'),
  wpam_pusher_status: z.string().default('unknown'),
  wpam_log_level: z
    .enum(['debug', 'info', 'warn', 'error'] as const)
    .default('info'),
  wpam_maintenance_mode: z.boolean().default(false),

  // AUCTIONS → General
  wpam_default_auction_type: z.string().default('english'),
  wpam_default_duration_minutes: z.coerce
    .number()
    .int()
    .min(5)
    .max(60 * 24 * 14)
    .default(60 * 24),
  wpam_default_increment: z.coerce.number().min(0).default(1),
  wpam_increment_tiers: z.string().default(''), // JSON or CSV
  wpam_default_relist_limit: z.coerce.number().int().min(0).default(0),
  wpam_autostart_on_publish: z.boolean().default(true),

  // AUCTIONS → Soft Close
  wpam_soft_close: z.boolean().default(true),
  wpam_soft_close_threshold: z.coerce
    .number()
    .int()
    .min(5)
    .max(600)
    .default(120),
  wpam_soft_close_extend: z.coerce.number().int().min(5).max(600).default(60),
  wpam_max_extensions: z.coerce.number().int().min(0).max(50).default(5),
  wpam_server_time_source: z.string().default('system'),

  // AUCTIONS → Proxy Bidding
  wpam_enable_proxy_bidding: z.boolean().default(true),
  wpam_proxy_enabled: z.boolean().default(true),
  wpam_proxy_increment_strategy: z
    .enum(['fixed', 'tiered'] as const)
    .default('tiered'),
  wpam_proxy_max_auto_bid_multiplier: z.coerce
    .number()
    .min(1)
    .max(100)
    .default(10),
  wpam_proxy_min_gap_percent: z.coerce.number().min(0).max(100).default(1),
  wpam_proxy_rebid_latency_ms: z.coerce
    .number()
    .int()
    .min(0)
    .max(10_000)
    .default(250),
  wpam_proxy_rebid_jitter_ms: z.coerce
    .number()
    .int()
    .min(0)
    .max(10_000)
    .default(120),
  wpam_proxy_rebid_failure_retry: z.coerce
    .number()
    .int()
    .min(0)
    .max(10)
    .default(3),
  wpam_proxy_tie_breaker: z
    .enum(['earliest', 'highest', 'random'] as const)
    .default('earliest'),
  wpam_proxy_user_limit_per_auction: z.coerce
    .number()
    .int()
    .min(0)
    .max(10_000)
    .default(0),

  // AUCTIONS → Silent / Sealed
  wpam_enable_silent_bidding: z.boolean().default(false),
  wpam_silent_enabled: z.boolean().default(false),
  wpam_silent_hide_current_price: z.boolean().default(true),
  wpam_silent_hide_bid_count: z.boolean().default(true),
  wpam_silent_anonymize_bidders: z.boolean().default(true),
  wpam_silent_allow_single_reveal_on_end: z.boolean().default(false),
  wpam_silent_minimum_confidence_gap: z.coerce
    .number()
    .min(0)
    .max(100)
    .default(5),
  wpam_silent_blind_proxy_support: z.boolean().default(false),
  wpam_silent_audit_visibility: z
    .enum(['none', 'admin', 'seller', 'everyone'] as const)
    .default('admin'),

  // BIDDING & FAIRNESS → Rules
  wpam_min_bid_increment_enforced: z.boolean().default(true),
  wpam_block_retract_bids: z.boolean().default(true),
  wpam_require_account_balance: z.boolean().default(false),
  wpam_max_auto_bid_limit: z.coerce.number().int().min(0).default(0),

  // BIDDING & FAIRNESS → Anti-Abuse
  wpam_bid_throttle_ms: z.coerce.number().int().min(0).max(10_000).default(300),
  wpam_rate_limit_per_ip_min: z.coerce
    .number()
    .int()
    .min(0)
    .max(10_000)
    .default(120),
  wpam_geo_blocklist: z.string().default(''), // comma-separated ISO

  // FEES & PAYMENTS → Fees
  wpam_buyer_premium: z.coerce.number().min(0).max(100).default(15),
  wpam_seller_fee: z.coerce.number().min(0).max(100).default(10),
  wpam_tax_behavior: z
    .enum(['inclusive', 'exclusive', 'none'] as const)
    .default('exclusive'),
  wpam_deposit_required: z.boolean().default(false),
  wpam_deposit_amount: z.coerce.number().min(0).default(0),

  // FEES & PAYMENTS → Orders & Deadlines
  wpam_auto_create_order: z.boolean().default(true),
  wpam_payment_deadline_hours: z.coerce
    .number()
    .int()
    .min(1)
    .max(24 * 30)
    .default(72),
  wpam_second_chance_offers: z.boolean().default(false),

  // FEES & PAYMENTS → Escrow
  wpam_escrow_provider: z
    .enum(['none', 'stripe', 'mangopay', 'custom'] as const)
    .default('none'),
  wpam_escrow_auto_release_on_delivery: z.boolean().default(false),

  // MESSAGING → Channels
  wpam_enable_email: z.boolean().default(true),
  wpam_enable_twilio: z.boolean().default(false),
  wpam_enable_firebase: z.boolean().default(false),

  // MESSAGING → Templates
  wpam_tpl_bid_placed_email: z.string().default(''),
  wpam_tpl_outbid_email: z.string().default(''),
  wpam_tpl_auction_started_email: z.string().default(''),
  wpam_tpl_auction_ending_soon_email: z.string().default(''),
  wpam_tpl_auction_won_email: z.string().default(''),
  wpam_tpl_payment_reminder_email: z.string().default(''),
  wpam_tpl_seller_item_sold_email: z.string().default(''),
  wpam_tpl_generic_sms: z.string().default(''),
  wpam_tpl_push_payload_override: z.string().default(''),

  // MESSAGING → Rules & Digest
  wpam_msg_transport_matrix: z.string().default(''),
  wpam_msg_quiet_hours_start: z.string().default('22:00'),
  wpam_msg_quiet_hours_end: z.string().default('07:00'),
  wpam_msg_rate_limit_per_user_min: z.coerce
    .number()
    .int()
    .min(0)
    .max(10_000)
    .default(30),
  wpam_msg_digest_enabled: z.boolean().default(false),
  wpam_msg_digest_frequency: z
    .enum(['hourly', 'daily', 'weekly'] as const)
    .default('daily'),
  wpam_msg_template_locale_fallback: z.boolean().default(true),
  wpam_msg_unsubscribe_link_enabled: z.boolean().default(true),
  wpam_msg_test_mode: z.boolean().default(false),

  // REALTIME → Provider
  wpam_realtime_provider: z
    .enum(['none', 'pusher', 'ably', 'firebase'] as const)
    .default('none'),
  wpam_pusher_enabled: z.boolean().default(false),
  wpam_ably_enabled: z.boolean().default(false),

  // REALTIME → Credentials
  wpam_pusher_app_id: z.string().default(''),
  wpam_pusher_key: z.string().default(''),
  wpam_pusher_secret: z.string().default(''),
  wpam_pusher_cluster: z.string().default(''),
  wpam_ably_key: z.string().default(''),
  wpam_firebase_server_key: z.string().default(''),

  // DESIGN → Theme
  wpam_theme_preset: z.string().default('classic'),
  wpam_theme_dark_auto: z.boolean().default(true),
  wpam_theme_rtl_enabled: z.boolean().default(false),
  wpam_ui_layout_compact_mode: z.boolean().default(false),
  wpam_ui_countdown_format: z.string().default('h:mm:ss'),

  // DESIGN → Palette
  wpam_theme_palette_primary: z.string().default('#0ea5e9'),
  wpam_theme_palette_secondary: z.string().default('#64748b'),
  wpam_theme_palette_accent: z.string().default('#22c55e'),
  wpam_theme_palette_success: z.string().default('#16a34a'),
  wpam_theme_palette_warning: z.string().default('#f59e0b'),
  wpam_theme_palette_error: z.string().default('#ef4444'),

  // DESIGN → Components
  wpam_theme_typography_scale: z.coerce.number().min(0.5).max(2).default(1),
  wpam_theme_border_radius: z.coerce.number().min(0).max(24).default(12),
  wpam_theme_spacing_scale: z.coerce.number().min(0.5).max(2).default(1),
  wpam_ui_show_bid_history_public: z.boolean().default(true),
  wpam_ui_mask_bidder_identity: z.boolean().default(false),
  wpam_enable_toasts: z.boolean().default(true),
  wpam_ui_component_overrides: z.string().default(''),

  // DESIGN → Custom CSS
  wpam_theme_custom_css_enabled: z.boolean().default(false),
  wpam_theme_custom_css: z.string().default(''),

  // USERS & KYC
  wpam_sellers: z.string().default(''), // comma user IDs
  wpam_bidders: z.string().default(''),
  wpam_min_account_age_days: z.coerce
    .number()
    .int()
    .min(0)
    .max(3650)
    .default(0),
  wpam_mfa_required_for_bids: z.boolean().default(false),
  wpam_require_kyc: z.boolean().default(false),

  // CATALOG
  wpam_default_visibility: z
    .enum(['public', 'private'] as const)
    .default('public'),
  wpam_default_stock_qty: z.coerce.number().int().min(0).default(0),
  wpam_media_required: z.boolean().default(false),

  // INTEGRATIONS → Email
  wpam_sendgrid_enabled: z.boolean().default(false),
  wpam_sendgrid_key: z.string().default(''),
  wpam_mailgun_enabled: z.boolean().default(false),
  wpam_mailgun_domain: z.string().default(''),
  wpam_mailgun_key: z.string().default(''),
  wpam_ses_enabled: z.boolean().default(false),
  wpam_ses_region: z.string().default(''),
  wpam_ses_access_key: z.string().default(''),
  wpam_ses_secret_key: z.string().default(''),

  // INTEGRATIONS → SMS & Push
  wpam_twilio_sid: z.string().default(''),
  wpam_twilio_token: z.string().default(''),
  wpam_twilio_from: z.string().default(''),

  // INTEGRATIONS → Webhooks
  wpam_webhook_url: z.string().default(''),
  wpam_webhook_events: z.array(z.string()).default([]),
  wpam_webhook_signing_secret: z.string().default(''),
  wpam_webhook_sign_webhooks: z.boolean().default(false),

  // INTEGRATIONS → Captcha
  wpam_captcha_provider: z
    .enum(['none', 'recaptcha', 'turnstile'] as const)
    .default('none'),
  wpam_recaptcha_site_key: z.string().default(''),
  wpam_recaptcha_secret_key: z.string().default(''),
  wpam_turnstile_site_key: z.string().default(''),
  wpam_turnstile_secret_key: z.string().default(''),

  // SECURITY & COMPLIANCE
  wpam_personal_data_masking: z.boolean().default(true),
  wpam_gdpr_export_enabled: z.boolean().default(true),
  wpam_export_mask_usernames: z.boolean().default(false),
  wpam_audit_log_retention_days: z.coerce
    .number()
    .int()
    .min(1)
    .max(3650)
    .default(365),

  // SYSTEM
  wpam_cron_driver: z.enum(['wp_cron', 'external'] as const).default('wp_cron'),
  wpam_close_worker_batch: z.coerce
    .number()
    .int()
    .min(1)
    .max(10_000)
    .default(250),
  wpam_queue_driver: z.enum(['sync', 'redis', 'sqs'] as const).default('sync'),

  // LICENSING
  wpam_license_key: z.string().default(''),
  wpam_license_activation_email: z
    .union([z.string().email(), z.literal('')])
    .default(''),
  wpam_license_site_limit: z.coerce.number().int().min(0).default(1),
  wpam_license_grace_period_days: z.coerce
    .number()
    .int()
    .min(0)
    .max(365)
    .default(7),
  wpam_update_channel: z.enum(['stable', 'beta'] as const).default('stable'),
  wpam_telemetry_opt_in: z.boolean().default(false),
})

export type OptionsFormValues = z.infer<typeof optionsSchema>
