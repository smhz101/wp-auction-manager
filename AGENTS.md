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
│       ├── auction-date-picker.js
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
