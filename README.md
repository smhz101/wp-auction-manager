# WP Auction Manager

WP Auction Manager is a WordPress plugin that extends WooCommerce by adding an "Auction" product type. Store owners can schedule auctions, accept bids and let users maintain a watchlist. Bids and watchlists are stored in custom database tables.
The plugin also supports a question and answer thread on each auction so potential bidders can communicate with the seller.

## Installation

1. Download or clone this repository into `wp-content/plugins/wp-auction-manager`.
2. Ensure **WooCommerce** is installed and activated.
3. Activate **WP Auction Manager** from the WordPress Plugins screen.

### Activation prerequisites

- WordPress 5.0 or higher
- WooCommerce 5.0 or higher

## Basic usage

1. In your WordPress dashboard navigate to **Products → Add New**.
2. Choose **Auction** from the product type dropdown.
3. Set the auction start and end dates in the Auction tab.
4. Publish the product to start the auction at the scheduled time.
5. When the auction ends, the highest bidder receives a WooCommerce order automatically.

### Auction options

When editing an auction product you can configure additional options in the **Auction** tab:

- **Auction Type** – choose Standard, Reverse or Sealed.
- **Reserve Price** – minimum price required for the auction to have a winner.
- **Buy Now Price** – optional instant purchase price.
- **Minimum Increment** – smallest allowed increase between bids.
- **Soft Close Threshold** – number of seconds before closing when bids will extend the auction.
- **Extension Duration** – seconds added to the end time when the threshold is triggered.
- **Auto Relist** – automatically relist when no winning bid exists. Configure a relist limit, delay before relisting and optional price adjustments.
- **Max Bids Per User** – limit how many bids each user can place.
- **Auction Fee** – extra fee added to the winning bid.
- **Proxy Bidding** – automatically outbid others up to a maximum amount. Available for standard auctions when enabled in settings; not supported for reverse auctions.
- **Silent Bidding** – hides all bids until the auction ends. Sealed auctions are always silent, and standard auctions can enable this when allowed in settings; reverse auctions do not support it.

The auction panel includes a contextual help column. Hover or focus on any field to see a description in the right-hand panel, replacing WooCommerce's default tooltips.

### Soft-close settings

Under **Auctions → Settings** you can configure the soft-close threshold and the extension duration. If a bid arrives within the threshold, the end time is extended by the duration. By default both values are 30 seconds.
The older `Soft Close Duration` option is still honored when the new values are empty; it sets both the threshold and the extension length in seconds.

### Integration settings

-The **Integrations** tab lets you connect optional services.

- **Twilio** – enable SMS alerts and fill in your account SID, token and from number. Enable "Bid SMS Alerts" to text bidders when they take or lose the lead.
- **Firebase** – toggle Firebase push notifications and provide the server key.
- **Pusher** – choose "Pusher" under Realtime Provider and enter your app credentials for WebSocket updates.

### Admin logs

View auction events under **Auctions → Logs**. Endings, reserve price failures and relists are recorded per auction.

## Folder structure

````
# 📁 File & Folder Structure: `wp-auction-manager`

