## 📁 Folder & File Structure (Prefix: wpam)

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
```
