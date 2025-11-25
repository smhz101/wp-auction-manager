# Developer Guide: WP Auction Manager

This document provides technical insights into the plugin architecture, development workflow, and codebase organization for contributors and developers.

## Architecture Overview

WP Auction Manager follows a modular architecture built on top of WooCommerce's product system. The plugin extends WooCommerce by introducing a custom "Auction" product type with specialized bidding mechanics, real-time updates, and comprehensive auction management features.

### Core Components

**Product Type Extension**
The plugin registers a custom WooCommerce product type (`auction`) that inherits from `WC_Product` while adding auction-specific functionality like start/end times, bidding rules, and state management.

**Database Layer**
Custom tables store auction-specific data independently from WordPress post meta:
- `wc_auction_bids` - Bid history with timestamps and amounts
- `wc_auction_watchlists` - User watchlist associations
- `wc_auction_messages` - Q&A threads for auctions
- `wc_auction_audit` - Security audit trail for bid actions
- `wc_flagged_users` - Fraud detection records
- `wc_kyc_failures` - KYC verification logs
- `wc_auction_logs` - Admin action logs
- `wc_notification_logs` - Notification delivery tracking

**Event System**
WordPress cron handles auction lifecycle events:
- `wpam_auction_start` - Triggered when auction begins
- `wpam_auction_end` - Handles auction completion and winner determination
- `wpam_check_ended_auctions` - Hourly cleanup task
- `wpam_update_auction_states` - State synchronization

## Directory Structure

```
wp-auction-manager/
├── admin/                          # Backend administration
│   ├── class-wpam-admin.php        # Settings, menus, REST routes
│   ├── class-wpam-auctions-table.php
│   ├── class-wpam-bids-table.php
│   ├── class-wpam-messages-table.php
│   ├── css/wpam-admin.css
│   └── js/
│       ├── select-auction-product-type.js
│       └── settings-app.js
│
├── includes/                       # Core business logic
│   ├── class-wpam-auction.php      # Auction lifecycle management
│   ├── class-wpam-bid.php          # Bid processing and validation
│   ├── class-wpam-watchlist.php    # Watchlist functionality
│   ├── class-wpam-messages.php     # Q&A system
│   ├── class-wpam-notifications.php # Multi-channel notifications
│   ├── class-wpam-kyc.php          # Identity verification
│   ├── class-wpam-install.php      # Database schema and activation
│   ├── class-wpam-loader.php       # Plugin bootstrapper
│   ├── class-wpam-blocks.php       # Gutenberg integration
│   └── api-integrations/           # Third-party services
│       ├── class-api-provider.php
│       ├── class-pusher-provider.php
│       ├── class-firebase-provider.php
│       ├── class-twilio-provider.php
│       └── class-sendgrid-provider.php
│
├── public/                         # Frontend functionality
│   ├── class-wpam-public.php       # Public hooks and templates
│   ├── css/wpam-frontend.css
│   └── js/
│       ├── ajax-bid.js             # Bid submission and updates
│       ├── ajax-messages.js        # Real-time messaging
│       └── react/auction-app.js    # React SPA
│
├── src/blocks/auction/             # Gutenberg block source
│   ├── block.json
│   ├── index.js                    # Block editor component
│   ├── render.php                  # Server-side rendering
│   └── __tests__/edit.test.js      # Unit tests
│
├── build/blocks/auction/           # Compiled block assets
│
├── templates/                      # PHP template files
│   ├── single-auction.php
│   ├── auction-listing.php
│   ├── my-bids.php
│   └── auctions-won.php
│
├── tests/                          # PHPUnit test suite
│   ├── bootstrap.php
│   ├── test-bid.php
│   ├── test-watchlist.php
│   └── test-rest-capabilities.php
│
└── .github/workflows/ci.yml        # GitHub Actions CI/CD
```

## Development Workflow

### Prerequisites

- PHP 8.0 or higher
- Node.js 20.x or higher
- Composer 2.x
- WordPress 6.0+
- WooCommerce 7.0+

### Initial Setup

```bash
# Clone repository
git clone https://github.com/smhz101/wp-auction-manager.git
cd wp-auction-manager

# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install

# Build Gutenberg blocks
npm run build
```

### Development Commands

```bash
# Watch mode for block development
npm run start

# Build production assets
npm run build

# Run JavaScript tests
npm test

# Run JavaScript linter
npm run lint

# Run PHP tests (requires test database)
composer test

# Run PHP code sniffer
composer lint
```

### Code Standards

The project follows WordPress coding standards:
- **PHP**: WordPress Coding Standards (enforced via PHPCS)
- **JavaScript**: WordPress JavaScript Coding Standards (enforced via ESLint)
- **CSS**: WordPress CSS Coding Standards

