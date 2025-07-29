# Project: WP Auction Manager – WooCommerce Auction Plugin

Author: Muzammil Hussain  
Author URI: https://muzammil.dev  
Version: 1.0.0

---

## 🧠 Purpose

This plugin allows WooCommerce store admins to convert products into real-time auctions with full control over bidding, scheduling, real-time updates, notifications, user watchlists, and identity verification. The plugin must support **shared hosting by default**, with optional **third-party integrations** for SMS, email, WebSockets, KYC, and push notifications via API key setup.

---

## 📁 Folder & File Structure (Prefix: wpam)

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
│ ├── class-twilio-provider.php
│ ├── class-pusher-provider.php
│ └── class-sendgrid-provider.php
├── public/
│ ├── class-wpam-public.php
│ └── js/ajax-bid.js
├── templates/
│ ├── single-auction.php
│ └── auction-listing.php
├── uninstall.php
├── wp-auction-manager.php
```

---

## 📦 Plugin Features Breakdown

### ✅ Product Type & Meta

- Register `wc-auction` as a custom WooCommerce product type.
- Add auction-specific fields:
  - Auction Type (standard, reverse, sealed)
  - Start & End Date
  - Reserve Price
  - Buy Now Price
  - Minimum Increment
  - Soft Close & Extension Period
  - Auto Relist
  - Max Bids Per User
  - Auction Fee
- Validate and save product meta data.

---

### ✅ Auction Engine

- Schedule auction start/end via WP-Cron.
- Track current/highest bid.
- Soft-close logic: extend auction time by X minutes if bid placed within last Y seconds.
- Handle winner selection on auction end.
- Automatic WooCommerce order creation for winner.
- Optional: Stripe auto-payment trigger on win.

---

### ✅ Bid System

- Place manual or proxy bid via frontend.
- Validate min increment, time, and user eligibility.
- Real-time updates via:
  - Default: AJAX polling
  - Optional: WebSockets (Pusher/Socket.io Cloud)
- Proxy bid logic for auto-bidding until user max.
- Maintain bid logs in `wp_wc_auction_bids` table.

---

### ✅ Watchlist System

- Allow users to add auctions to their watchlist.
- Notify users via email/SMS when:
  - Auction is about to start
  - Auction is ending soon
  - Bid is outbid
  - User wins
- Manage watchlist from My Account → Watchlist tab.

---

### ✅ Messaging & Q&A System

- On single-auction page, allow users to ask seller questions.
- Display public Q&A thread per auction.
- Optional: Private messages (admin toggled).

---

### ✅ Admin Dashboard

- List all auctions with:
  - Filters: status, type, date
  - Actions: Edit, End Now, Relist, View Bids
- View all bids for an auction.
- Manually set winner if needed.
- View users’ watchlists.
- View auction questions/messages.
- View auction reputation/ratings.

---

### ✅ Frontend Pages/Templates

- `auction-listing.php`: show active/upcoming auctions.
- `single-auction.php`: show auction info, bid input, countdown timer, watchlist button, Q&A thread.
- Use Woo template structure and hooks for integration.

---

### ✅ User Features (Frontend)

- My Account → My Bids
- My Account → Watchlist
- My Account → Auctions Won
- View history of past auctions

---

### ✅ Third-Party Integration (Optional via Settings > Integrations)

- **Push Notifications**: Firebase / OneSignal
- **WebSockets**: Pusher / Socket.io
- **SMS**: Twilio / Nexmo
- **Email**: SendGrid / Mailgun
- **KYC/Verification**: Stripe Identity / Onfido
- Use dynamic admin settings UI for enabling/disabling each integration via API key.

---

## 🧱 Database Schema (To Be Created on Activation)

Tables:

- `wp_wc_auction_products`
- `wp_wc_auction_bids`
- `wp_wc_auction_watchlists`
- `wp_wc_auction_messages`
- `wp_wc_auction_reputation`
- `wp_wc_auction_kyc` _(optional if KYC enabled)_

---

## 🔄 Realtime Logic

- `ajax-bid.js`: frontend polling every 5 seconds (fallback).
- Admin toggle: Use WebSocket if enabled and configured.
- Ensure graceful fallback to polling if socket fails.

---

## 🔔 Notifications

- Enable via admin > settings > integrations
- Templates:
  - Auction Start Reminder
  - Bid Outbid Notification
  - Winner Notification
  - Watchlist Expiry Reminder

Send via:

- WordPress Email (default)
- SendGrid (if key provided)
- SMS (if key provided)

---

## 🎨 UX/UI Goals

- Modern, responsive UI using Tailwind or Woo styles
- Clean admin UX using tabs, collapsibles, and tables
- WCAG 2.1 Accessibility compliant

---

## 🧪 Testing Scenarios

- Shared Hosting: all default features must work without sockets
- Dedicated Hosting: sockets, KYC, video embedding enabled
- Third-party disabled: fallbacks must still work
- Edge Cases: auction ending during bid, no winner, tied bids, invalid payment

---

## 📈 Future Features (Roadmap After Launch)

- Live video stream integration (YouTube Embed, Agora)
- Gamified leaderboard for top bidders
- Tokenized or NFT auctions (web3)
- Referral rewards system
- Multi-step KYC (for high-value bids)
- Analytics dashboard: bids over time, conversions, top users

---

## ✅ Expected Deliverables

- Fully working plugin with modular third-party integrations
- Admin settings interface
- Custom DB tables
- REST API endpoints
- Custom product type UI
- Bid engine (AJAX + optional socket)
- Real-time frontend experience
- Complete documentation + installation/setup guide
