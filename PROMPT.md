# Project: WP Auction Manager – WooCommerce Auction Plugin

You are Codex GPT, responsible for building a scalable WooCommerce Auction Plugin that works on shared hosting with optional third-party integrations.

## 🧠 Objective

Create a WordPress plugin that allows admins to convert WooCommerce products into auction products. The plugin must support standard auction features by default and offer scalable advanced features via third-party API integrations.

---

## ✅ Phase 1: Core Functionality (Shared Hosting Compatible)

### Tasks:

- Create `wp-auction-manager.php` as the main plugin file.
- Setup plugin constants and loader class.
- Register custom product type `auction`.
- Create database migration for:
  - `wp_wc_auction_products`
  - `wp_wc_auction_bids`
  - `wp_wc_auction_watchlists`
  - `wp_wc_auction_messages`
  - `wp_wc_auction_reputation`
- Add auction settings to WooCommerce product editor.
- Create AJAX-based bidding mechanism (poll every 5–10 seconds).
- Add hooks for:
  - On auction end (calculate winner)
  - On bid placed (check proxy bid logic)

---

## 🔌 Phase 2: Integration Layer (API Key-Based)

### Tasks:

- Build settings page with tabbed UI:
  - General Settings
  - Notifications
  - Real-Time Updates
  - KYC & Verification
- Allow user to enter API keys for:
  - Email (SendGrid, Mailgun)
  - SMS (Twilio, Nexmo)
  - Push Notifications (Firebase, OneSignal)
  - Sockets (Pusher, Socket.io Cloud)
  - KYC (Stripe Identity, Jumio)
- Create `class-api-provider.php` (base interface)
- Extend per provider: `class-twilio-provider.php`, `class-pusher-provider.php`, etc.
- Ensure fallback logic (AJAX fallback for sockets, SMTP fallback for email)

---

## 💻 Phase 3: Admin + Frontend UX

### Admin Tasks:

- Admin screen to list all auctions with filters
- Auction detail view (bids, status, edit, relist, end now)
- Watchlist view (users watching which auctions)
- Reputation manager (feedback list)

### Frontend Tasks:

- Auction listing page (`archive-auction.php`)
- Single auction page (`single-auction.php`)
- My Auctions section (under My Account)
- Watchlist management interface
- Bid submission via AJAX
- Countdown timer per auction (JS)

---

## 📁 Folder Structure Guidelines

```
wp-auction-manager/
├── admin/
│ └── class-wcap-admin.php
├── includes/
│ ├── class-wcap-loader.php
│ ├── class-wcap-auction.php
│ ├── class-wcap-bid.php
│ └── api-integrations/
│ ├── class-api-provider.php
│ └── class-twilio-provider.php
├── public/
│ ├── class-wcap-public.php
│ └── js/ajax-bid.js
├── templates/
│ ├── single-auction.php
│ └── auction-listing.php
├── uninstall.php
├── wp-auction-manager.php
```

---

## 🎯 Goal

Deliver a fully working WooCommerce Auction plugin that:

- Runs on shared hosting by default
- Supports scalable real-time enhancements via user-provided API keys
- Provides smooth UI/UX for both admin and users
- Is extensible and modular for long-term maintenance
