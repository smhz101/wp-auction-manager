=== WP Auction Manager ===
Contributors: muzammilhussain
Tags: auction, woocommerce, bidding, ecommerce, marketplace
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.4
Stable tag: 1.0.3
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Transform your WooCommerce store into a powerful auction platform with real-time bidding, watchlists, and advanced auction management.

== Description ==

WP Auction Manager extends WooCommerce by adding a complete auction system to your WordPress site. Create timed auctions, accept bids, and automatically generate orders for winning bidders—all seamlessly integrated with your existing WooCommerce store.

= Key Features =

**Auction Types**
* Standard auctions - highest bid wins
* Reverse auctions - lowest bid wins
* Sealed auctions - bids hidden until close

**Advanced Bidding**
* Proxy bidding - automatic outbidding up to maximum
* Silent bidding - hide all bids until auction ends
* Minimum bid increments
* Maximum bids per user limits
* Soft-close anti-sniping protection

**Auction Management**
* Reserve price requirements
* Buy Now instant purchase option
* Auto-relist with configurable delays
* Scheduled start and end times
* Auction fees and commissions

**User Features**
* Personal watchlist for tracking auctions
* My Bids dashboard
* Auctions Won history
* Q&A messaging with sellers
* Email and SMS notifications

**Real-time Updates**
* AJAX polling (default)
* Pusher WebSocket integration
* Firebase push notifications
* Live bid updates without page refresh

**Security & Compliance**
* KYC verification system
* Fraud detection and user flagging
* Comprehensive audit trails
* IP and user agent logging

**Developer Friendly**
* REST API endpoints
* Gutenberg block for auctions
* React-based frontend app
* Shortcodes for easy integration
* Webhook support
* PSR-4 autoloading
* Extensive action and filter hooks

= Ecosystem & Integrations =

WP Auction Manager integrates with multiple third-party services to enhance functionality:

* **WooCommerce** - Core dependency for product and order management
* **Twilio** - SMS notifications for bid alerts
* **Firebase** - Push notifications for mobile users
* **Pusher** - Real-time WebSocket updates
* **SendGrid** - Enhanced email delivery

= Use Cases =

* Online auction houses
* Charity fundraising events
* Liquidation sales
* Art and collectibles marketplaces
* Real estate auctions
* Vehicle auctions
* Equipment and machinery sales

== Installation ==

= Minimum Requirements =

* WordPress 5.0 or greater
* WooCommerce 5.0 or greater
* PHP 7.4 or greater
* MySQL 5.6 or greater

= Automatic Installation =

1. Log in to your WordPress dashboard
2. Navigate to Plugins → Add New
3. Search for "WP Auction Manager"
4. Click "Install Now" and then "Activate"

= Manual Installation =

1. Download the plugin zip file
2. Upload to `/wp-content/plugins/wp-auction-manager/`
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Ensure WooCommerce is installed and activated

= Initial Setup =

1. Navigate to **Auctions → Settings** in your WordPress admin
2. Configure your auction defaults (soft-close, increments, etc.)
3. Set up optional integrations (Twilio, Pusher, Firebase)
4. Create your first auction under **Products → Add New**
5. Select "Auction" as the product type

== Frequently Asked Questions ==

= Does this plugin require WooCommerce? =

Yes, WP Auction Manager is built as an extension to WooCommerce and requires it to be installed and active.

= Can I run multiple auctions simultaneously? =

Absolutely! You can run unlimited concurrent auctions with different settings and schedules.

= How does proxy bidding work? =

Proxy bidding allows users to set a maximum bid amount. The system automatically outbids other users on their behalf up to their maximum, using the minimum increment.

= What happens when an auction ends? =

When an auction ends, the highest bidder (or lowest for reverse auctions) automatically receives a WooCommerce order. The winner is notified via email and can complete checkout.

= Can I prevent bid sniping? =

Yes! Enable soft-close protection. If a bid is placed within the threshold (default 30 seconds), the auction automatically extends by the configured duration.

= How do I enable real-time updates? =

By default, the plugin uses AJAX polling. For true real-time updates, configure Pusher credentials under **Auctions → Settings → Integrations**.

= Can users track auctions they're interested in? =

Yes, users can add auctions to their watchlist and view them at `/my-account/watchlist/`.

= Is the plugin translation ready? =

Yes, WP Auction Manager is fully internationalized with a `.pot` file included in the `/languages/` directory.

