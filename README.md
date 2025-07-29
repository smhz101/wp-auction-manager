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
- **Auto Relist** – automatically relist when no winning bid exists.
- **Max Bids Per User** – limit how many bids each user can place.
- **Auction Fee** – extra fee added to the winning bid.

### Soft-close settings

Under **Auctions → Settings** you can configure the soft-close threshold and the extension duration. If a bid arrives within the threshold, the end time is extended by the duration. By default both values are 30 seconds.
The older `Soft Close Duration` option is still honored when the new values are empty; it sets both the threshold and the extension length in seconds.
### Integration settings

The **Integrations** tab lets you connect optional services.
- **Twilio** – enable SMS alerts and fill in your account SID, token and from number.
- **Firebase** – toggle Firebase push notifications and provide the server key.
- **Pusher** – choose "Pusher" under Realtime Provider and enter your app credentials for WebSocket updates.


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

## Development


The plugin uses AJAX polling by default to refresh the current highest bid every few seconds.
Future versions may swap to WebSocket providers found under `includes/api-integrations`.

Under **Auctions → Settings → Realtime Integration** you can select `None` or `Pusher` as the provider. Enter your Pusher app credentials to enable realtime WebSocket updates.
Twilio SMS notifications can be toggled via the `Enable Twilio Notifications` option (`wpam_enable_twilio`).
Firebase push notifications are available through the `Enable Firebase` option (`wpam_enable_firebase`) once you provide a valid server key.

### React frontend

The plugin includes a lightweight React application that can render either a list of auctions or a single auction view. Use the `[wpam_auction_app]` shortcode on any page to load the React interface. When used on a single auction product page the current auction is automatically displayed.

### Auction block

WP Auction Manager ships with a dynamic block registered via `@wordpress/scripts`. Search for **Auction** in the block inserter to add a live countdown, status labels and bid form anywhere within the block editor. Block attributes allow toggling each element and optionally specifying an Auction ID when used outside of the product screen.

## Running unit tests

A `tests/` directory will contain PHPUnit tests in the future. Once available, install development dependencies and execute:

```bash
composer install
vendor/bin/phpunit
vendor/bin/phpcs
```
