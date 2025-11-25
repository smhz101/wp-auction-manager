# Changelog

All notable changes to WP Auction Manager are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2025-11-25

### Added
- GitHub Actions CI/CD workflow for automated testing and quality checks
- PHPUnit test configuration with `phpunit.xml.dist`
- JavaScript unit testing setup with Jest for Gutenberg blocks
- REST API capability tests to verify security permissions
- Internationalization support for Gutenberg block scripts via `wp_set_script_translations`
- ARIA labels and accessibility attributes to auction block elements
- Focus management for AJAX interactions (bidding, watchlist toggle)
- Comprehensive `.gitignore` for better repository hygiene
- Screen reader text labels for form inputs

### Changed
- Refactored Gutenberg block to export `Edit` component for better testability
- Updated `package.json` with test and lint scripts
- Improved documentation with comprehensive README, developer guide, and WordPress.org readme
- Enhanced security with explicit capability checks on REST endpoints

### Fixed
- Composer autoloader issues by removing development dependencies from production
- Jest configuration to properly ignore `admin-react` directory
- Accessibility issues with missing form labels and ARIA attributes

### Security
- Verified all database queries use prepared statements (`$wpdb->prepare`)
- Confirmed REST API endpoints enforce proper capability checks
- Added audit trail for bid actions with IP and user agent logging

## [1.0.3] - 2025-07-31

### Added
- Pre-populated default start and end dates for new auctions
- Flatpickr date picker integration for easier date selection

### Improved
- User experience when creating new auctions with sensible defaults

## [1.0.2] - 2025-07-30

### Added
- Search functionality in admin auctions table
- Auction type filter for admin auction listings
- WordPress component styles for admin pages

### Improved
- Admin interface usability with better filtering and search capabilities

## [1.0.1] - 2025-07-29

### Added
- Automatic WooCommerce order creation when auction ends
- Winner notification system via email
- Auction completion workflow automation

### Improved
- Post-auction experience for winners and administrators

## [1.0.0] - Initial Release

### Added
- Custom "Auction" product type extending WooCommerce
- Auction scheduling with start and end date fields
- Bid placement system with custom database table storage
- Watchlist functionality for users to track auctions
- AJAX-powered bid submission and watchlist toggle
- Public templates for auction display and bidding interface
- Q&A messaging system for auction communication
- Admin moderation interface for messages
- Multiple auction types: Standard, Reverse, Sealed
- Reserve price functionality
- Buy Now instant purchase option
- Minimum bid increment validation
- Soft-close extension mechanism
- Auto-relist feature with configurable delay and price adjustment
- Proxy bidding for standard auctions
- Silent bidding mode
- Maximum bids per user limit
- Auction fee configuration
- Real-time provider integration (Pusher)
- SMS notifications via Twilio
- Push notifications via Firebase
- Email notifications with SendGrid support
- Admin logs for auction events
- Audit trail for security and fraud detection
- KYC verification system
- User flagging mechanism
- Gutenberg block for auction display
- React-based frontend application
- REST API endpoints for programmatic access
- Webhook support for external integrations
- `[wpam_auctions]` shortcode for auction listings
- `[wpam_auction_app]` shortcode for React interface
- Custom user account endpoints: `/watchlist`, `/my-bids`, `/auctions-won`
- Comprehensive admin settings panel
- Multi-language support with translation template

### Developer Features
- PSR-4 autoloading for plugin classes
- WordPress coding standards compliance
- PHPUnit test infrastructure
- Modular architecture with clear separation of concerns
- Extensible provider system for third-party integrations
- Filter and action hooks for customization
- Detailed inline documentation

## Unreleased

### Planned
- Advanced analytics dashboard for auction performance
- Bulk auction management tools
- CSV import/export for auctions
- Mobile app integration
- Advanced fraud detection algorithms
- Multi-currency support
- Auction templates for quick setup
- Scheduled auction campaigns
- Bidder reputation system
- Automated bid sniping protection

---

For detailed upgrade instructions and breaking changes, please refer to the [README.md](README.md) file.

For technical implementation details, see [AGENTS.md](AGENTS.md).