```
wp-auction-manager/
├── admin/                          # Admin panel components (tables, menus, JS, styles)
│   ├── class-wpam-admin.php        # Registers admin menus, hooks, and pages
│   ├── class-wpam-auctions-table.php # Custom table for managing auctions in admin
│   ├── class-wpam-bids-table.php   # Admin bids listing table
│   ├── class-wpam-messages-table.php # Admin messages system table
│   ├── css/
│   │   └── wpam-admin.css          # Styles for admin interface
│   └── js/
│       ├── select-auction-product-type.js # Product type JS toggle logic
│       └── settings-app.js         # Settings panel JS (likely Vue or vanilla)
├── bin/
│   └── install-wp-tests.sh         # Script for setting up WP Unit Test environment
├── build/                          # Compiled assets for blocks (Gutenberg)
│   └── blocks/
│       └── auction/
│           ├── block.json          # Gutenberg block registration file
│           ├── index.asset.php     # Asset loader for block
│           └── index.js            # Compiled JS block logic
├── composer.json                  # PHP dependencies & autoload config
├── composer.lock
├── includes/                       # Core backend classes and logic
│   ├── api-integrations/           # Third-party service providers
│   │   ├── class-api-provider.php
│   │   ├── class-firebase-provider.php
│   │   ├── class-pusher-provider.php
│   │   ├── class-realtime-provider.php
│   │   ├── class-sendgrid-provider.php
│   │   └── class-twilio-provider.php
│   ├── class-wpam-auction.php      # Auction model logic (create, update, queries)
│   ├── class-wpam-bid.php          # Handles bid placing, validation, and retrieval
│   ├── class-wpam-blocks.php       # Registers Gutenberg blocks (backend-side)
│   ├── class-wpam-install.php      # Activation/install routines (DB setup etc.)
│   ├── class-wpam-kyc.php          # KYC verification and storage handler
│   ├── class-wpam-loader.php       # Plugin loader (binds everything together)
│   ├── class-wpam-messages.php     # Handles internal messaging features
│   ├── class-wpam-notifications.php# Notification triggers (email/SMS/etc.)
│   └── class-wpam-watchlist.php    # User auction watchlist feature logic
├── languages/
│   └── wp-auction-manager.pot      # Translations template (i18n ready)
├── package.json                    # Node dependencies (for build tools)
├── package-lock.json
├── patterns/                       # WP block theme patterns
│   └── auction-details.php         # Possibly Gutenberg block layout pattern
├── phpcs.xml                       # PHP Code Sniffer config
├── public/                         # Frontend user-side scripts and logic
│   ├── class-wpam-public.php       # Hooks and features for site visitors
│   ├── css/
│   │   └── wpam-frontend.css       # Frontend auction styling
│   └── js/
│       ├── ajax-bid.js             # Handles AJAX bid submissions
│       ├── ajax-messages.js        # Handles AJAX messages/chat
│       └── react/
│           └── auction-app.js      # Frontend React app (possibly used in block or widget)
├── src/                            # Gutenberg block source code (before build)
│   └── blocks/
│       └── auction/
│           ├── block.json
│           └── index.js            # Source JS logic for Gutenberg auction block
├── templates/                      # PHP templates for rendering auction pages
│   ├── auction-listing.php         # Auction list view (loop)
│   ├── auctions-won.php            # User’s won auctions page
│   ├── my-bids.php                 # User’s placed bids view
│   └── single-auction.php          # Single auction detail page
├── tests/                          # PHPUnit test files
│   ├── bootstrap.php
│   ├── test-bid-limit.php
│   ├── test-bid-status.php
│   ├── test-bid.php
│   ├── test-kyc.php
│   ├── test-watchlist-auth.php
│   ├── test-watchlist.php
│   └── wp-tests-config.php
├── uninstall.php                   # Cleanup logic on plugin uninstall
├── wp-auction-manager.php          # Main plugin bootstrap file
├── README.md, CHANGELOG.md         # Developer documentation and changes
├── PROMPT.md, AGENTS.md            # Internal dev notes or instructions
````

## Development

The plugin uses AJAX polling by default to refresh the current highest bid every few seconds.
Future versions may swap to WebSocket providers found under `includes/api-integrations`.

Under **Auctions → Settings → Realtime Integration** you can select `None` or `Pusher` as the provider. Enter your Pusher app credentials to enable realtime WebSocket updates.
Twilio SMS notifications can be toggled via the `Enable Twilio Notifications` option (`wpam_enable_twilio`). When enabled, bid lead alerts are controlled by the `Enable Bid SMS Alerts` option (`wpam_lead_sms_alerts`).
Firebase push notifications are available through the `Enable Firebase` option (`wpam_enable_firebase`) once you provide a valid server key.
Email alerts are on by default. They can be disabled via the `Enable Email Notifications` option (`wpam_enable_email`). If a SendGrid API key is provided emails will be sent through SendGrid.

### Live auctions shortcode

Use the `[wpam_auctions]` shortcode on any page to display a paginated list of live auctions.

```
[wpam_auctions]
```

The optional `per_page` attribute controls how many auctions appear on each page:

```
[wpam_auctions per_page="6"]
```

### React frontend

The plugin includes a lightweight React application that can render either a list of auctions or a single auction view. Use the `[wpam_auction_app]` shortcode on any page to load the React interface. When used on a single auction product page the current auction is automatically displayed.

### Auction block

WP Auction Manager ships with a dynamic block registered via `@wordpress/scripts`. Search for **Auction** in the block inserter to add a live countdown, status labels and bid form anywhere within the block editor. Block attributes allow toggling each element and optionally specifying an Auction ID when used outside of the product screen.

### Building block assets

If you modify any files under `src/blocks`, run `npm install` once then `npm run build` to compile the assets into the `build/` directory. The plugin registers blocks from the compiled location, so rebuilt files are required for the block to appear correctly on the front end.

## REST API

Authenticated users can perform actions over the REST API using the `wpam/v1` namespace. Include a valid `X-WP-Nonce` header obtained with `wp_create_nonce( 'wp_rest' )` when using cookie authentication.

- `POST /wp-json/wpam/v1/bid` – Place a bid. Body parameters: `auction_id` (int), `bid` (float) and optional `max_bid` for proxy bidding.
- `GET  /wp-json/wpam/v1/auction/<id>/highest` – Fetch the current highest bid.
- `POST /wp-json/wpam/v1/watchlist` – Toggle the current user’s watchlist for an auction (`auction_id`).
- `GET  /wp-json/wpam/v1/watchlist` – Retrieve the user’s watchlist items.

Webhook events can be sent by configuring a URL under **Auctions → Settings → Webhooks**. A `POST` request is triggered on `wpam_auction_end` with JSON like:

```json
{ "event": "auction_end", "auction_id": 123 }
```

## Running unit tests

A `tests/` directory will contain PHPUnit tests in the future. Once available, install development dependencies and execute:

```bash
composer install
vendor/bin/phpunit
vendor/bin/phpcs
```

## Upgrade Notes

- Activating or updating the plugin now recalculates existing auction start and end times in UTC and reschedules their events.
