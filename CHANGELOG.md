# Changelog

## 1.0.1 - 2025-07-29
- Automatic order creation and winner notifications on auction end.

## 1.0.0 - Initial release
- Added custom auction product type with start and end date fields.
- Implemented basic bid placement storing bids in custom table.
- Added watchlist table and AJAX toggle handler.
- Provided public scripts and templates for bidding and watchlist controls.
- Introduced messages table with frontend Q&A and admin moderation screen.

## Unreleased
- Added AJAX endpoint to fetch current highest bid.
- Frontend script now polls for bid updates every 5 seconds.
- Introduced skeleton WebSocket provider classes for future realtime support.
- Added admin settings to select a realtime provider and enter Pusher credentials.

