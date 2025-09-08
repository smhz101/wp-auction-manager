// /features/settings/fields.ts
import type { FlatOptions } from './types'

export type FieldType =
  | 'switch'
  | 'text'
  | 'number'
  | 'select'
  | 'textarea'
  | 'multiselect'
  | 'color'

export type FieldDef = {
  key: keyof FlatOptions
  label: string
  type: FieldType
  help?: string
  options?: Array<{ label: string; value: string }>
  placeholder?: string
  rows?: number
}

export type Section = {
  id: string
  label: string
  groups: Array<{ id: string; label: string; fields: Array<FieldDef> }>
}

/** Options for common selects */
const LOG_LEVEL = [
  { label: 'Debug', value: 'debug' },
  { label: 'Info', value: 'info' },
  { label: 'Warn', value: 'warn' },
  { label: 'Error', value: 'error' },
]
const TAX_BEHAVIOR = [
  { label: 'Inclusive', value: 'inclusive' },
  { label: 'Exclusive', value: 'exclusive' },
  { label: 'None', value: 'none' },
]
const PROXY_STRATEGY = [
  { label: 'Fixed', value: 'fixed' },
  { label: 'Tiered', value: 'tiered' },
]
const TIE_BREAK = [
  { label: 'Earliest', value: 'earliest' },
  { label: 'Highest', value: 'highest' },
  { label: 'Random', value: 'random' },
]
const DIGEST_FREQ = [
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
]
const REALTIME = [
  { label: 'None', value: 'none' },
  { label: 'Pusher', value: 'pusher' },
  { label: 'Ably', value: 'ably' },
  { label: 'Firebase', value: 'firebase' },
]
const ESCROW = [
  { label: 'None', value: 'none' },
  { label: 'Stripe', value: 'stripe' },
  { label: 'MangoPay', value: 'mangopay' },
  { label: 'Custom', value: 'custom' },
]
const QUEUE = [
  { label: 'Sync', value: 'sync' },
  { label: 'Redis', value: 'redis' },
  { label: 'SQS', value: 'sqs' },
]
const CRON = [
  { label: 'WP Cron', value: 'wp_cron' },
  { label: 'External', value: 'external' },
]
const VISIBILITY = [
  { label: 'Public', value: 'public' },
  { label: 'Private', value: 'private' },
]
const CAPTCHA = [
  { label: 'None', value: 'none' },
  { label: 'reCAPTCHA', value: 'recaptcha' },
  { label: 'Turnstile', value: 'turnstile' },
]
const CHANNEL = [
  { label: 'Stable', value: 'stable' },
  { label: 'Beta', value: 'beta' },
]

