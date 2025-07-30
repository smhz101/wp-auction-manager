## 📁 Folder & File Structure (Prefix: wpam)

```
├── AGENTS.md
├── CHANGELOG.md
├── PROMPT.md
├── README.md
├── admin
│   ├── class-wpam-admin.php
│   ├── class-wpam-auctions-table.php
│   ├── class-wpam-bids-table.php
│   ├── class-wpam-messages-table.php
│   ├── css
│   │   └── wpam-admin.css
│   └── js
│       ├── select-auction-product-type.js
│       └── settings-app.js
├── bin
│   └── install-wp-tests.sh
├── build
│   └── blocks
│       └── auction
│           ├── block.json
│           ├── index.asset.php
│           └── index.js
├── composer.json
├── composer.lock
├── includes
│   ├── api-integrations
│   │   ├── class-api-provider.php
│   │   ├── class-firebase-provider.php
│   │   ├── class-pusher-provider.php
│   │   ├── class-realtime-provider.php
│   │   ├── class-sendgrid-provider.php
│   │   └── class-twilio-provider.php
│   ├── class-wpam-auction.php
│   ├── class-wpam-bid.php
│   ├── class-wpam-blocks.php
│   ├── class-wpam-install.php
│   ├── class-wpam-kyc.php
│   ├── class-wpam-loader.php
│   ├── class-wpam-messages.php
│   ├── class-wpam-notifications.php
│   └── class-wpam-watchlist.php
├── languages
│   └── wp-auction-manager.pot
├── package-lock.json
├── package.json
├── patterns
│   └── auction-details.php
├── phpcs.xml
├── public
│   ├── class-wpam-public.php
│   ├── css
│   │   └── wpam-frontend.css
│   └── js
│       ├── ajax-bid.js
│       ├── ajax-messages.js
│       └── react
│           └── auction-app.js
├── src
│   └── blocks
│       └── auction
│           ├── block.json
│           └── index.js
├── templates
│   ├── auction-listing.php
│   ├── auctions-won.php
│   ├── my-bids.php
│   └── single-auction.php
├── tests
│   ├── bootstrap.php
│   ├── test-bid-limit.php
│   ├── test-bid-status.php
│   ├── test-bid.php
│   ├── test-kyc.php
│   ├── test-watchlist-auth.php
│   ├── test-watchlist.php
│   └── wp-tests-config.php
├── uninstall.php
└── wp-auction-manager.php
```

---

# 🛠️ Product Editing – Auction Features

## 🎯 Editing Auction Products

- [ ] If a product is of type `auction`, show auction-related fields in the product edit view.
- [ ] Display the "Auction" tab with all options when editing an auction product.
- [ ] In **edit mode**, disable the following fields if the auction has already started:
  - Auction Start Date (must not be editable)

---

# 🧩 Missing and Incomplete Features in `wp-auction-manager`

This document outlines missing or partially implemented features to help guide the next development sprints of the plugin. It includes critical backend validations, auction types, lifecycle management, fraud detection, notification systems, and UI/UX polish suggestions.

---

## 🧠 Bidding Engine & Validation

### 🔍 Missing

- No current bid validation engine exists to handle edge rules or user limits.

### 🛠 Suggested Implementation

- Validate bids for:
  - Minimum increment per auction
  - Reserve price conditions
  - User-specific limits (daily or per auction)
- Reject duplicate or rapid-fire bids with proper messages and logs
- Enforce backend-side rules even if frontend is bypassed

---

## 🚨 Security & Fraud Prevention

### ❌ Missing

- No tracking of bid origin or detection of suspicious behavior

### 🛠 Suggested Implementation

- Store IP address, user agent, and timestamps with every bid
- Detect patterns like:
  - Multiple accounts on same IP
  - VPN/TOR access
  - Bot-like bid frequency
- Maintain audit logs and flagged account table for admin review

---

## 🧾 Bid History & Transparency