### Testing Strategy

**Unit Tests**
- PHPUnit for PHP business logic
- Jest for JavaScript components
- Coverage for critical paths (bidding, authentication, state transitions)

**Integration Tests**
- REST API endpoint testing
- Database transaction testing
- WooCommerce integration testing

**Continuous Integration**
GitHub Actions runs automated tests on every push:
- PHP 8.2 compatibility
- JavaScript build verification
- Code quality checks (PHPCS, ESLint)
- Unit test execution

## Plugin Lifecycle

### Activation

1. Database tables created via `dbDelta()`
2. Custom capabilities registered (`auction_seller`, `auction_bidder`)
3. Rewrite endpoints added (`/watchlist`, `/my-bids`, `/auctions-won`)
4. Existing auctions rescheduled with UTC timestamps
5. Default options initialized

### Runtime

1. `WPAM_Loader` bootstraps all components
2. Admin hooks register settings and tables
3. Public hooks enqueue scripts and templates
4. REST API routes registered under `wpam/v1`
5. Cron events process auction state changes

### Deactivation

1. Scheduled events cleared
2. Transients purged
3. User data preserved

### Uninstall

1. Custom tables dropped
2. Options removed
3. User meta cleaned
4. Capabilities removed from roles

## API Integration

### REST Endpoints

All endpoints use the `wpam/v1` namespace and require authentication.

**Bidding**
```
POST /wpam/v1/bid
Body: { auction_id: int, bid: float, max_bid?: float }
Permission: auction_bidder capability
```

**Watchlist**
```
POST /wpam/v1/watchlist
Body: { auction_id: int }
Permission: read capability

GET /wpam/v1/watchlist
Permission: read capability
```

**Highest Bid**
```
GET /wpam/v1/auction/{id}/highest
Permission: public (no auth required)
```

### Webhooks

Configure webhook URLs in settings to receive POST notifications:

```json
{
  "event": "auction_end",
  "auction_id": 123,
  "winner_id": 456,
  "winning_bid": 150.00,
  "timestamp": "2025-11-25T10:30:00Z"
}
```

Events: `auction_start`, `auction_end`, `bid_placed`, `auction_canceled`

## Real-time Features

### Pusher Integration

Enable WebSocket updates via Pusher:

1. Create Pusher account and app
2. Configure credentials in **Auctions > Settings > Integrations**
3. Select "Pusher" as realtime provider

**Channels**
- `auction-{id}` - Public auction updates
- `presence-auction-{id}` - Viewer count tracking

**Events**
- `bid_update` - New bid placed
- `auction_status` - State change (started, ended, suspended)
- `viewer_update` - Active viewer count changed

### Fallback Polling

When real-time is disabled, AJAX polling refreshes bid data every 5 seconds (configurable via `wpam_poll_interval` filter).

## Security Considerations

**Capability Checks**
All admin operations require `manage_woocommerce` capability. Bidding requires `auction_bidder` capability.

**Nonce Verification**
AJAX and REST endpoints verify nonces to prevent CSRF attacks.

**SQL Injection Prevention**
All database queries use `$wpdb->prepare()` for parameterization.

**Audit Trail**
Bid actions logged with IP address and user agent for fraud detection.

**Rate Limiting**
Max bids per user configurable per auction to prevent spam.

## Extending the Plugin

### Custom Auction Types

Register new auction types via filter:

```php
add_filter('wpam_auction_types', function($types) {
    $types['dutch'] = __('Dutch Auction', 'your-plugin');
    return $types;
});
```

### Custom Notification Providers

Implement `WPAM_API_Provider` interface:

```php
class Custom_Provider implements WPAM_API_Provider {
    public function send_notification($user_id, $message) {
        // Implementation
    }
}
```

### Bid Validation Hooks

```php
add_filter('wpam_validate_bid', function($valid, $auction_id, $bid, $user_id) {
    // Custom validation logic
    return $valid;
}, 10, 4);
```

## Troubleshooting

**Auctions not ending automatically**
Check WP-Cron is functioning: `wp cron event list`

**Real-time updates not working**
Verify Pusher credentials and check browser console for WebSocket errors.

**Bids not saving**
Check database table exists: `SHOW TABLES LIKE 'wp_wc_auction_bids'`

**Permission errors**
Verify user has `auction_bidder` capability: `user_can($user_id, 'auction_bidder')`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

All contributions must:
- Pass CI checks (tests, linting)
- Include unit tests for new features
- Follow WordPress coding standards
- Update documentation as needed

## Support

- GitHub Issues: https://github.com/smhz101/wp-auction-manager/issues
- Documentation: https://github.com/smhz101/wp-auction-manager/wiki
- Developer: Muzammil Hussain (https://muzammil.dev)