= Can I customize the auction templates? =

Yes, copy templates from `/wp-content/plugins/wp-auction-manager/templates/` to `/wp-content/themes/your-theme/wp-auction-manager/` and customize as needed.

= Does it work with Gutenberg? =

Yes! The plugin includes a native Gutenberg block for displaying auctions. Search for "Auction" in the block inserter.

== Screenshots ==

1. Auction product type with comprehensive settings panel
2. Live auction display with countdown timer and bid form
3. Admin auctions management table with filters
4. User watchlist dashboard
5. Bid history and audit trail
6. Settings panel with integration options
7. Gutenberg auction block in the editor
8. Mobile-responsive auction interface

== Changelog ==

= 1.0.3 - 2025-07-31 =
* Added: Pre-populated default start and end dates for new auctions
* Added: Flatpickr date picker integration
* Improved: User experience when creating auctions

= 1.0.2 - 2025-07-30 =
* Added: Search functionality in admin auctions table
* Added: Auction type filter for admin listings
* Added: WordPress component styles for admin pages
* Improved: Admin interface usability

= 1.0.1 - 2025-07-29 =
* Added: Automatic WooCommerce order creation on auction end
* Added: Winner notification system via email
* Improved: Post-auction workflow automation

= 1.0.0 - Initial Release =
* Initial public release
* Complete auction system for WooCommerce
* Multiple auction types and bidding strategies
* Real-time integrations and notifications
* Comprehensive admin tools and user dashboards

== Upgrade Notice ==

= 1.0.3 =
Improved auction creation experience with date picker and default values.

= 1.0.2 =
Enhanced admin interface with search and filtering capabilities.

= 1.0.1 =
Automatic order creation for auction winners. Recommended upgrade for all users.

== Plugin Lifecycle ==

= Activation =
Upon activation, the plugin:
* Creates 8 custom database tables for bids, watchlists, messages, audit logs, KYC, flagged users, admin logs, and notifications
* Registers custom user capabilities for auction management
* Adds rewrite endpoints for user dashboards (/watchlist, /my-bids, /auctions-won)
* Schedules recurring cron jobs for auction state management
* Flushes rewrite rules for clean URLs

= Runtime =
During normal operation:
* Hourly cron checks for ended auctions and updates states
* Event-driven architecture processes auction start/end events
* AJAX handlers process real-time bid submissions
* REST API endpoints serve data to frontend applications
* Notification providers send alerts via email, SMS, or push

= Deactivation =
When deactivated:
* All scheduled cron events are cleared
* Transient cache entries are purged
* Rewrite rules are flushed
* Database tables and data are preserved

= Uninstallation =
Complete removal via uninstall.php:
* Drops all custom database tables
* Removes all plugin options and settings
* Deletes custom user capabilities
* Cleans up post meta for auction products

== Developer Documentation ==

= Shortcodes =

`[wpam_auctions]` - Display paginated list of live auctions
`[wpam_auctions per_page="6"]` - Limit auctions per page
`[wpam_auction_app]` - Load React-based auction interface

= REST API Endpoints =

* `POST /wp-json/wpam/v1/bid` - Place a bid
* `GET /wp-json/wpam/v1/auction/{id}/highest` - Get highest bid
* `POST /wp-json/wpam/v1/watchlist` - Toggle watchlist
* `GET /wp-json/wpam/v1/watchlist` - Get user's watchlist

= Action Hooks =

* `wpam_auction_start` - Fired when auction begins
* `wpam_auction_end` - Fired when auction closes
* `wpam_bid_placed` - Fired after successful bid
* `wpam_auction_won` - Fired when winner is determined

= Filter Hooks =

* `wpam_bid_amount` - Modify bid amount before validation
* `wpam_auction_settings` - Customize auction settings
* `wpam_notification_message` - Filter notification content

= Building Block Assets =

If you modify block source files:
```
npm install
npm run build
```

== Support ==

For support, feature requests, and bug reports, please visit:
https://github.com/smhz101/wp-auction-manager

== Privacy Policy ==

WP Auction Manager stores the following user data:
* Bid amounts and timestamps
* Watchlist preferences
* Auction messages and Q&A threads
* IP addresses and user agents for audit purposes
* KYC verification data (if enabled)

This data is stored in custom database tables and is deleted upon plugin uninstallation. When using third-party integrations (Twilio, Firebase, Pusher, SendGrid), please review their respective privacy policies.