### ✅ Partially Implemented

- Bids are stored but not exposed publicly or transparently

### 🛠 Suggested Improvements

- Store:
  - Bidder ID
  - Bid amount
  - Status (valid/invalid)
  - Timestamp
- Allow optional anonymized public display (e.g., Bidder #4312)
- Allow admin to export bid logs

---

## ⏱️ Auto Extensions (Anti-Sniping)

### ❌ Missing

- No extension if last-minute bid is placed

### 🛠 Suggested Implementation

- Extend auction if a bid is placed in last `X` seconds
- Limit number of extensions to avoid infinite loops
- Store extensions in metadata for audit trail

---

## 💬 User Notifications

### ⚠️ Limited

- Email only; no SMS/browser push

### 🛠 Suggested Enhancements

- Notify users via:
  - Email (SendGrid/Mail)
  - Twilio SMS (if number provided)
  - Optional browser push (using Firebase or Pusher)
- Events:
  - Outbid
  - Auction started
  - Auction won/lost
  - Auction canceled or relisted
- Notifications must support cron-based queue processing

---

## 🤖 Cron Jobs / Background Workers

### ❌ Missing or Incomplete

- Some state changes might rely on manual intervention

### 🛠 Suggested Implementation

- Use `wp_schedule_event()` for:
  - Changing auction status from `scheduled → live → ended`
  - Running auto-relist conditions
  - Finalizing results
- Must evaluate bid success, goal status, and update auction metadata

---

## 🧩 Integration with Orders & Payments

### ❌ Not Integrated

- No clear link with WooCommerce checkout flow

### 🛠 Suggested Implementation

- On auction end with winner:
  - Generate WooCommerce order pre-filled with winning bid
  - Block other buyers from purchasing
  - Set payment deadline window
  - If not paid → mark expired, optionally auto-relist

---

## 🔁 Relisting Policies

### ⚠️ Basic

- Manual relist only; no logic/strategy

### 🛠 Suggested Enhancements

- Configurable relist strategies:
  - Auto-relist if no valid bid
  - Auto-increase/decrease price
  - Auto schedule next start in X days
- Decide:
  - Keep old bid history?
  - Reset stats?
- Notify seller and watchers of relist

---

## 🗃️ Admin Audit Trail

### ❌ Missing

- No admin-side logging of critical actions

### 🛠 Suggested Implementation

- Log actions like:
  - Suspend/unsuspend
  - Cancel
  - Manual price edit
  - Force close
- Include:
  - Timestamp
  - Admin user
  - Affected auction/product ID

---

## 📈 Reporting & Analytics

### ❌ Missing

- No dashboard analytics or exports

### 🛠 Suggested Implementation

- Admin dashboard with:
  - Total auctions
  - Success/failure rates
  - Revenue metrics
  - Active bidders list
- Export to CSV/Excel for:
  - Bids
  - Auction summaries
  - KYC verifications

---

## 🔄 REST API & Webhooks (Optional)

### ⚠️ Partial

- Some API integration exists (e.g., Twilio, Pusher), no REST endpoints

### 🛠 Suggested Implementation

- REST endpoints for:
  - Bidding
  - Watching
  - Status fetching
- Webhooks for:
  - Auction ended
  - Auction won
  - New bid placed
- Allow admin to configure webhook URLs

---

## 🔧 Auction Type Selection (Standard, Reserve, Sealed, etc.)

### ⚠️ Incomplete

- No strong logic separation between auction types

### 🛠 Suggested Implementation

- Create `auction_type` taxonomy or meta:
  - `standard`, `sealed`, `proxy`, `reserve`, `silent`
- Based on type, modify bid behavior, visibility, and results
- Edit screen should disable editing auction type and start time after auction has started

---

## 🕓 Auction Lifecycle & State Management

### ❌ Missing

- Backend does not maintain complete auction state machine

### 🛠 Suggested Implementation

- States:
  - `about_to_start`
  - `live`
  - `ended`
  - `cancelled`
  - `closed`
  - `expired`
  - `suspended`
  - `failed`
  - `completed`
- Determine final result:
  - Was reserve met?
  - Any valid bids?
  - Auction ended due to error?
- Store `ending_reason`:
  - `reserve_not_met`, `manual_cancel`, `no_bids`, `payment_timeout`, etc.

---

## 🔁 Relist Feature Enhancements

### 🛠 Additional Suggestions

- Relist counter and limits
- Auto-adjust:
  - Start price
  - Reserve
  - Duration
- "Auto-Relist if no bids" toggle
- Seller dashboard view of relist status and performance

---

## 🔄 Proxy Bidding (Automatic Increment Bidding)

### ❌ Missing

- Proxy logic not present

### 🛠 Suggested Implementation

- Allow user to set `max_bid`
- System auto-bids on behalf of user until outbid
- Must log automatic bids for transparency
- Show proxy indicator in bid history

---

## 🤐 Silent Bidding (Hidden Bids)

### ❌ Missing

- Bids are visible before auction ends

### 🛠 Suggested Implementation

- Bids saved but hidden from all users
- Shown only after auction ends
- Helps eliminate copy-bidding

---

## 🔐 Sealed Auction

### ❌ Missing

- No sealed-bid support

### 🛠 Suggested Implementation

- Similar to silent bidding but:
  - No bid visibility to anyone (including self)
  - Winner revealed only after close
- High trust model for enterprise/pro use cases

---

## 🎯 Reserve Price Auction

### ❌ Missing

- No support for minimum win threshold

### 🛠 Suggested Implementation

- Admin sets `reserve_price`
- Auction only “successful” if bid ≥ reserve
- Notify user “You are highest bidder, but reserve not met”

---

## 👑 Buyer Premium

### ❌ Missing

- No extra fee calculated for buyers

### 🛠 Suggested Implementation

- Global and per-auction setting: buyer_premium %
- Show on product page
- Add to WooCommerce total during checkout

---

## 📊 Seller Fee Rates

### ❌ Missing

- No seller commission logic

### 🛠 Suggested Implementation

- Flat or % fee on total sale amount
- Display clearly in seller panel
- Deduct during payout (optional)

---

## 🔧 Admin Product Panel – UI/UX Improvements

### 🛠 Suggested Enhancements

- On edit screen:
  - Auto-show auction fields if product type is auction
  - Disable certain fields (e.g., start time) if auction has begun
- Use better datetime picker (flatpickr or similar)
- Default auction start/end times to logical values (e.g., now +1h)
- At bottom of product data panel:
  - Show current WP time, timezone, offset
  - Use colored background for visibility
- Adjust form field widths and alignment

---

## 🧪 Deep Plugin Audit & Technical Gaps

### 🔍 Observed

- Auction start/end not enforced strictly
- UI misalignment on product screen
- No fallback timezone logic
- No input sanitization in AJAX handlers

### 🛠 Fix Suggestions

- Use `wp_timezone()` and `wp_date()` everywhere
- Use `sanitize_text_field()` and `esc_html()` on all dynamic values
- Move JS validation to reusable module
- Create a dedicated admin settings API class
- Ensure nonces are used in all forms (AJAX + save)

---

## ✅ Summary: Priority Development Roadmap

| Priority  | Feature                                                                |
| --------- | ---------------------------------------------------------------------- |
| 🔥 High   | Proxy bidding, Reserve price, Auction status lifecycle, Bid validation |
| ⚠️ Medium | Admin logging, Notification system, Sealed auctions                    |
| 🌱 Low    | REST API, Webhooks, Buyer/Seller fees, Reporting                       |

---

> **Note:** This audit is based on file-level analysis and static logic. Live environment testing and database behavior may reveal more bugs or runtime edge cases.
