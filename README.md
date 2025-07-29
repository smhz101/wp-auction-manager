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

## Folder structure

```text
wp-auction-manager/
├── admin/                  # Admin menus and settings
├── includes/               # Core classes (loader, auction, bid, watchlist)
│   └── api-integrations/   # Placeholder for third-party providers
├── public/                 # Frontend scripts and public hooks
├── templates/              # Theme templates for auction pages
├── uninstall.php           # Removes plugin data on uninstall
├── wp-auction-manager.php  # Main plugin file
```

## Running unit tests

A `tests/` directory will contain PHPUnit tests in the future. Once available, install development dependencies and execute:

```bash
composer install
vendor/bin/phpunit
```