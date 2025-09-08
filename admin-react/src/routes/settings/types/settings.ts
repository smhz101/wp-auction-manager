// ---------------------------------------------
// Shared types for Settings pages (type-only file)
// ---------------------------------------------

export type BidStatus = 'leading' | 'outbid' | 'won' | 'lost'
export type RealtimeProvider = 'none' | 'pusher'

export type Settings = {
  // Auction defaults
  wpam_default_increment: number
  wpam_default_relist_limit: number
  wpam_max_extensions: number
  wpam_soft_close: number
  wpam_soft_close_extend: number
  wpam_soft_close_threshold: number
  wpam_buyer_premium: number
  wpam_seller_fee: number

  // Feature toggles
  wpam_enable_email: boolean
  wpam_enable_firebase: boolean
  wpam_enable_proxy_bidding: boolean
  wpam_enable_silent_bidding: boolean
  wpam_enable_toasts: boolean
  wpam_enable_twilio: boolean
  wpam_require_kyc: boolean

  // Providers
  wpam_realtime_provider: RealtimeProvider
  wpam_default_auction_type?: string

  // Keys/Secrets/URLs
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

  // Design (dummy)
  wpam_brand_primary?: string
  wpam_brand_logo_url?: string

  // Licensing (dummy)
  wpam_license_key?: string
}

export type Boot = {
  adminUrl: string
  nonce: string
  restUrl: string
}
