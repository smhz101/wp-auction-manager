# Agent Roles for WP Auction Manager

## 🧱 Database Agent

- Role: Define and create scalable, normalized database schema for auction functionality.
- Responsibilities:
  - Run table creation logic on plugin activation.
  - Ensure tables are indexed for performance.
  - Create uninstaller script to clean up data if needed.

## 🔄 Core Logic Agent

- Role: Handle core plugin mechanics and auction logic.
- Responsibilities:
  - Create custom WooCommerce product type "wc-auction"
  - Handle auction scheduling, bidding, soft-close
  - Manage automatic winner detection and relisting
  - Build REST and AJAX handlers

## 💬 Realtime Communication Agent

- Role: Build fallback-safe real-time communication layer.
- Responsibilities:
  - Default: AJAX polling
  - Optional: WebSocket providers (Pusher, Socket.io Cloud)
  - Include API interface, switchable via admin settings

## 📡 Notifications Agent

- Role: Handle outbound notifications.
- Responsibilities:
  - Basic: WordPress email
  - Optional: Twilio for SMS, Firebase/OneSignal for push
  - Implement modular class-based structure per provider

## 🛡️ KYC Agent

- Role: Handle identity verification via external services.
- Responsibilities:
  - Stripe Identity or Jumio
  - Admin view of KYC status
  - Store KYC status per user

## 🧑‍🎨 UI/UX Agent

- Role: Design admin and frontend experience.
- Responsibilities:
  - Figma wireframes for admin & frontend
  - Templates for:
    - Auction Listings
    - Single Auction View
    - My Account → Auctions
    - Watchlist
  - Build admin settings page with integrations

## 🧪 Testing Agent

- Role: Ensure quality and fallback logic works
- Responsibilities:
  - Test shared-hosting compatibility
  - Test each third-party service
  - Ensure clean fallback when API is not enabled

## 📁 Basic Folder Structure Guidelines

```
wp-auction-manager/
├── admin/
│ └── class-wpam-admin.php
├── includes/
│ ├── class-wpam-loader.php
│ ├── class-wpam-auction.php
│ ├── class-wpam-bid.php
│ └── api-integrations/
│ ├── class-api-provider.php
│ └── class-twilio-provider.php
├── public/
│ ├── class-wpam-public.php
│ └── js/ajax-bid.js
├── templates/
│ ├── single-auction.php
│ └── auction-listing.php
├── uninstall.php
├── wp-auction-manager.php
```