/** UI Sections (tabs → inner groups) */
export const SECTIONS: Array<Section> = [
  // {
  //   id: 'dashboard',
  //   label: 'Dashboard',
  //   groups: [
  //     {
  //       id: 'core',
  //       label: 'Core',
  //       fields: [
  //         { key: 'wpam_enabled', label: 'Plugin enabled', type: 'switch' },
  //         {
  //           key: 'wpam_maintenance_mode',
  //           label: 'Maintenance mode',
  //           type: 'switch',
  //         },
  //         {
  //           key: 'wpam_log_level',
  //           label: 'Log level',
  //           type: 'select',
  //           options: LOG_LEVEL,
  //         },
  //         {
  //           key: 'wpam_license_status',
  //           label: 'License status',
  //           type: 'text',
  //           help: 'Read only',
  //         },
  //         {
  //           key: 'wpam_pusher_status',
  //           label: 'Realtime status',
  //           type: 'text',
  //           help: 'Read only',
  //         },
  //       ],
  //     },
  //   ],
  // },
  {
    id: 'auctions',
    label: 'Auctions',
    groups: [
      {
        id: 'general',
        label: 'General',
        fields: [
          {
            key: 'wpam_default_auction_type',
            label: 'Default auction type',
            type: 'text',
            placeholder: 'english',
          },
          {
            key: 'wpam_default_duration_minutes',
            label: 'Default duration (minutes)',
            type: 'number',
          },
          {
            key: 'wpam_default_increment',
            label: 'Default increment',
            type: 'number',
          },
          {
            key: 'wpam_increment_tiers',
            label: 'Increment tiers (JSON/CSV)',
            type: 'textarea',
            rows: 4,
          },
          {
            key: 'wpam_default_relist_limit',
            label: 'Default relist limit',
            type: 'number',
          },
          {
            key: 'wpam_autostart_on_publish',
            label: 'Autostart on publish',
            type: 'switch',
          },
        ],
      },
      {
        id: 'softclose',
        label: 'Soft Close',
        fields: [
          {
            key: 'wpam_soft_close',
            label: 'Enable soft close',
            type: 'switch',
          },
          {
            key: 'wpam_soft_close_threshold',
            label: 'Threshold (s)',
            type: 'number',
          },
          {
            key: 'wpam_soft_close_extend',
            label: 'Extend by (s)',
            type: 'number',
          },
          {
            key: 'wpam_max_extensions',
            label: 'Max extensions',
            type: 'number',
          },
          {
            key: 'wpam_server_time_source',
            label: 'Server time source',
            type: 'text',
          },
        ],
      },
      {
        id: 'proxy',
        label: 'Proxy Bidding',
        fields: [
          {
            key: 'wpam_enable_proxy_bidding',
            label: 'Enable proxy bidding (global)',
            type: 'switch',
          },
          {
            key: 'wpam_proxy_enabled',
            label: 'Proxy enabled (auction)',
            type: 'switch',
          },
          {
            key: 'wpam_proxy_increment_strategy',
            label: 'Increment strategy',
            type: 'select',
            options: PROXY_STRATEGY,
          },
          {
            key: 'wpam_proxy_max_auto_bid_multiplier',
            label: 'Max auto-bid multiplier',
            type: 'number',
          },
          {
            key: 'wpam_proxy_min_gap_percent',
            label: 'Min gap %',
            type: 'number',
          },
          {
            key: 'wpam_proxy_rebid_latency_ms',
            label: 'Rebid latency (ms)',
            type: 'number',
          },
          {
            key: 'wpam_proxy_rebid_jitter_ms',
            label: 'Rebid jitter (ms)',
            type: 'number',
          },
          {
            key: 'wpam_proxy_rebid_failure_retry',
            label: 'Failure retries',
            type: 'number',
          },
          {
            key: 'wpam_proxy_tie_breaker',
            label: 'Tie breaker',
            type: 'select',
            options: TIE_BREAK,
          },
          {
            key: 'wpam_proxy_user_limit_per_auction',
            label: 'User limit per auction',
            type: 'number',
          },
        ],
      },
      {
        id: 'silent',
        label: 'Silent / Sealed',
        fields: [
          {
            key: 'wpam_enable_silent_bidding',
            label: 'Enable silent bidding (global)',
            type: 'switch',
          },
          {
            key: 'wpam_silent_enabled',
            label: 'Silent enabled (auction)',
            type: 'switch',
          },
          {
            key: 'wpam_silent_hide_current_price',
            label: 'Hide current price',
            type: 'switch',
          },
          {
            key: 'wpam_silent_hide_bid_count',
            label: 'Hide bid count',
            type: 'switch',
          },
          {
            key: 'wpam_silent_anonymize_bidders',
            label: 'Anonymize bidders',
            type: 'switch',
          },
          {
            key: 'wpam_silent_allow_single_reveal_on_end',
            label: 'Single reveal on end',
            type: 'switch',
          },
          {
            key: 'wpam_silent_minimum_confidence_gap',
            label: 'Minimum confidence gap %',
            type: 'number',
          },
          {
            key: 'wpam_silent_blind_proxy_support',
            label: 'Blind proxy support',
            type: 'switch',
          },
          {
            key: 'wpam_silent_audit_visibility',
            label: 'Audit visibility',
            type: 'select',
            options: [
              { label: 'None', value: 'none' },
              { label: 'Admin', value: 'admin' },
              { label: 'Seller', value: 'seller' },
              { label: 'Everyone', value: 'everyone' },
            ],
          },
        ],
      },
    ],
  },

  {
    id: 'bidding',
    label: 'Bidding & Fairness',
    groups: [
      {
        id: 'rules',
        label: 'Rules',
        fields: [
          {
            key: 'wpam_min_bid_increment_enforced',
            label: 'Enforce min increment',
            type: 'switch',
          },
          {
            key: 'wpam_block_retract_bids',
            label: 'Block retract bids',
            type: 'switch',
          },
          {
            key: 'wpam_require_account_balance',
            label: 'Require account balance',
            type: 'switch',
          },
          {
            key: 'wpam_max_auto_bid_limit',
            label: 'Max auto-bid limit',
            type: 'number',
          },
        ],
      },
      {
        id: 'antiabuse',
        label: 'Anti-Abuse',
        fields: [
          {
            key: 'wpam_bid_throttle_ms',
            label: 'Bid throttle (ms)',
            type: 'number',
          },
          {
            key: 'wpam_rate_limit_per_ip_min',
            label: 'Rate limit per IP (min)',
            type: 'number',
          },
          {
            key: 'wpam_geo_blocklist',
            label: 'Geo blocklist (ISO CSV)',
            type: 'text',
          },
        ],
      },
    ],
  },

  {
    id: 'fees',
    label: 'Fees & Payments',
    groups: [
      {
        id: 'fees',
        label: 'Fees',
        fields: [
          {
            key: 'wpam_buyer_premium',
            label: 'Buyer premium %',
            type: 'number',
          },
          { key: 'wpam_seller_fee', label: 'Seller fee %', type: 'number' },
          {
            key: 'wpam_tax_behavior',
            label: 'Tax behavior',
            type: 'select',
            options: TAX_BEHAVIOR,
          },
          {
            key: 'wpam_deposit_required',
            label: 'Deposit required',
            type: 'switch',
          },
          {
            key: 'wpam_deposit_amount',
            label: 'Deposit amount',
            type: 'number',
          },
        ],
      },
      {
        id: 'orders',
        label: 'Orders & Deadlines',
        fields: [
          {
            key: 'wpam_auto_create_order',
            label: 'Auto-create order on win',
            type: 'switch',
          },
          {
            key: 'wpam_payment_deadline_hours',
            label: 'Payment deadline (hours)',
            type: 'number',
          },
          {
            key: 'wpam_second_chance_offers',
            label: 'Second chance offers',
            type: 'switch',
          },
        ],
      },
      {
        id: 'escrow',
        label: 'Escrow',
        fields: [
          {
            key: 'wpam_escrow_provider',
            label: 'Escrow provider',
            type: 'select',
            options: ESCROW,
          },
          {
            key: 'wpam_escrow_auto_release_on_delivery',
            label: 'Auto release on delivery',
            type: 'switch',
          },
        ],
      },
    ],
  },

  {
    id: 'messaging',
    label: 'Messaging',
    groups: [
      {
        id: 'channels',
        label: 'Channels',
        fields: [
          { key: 'wpam_enable_email', label: 'Email', type: 'switch' },
          { key: 'wpam_enable_twilio', label: 'Twilio SMS', type: 'switch' },
          {
            key: 'wpam_enable_firebase',
            label: 'Firebase Push',
            type: 'switch',
          },
        ],
      },
      {
        id: 'templates',
        label: 'Templates',
        fields: [
          {
            key: 'wpam_tpl_bid_placed_email',
            label: 'Bid placed (email)',
            type: 'textarea',
            rows: 5,
          },
          {
            key: 'wpam_tpl_outbid_email',
            label: 'Outbid (email)',
            type: 'textarea',
            rows: 5,
          },
          {
            key: 'wpam_tpl_auction_started_email',
            label: 'Auction started (email)',
            type: 'textarea',
            rows: 5,
          },
          {
            key: 'wpam_tpl_auction_ending_soon_email',
            label: 'Ending soon (email)',
            type: 'textarea',
            rows: 5,
          },
          {
            key: 'wpam_tpl_auction_won_email',
            label: 'Auction won (email)',
            type: 'textarea',
            rows: 5,
          },
          {
            key: 'wpam_tpl_payment_reminder_email',
            label: 'Payment reminder (email)',
            type: 'textarea',
            rows: 5,
          },
          {
            key: 'wpam_tpl_seller_item_sold_email',
            label: 'Seller item sold (email)',
            type: 'textarea',
            rows: 5,
          },
          {
            key: 'wpam_tpl_generic_sms',
            label: 'Generic SMS',
            type: 'textarea',
            rows: 3,
          },
          {
            key: 'wpam_tpl_push_payload_override',
            label: 'Push payload override (JSON)',
            type: 'textarea',
            rows: 5,
          },
        ],
      },
      {
        id: 'rules',
        label: 'Rules & Digest',
        fields: [
          {
            key: 'wpam_msg_transport_matrix',
            label: 'Transport matrix (JSON)',
            type: 'textarea',
            rows: 4,
          },
          {
            key: 'wpam_msg_quiet_hours_start',
            label: 'Quiet hours start (HH:mm)',
            type: 'text',
          },
          {
            key: 'wpam_msg_quiet_hours_end',
            label: 'Quiet hours end (HH:mm)',
            type: 'text',
          },
          {
            key: 'wpam_msg_rate_limit_per_user_min',
            label: 'Rate limit per user (min)',
            type: 'number',
          },
          {
            key: 'wpam_msg_digest_enabled',
            label: 'Digest enabled',
            type: 'switch',
          },
          {
            key: 'wpam_msg_digest_frequency',
            label: 'Digest frequency',
            type: 'select',
            options: DIGEST_FREQ,
          },
          {
            key: 'wpam_msg_template_locale_fallback',
            label: 'Template locale fallback',
            type: 'switch',
          },
          {
            key: 'wpam_msg_unsubscribe_link_enabled',
            label: 'Unsubscribe link in emails',
            type: 'switch',
          },
          { key: 'wpam_msg_test_mode', label: 'Test mode', type: 'switch' },
        ],
      },
    ],
  },

  {
    id: 'realtime',
    label: 'Realtime',
    groups: [
      {
        id: 'provider',
        label: 'Provider',
        fields: [
          {
            key: 'wpam_realtime_provider',
            label: 'Realtime provider',
            type: 'select',
            options: REALTIME,
          },
          {
            key: 'wpam_pusher_enabled',
            label: 'Pusher enabled',
            type: 'switch',
          },
          { key: 'wpam_ably_enabled', label: 'Ably enabled', type: 'switch' },
        ],
      },
      {
        id: 'credentials',
        label: 'Credentials',
        fields: [
          { key: 'wpam_pusher_app_id', label: 'Pusher App ID', type: 'text' },
          { key: 'wpam_pusher_key', label: 'Pusher Key', type: 'text' },
          { key: 'wpam_pusher_secret', label: 'Pusher Secret', type: 'text' },
          { key: 'wpam_pusher_cluster', label: 'Pusher Cluster', type: 'text' },
          { key: 'wpam_ably_key', label: 'Ably Key', type: 'text' },
          {
            key: 'wpam_firebase_server_key',
            label: 'Firebase Server Key',
            type: 'text',
          },
        ],
      },
    ],
  },

  {
    id: 'design',
    label: 'Design',
    groups: [
      {
        id: 'theme',
        label: 'Theme',
        fields: [
          {
            key: 'wpam_theme_preset',
            label: 'Theme preset',
            type: 'text',
            placeholder: 'classic',
          },
          {
            key: 'wpam_theme_dark_auto',
            label: 'Auto dark mode',
            type: 'switch',
          },
          {
            key: 'wpam_theme_rtl_enabled',
            label: 'RTL enabled',
            type: 'switch',
          },
          {
            key: 'wpam_ui_layout_compact_mode',
            label: 'Compact mode',
            type: 'switch',
          },
          {
            key: 'wpam_ui_countdown_format',
            label: 'Countdown format',
            type: 'text',
          },
        ],
      },
      {
        id: 'palette',
        label: 'Palette',
        fields: [
          {
            key: 'wpam_theme_palette_primary',
            label: 'Primary',
            type: 'color',
          },
          {
            key: 'wpam_theme_palette_secondary',
            label: 'Secondary',
            type: 'color',
          },
          { key: 'wpam_theme_palette_accent', label: 'Accent', type: 'color' },
          {
            key: 'wpam_theme_palette_success',
            label: 'Success',
            type: 'color',
          },
          {
            key: 'wpam_theme_palette_warning',
            label: 'Warning',
            type: 'color',
          },
          { key: 'wpam_theme_palette_error', label: 'Error', type: 'color' },
        ],
      },
      {
        id: 'components',
        label: 'Components',
        fields: [
          {
            key: 'wpam_theme_typography_scale',
            label: 'Typography scale',
            type: 'number',
          },
          {
            key: 'wpam_theme_border_radius',
            label: 'Border radius',
            type: 'number',
          },
          {
            key: 'wpam_theme_spacing_scale',
            label: 'Spacing scale',
            type: 'number',
          },
          {
            key: 'wpam_ui_show_bid_history_public',
            label: 'Show bid history to public',
            type: 'switch',
          },
          {
            key: 'wpam_ui_mask_bidder_identity',
            label: 'Mask bidder identity',
            type: 'switch',
          },
          { key: 'wpam_enable_toasts', label: 'Enable toasts', type: 'switch' },
          {
            key: 'wpam_ui_component_overrides',
            label: 'Component overrides (JSON)',
            type: 'textarea',
            rows: 4,
          },
        ],
      },
      {
        id: 'css',
        label: 'Custom CSS',
        fields: [
          {
            key: 'wpam_theme_custom_css_enabled',
            label: 'Enable custom CSS',
            type: 'switch',
          },
          {
            key: 'wpam_theme_custom_css',
            label: 'Custom CSS',
            type: 'textarea',
            rows: 8,
          },
        ],
      },
    ],
  },

  {
    id: 'users',
    label: 'Users & KYC',
    groups: [
      {
        id: 'access',
        label: 'Access Control',
        fields: [
          {
            key: 'wpam_sellers',
            label: 'Sellers (IDs CSV)',
            type: 'textarea',
            rows: 2,
          },
          {
            key: 'wpam_bidders',
            label: 'Bidders (IDs CSV)',
            type: 'textarea',
            rows: 2,
          },
          {
            key: 'wpam_min_account_age_days',
            label: 'Min account age (days)',
            type: 'number',
          },
          {
            key: 'wpam_mfa_required_for_bids',
            label: 'MFA required for bids',
            type: 'switch',
          },
        ],
      },
      {
        id: 'kyc',
        label: 'Verification',
        fields: [
          {
            key: 'wpam_require_kyc',
            label: 'Require KYC to bid',
            type: 'switch',
          },
        ],
      },
    ],
  },

  {
    id: 'catalog',
    label: 'Catalog',
    groups: [
      {
        id: 'defaults',
        label: 'Defaults',
        fields: [
          {
            key: 'wpam_default_visibility',
            label: 'Default visibility',
            type: 'select',
            options: VISIBILITY,
          },
          {
            key: 'wpam_default_stock_qty',
            label: 'Default stock qty',
            type: 'number',
          },
          {
            key: 'wpam_media_required',
            label: 'Media required',
            type: 'switch',
          },
        ],
      },
    ],
  },

  {
    id: 'integrations',
    label: 'Integrations',
    groups: [
      {
        id: 'email',
        label: 'Email',
        fields: [
          {
            key: 'wpam_sendgrid_enabled',
            label: 'SendGrid enabled',
            type: 'switch',
          },
          { key: 'wpam_sendgrid_key', label: 'SendGrid key', type: 'text' },
          {
            key: 'wpam_mailgun_enabled',
            label: 'Mailgun enabled',
            type: 'switch',
          },
          { key: 'wpam_mailgun_domain', label: 'Mailgun domain', type: 'text' },
          { key: 'wpam_mailgun_key', label: 'Mailgun key', type: 'text' },
          { key: 'wpam_ses_enabled', label: 'SES enabled', type: 'switch' },
          { key: 'wpam_ses_region', label: 'SES region', type: 'text' },
          { key: 'wpam_ses_access_key', label: 'SES access key', type: 'text' },
          { key: 'wpam_ses_secret_key', label: 'SES secret key', type: 'text' },
        ],
      },
      {
        id: 'sms',
        label: 'SMS & Push',
        fields: [
          { key: 'wpam_twilio_sid', label: 'Twilio SID', type: 'text' },
          { key: 'wpam_twilio_token', label: 'Twilio token', type: 'text' },
          { key: 'wpam_twilio_from', label: 'Twilio from', type: 'text' },
        ],
      },
      {
        id: 'webhooks',
        label: 'Webhooks',
        fields: [
          { key: 'wpam_webhook_url', label: 'Webhook URL', type: 'text' },
          {
            key: 'wpam_webhook_events',
            label: 'Webhook events (CSV)',
            type: 'text',
            help: 'Separate with commas',
          },
          {
            key: 'wpam_webhook_signing_secret',
            label: 'Signing secret',
            type: 'text',
          },
          {
            key: 'wpam_webhook_sign_webhooks',
            label: 'Sign webhooks',
            type: 'switch',
          },
        ],
      },
      {
        id: 'captcha',
        label: 'Captcha',
        fields: [
          {
            key: 'wpam_captcha_provider',
            label: 'Captcha provider',
            type: 'select',
            options: CAPTCHA,
          },
          {
            key: 'wpam_recaptcha_site_key',
            label: 'reCAPTCHA site key',
            type: 'text',
          },
          {
            key: 'wpam_recaptcha_secret_key',
            label: 'reCAPTCHA secret key',
            type: 'text',
          },
          {
            key: 'wpam_turnstile_site_key',
            label: 'Turnstile site key',
            type: 'text',
          },
          {
            key: 'wpam_turnstile_secret_key',
            label: 'Turnstile secret key',
            type: 'text',
          },
        ],
      },
    ],
  },

  {
    id: 'security',
    label: 'Security & Compliance',
    groups: [
      {
        id: 'security',
        label: 'Security',
        fields: [
          {
            key: 'wpam_rate_limit_per_ip_min',
            label: 'Rate limit per IP (min)',
            type: 'number',
          },
          {
            key: 'wpam_personal_data_masking',
            label: 'Mask personal data',
            type: 'switch',
          },
        ],
      },
      {
        id: 'compliance',
        label: 'Compliance',
        fields: [
          {
            key: 'wpam_gdpr_export_enabled',
            label: 'GDPR export enabled',
            type: 'switch',
          },
          {
            key: 'wpam_export_mask_usernames',
            label: 'Mask usernames in export',
            type: 'switch',
          },
        ],
      },
      {
        id: 'auditing',
        label: 'Auditing',
        fields: [
          {
            key: 'wpam_audit_log_retention_days',
            label: 'Audit log retention (days)',
            type: 'number',
          },
          {
            key: 'wpam_log_level',
            label: 'Log level',
            type: 'select',
            options: LOG_LEVEL,
          },
        ],
      },
    ],
  },

  {
    id: 'system',
    label: 'System',
    groups: [
      {
        id: 'scheduling',
        label: 'Scheduling',
        fields: [
          {
            key: 'wpam_cron_driver',
            label: 'Cron driver',
            type: 'select',
            options: CRON,
          },
          {
            key: 'wpam_close_worker_batch',
            label: 'Close worker batch',
            type: 'number',
          },
        ],
      },
      {
        id: 'runtime',
        label: 'Runtime',
        fields: [
          {
            key: 'wpam_queue_driver',
            label: 'Queue driver',
            type: 'select',
            options: QUEUE,
          },
          {
            key: 'wpam_maintenance_mode',
            label: 'Maintenance mode',
            type: 'switch',
          },
        ],
      },
    ],
  },

  {
    id: 'licensing',
    label: 'Licensing',
    groups: [
      {
        id: 'activation',
        label: 'Activation',
        fields: [
          { key: 'wpam_license_key', label: 'License key', type: 'text' },
          {
            key: 'wpam_license_activation_email',
            label: 'Activation email',
            type: 'text',
          },
        ],
      },
      {
        id: 'status',
        label: 'Status',
        fields: [
          { key: 'wpam_license_status', label: 'License status', type: 'text' },
          {
            key: 'wpam_license_site_limit',
            label: 'Site limit',
            type: 'number',
          },
          {
            key: 'wpam_license_grace_period_days',
            label: 'Grace period (days)',
            type: 'number',
          },
          {
            key: 'wpam_update_channel',
            label: 'Update channel',
            type: 'select',
            options: CHANNEL,
          },
          {
            key: 'wpam_telemetry_opt_in',
            label: 'Telemetry opt-in',
            type: 'switch',
          },
        ],
      },
    ],
  },
]
