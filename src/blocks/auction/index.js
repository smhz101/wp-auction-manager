import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, TextControl } from '@wordpress/components';
import metadata from './block.json';

registerBlockType(metadata.name, {
  edit({ attributes, setAttributes }) {
    const { showCountdown, showBidForm, showStatus, showWatchlist, auctionId } = attributes;
    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Auction Settings', 'wpam')}>
            <TextControl
              label={__('Auction ID (optional)', 'wpam')}
              value={auctionId || ''}
              onChange={(value) => setAttributes({ auctionId: parseInt(value, 10) || 0 })}
            />
            <ToggleControl
              label={__('Show Countdown', 'wpam')}
              checked={showCountdown}
              onChange={(val) => setAttributes({ showCountdown: val })}
            />
            <ToggleControl
              label={__('Show Bid Form', 'wpam')}
              checked={showBidForm}
              onChange={(val) => setAttributes({ showBidForm: val })}
            />
            <ToggleControl
              label={__('Show Status Labels', 'wpam')}
              checked={showStatus}
              onChange={(val) => setAttributes({ showStatus: val })}
            />
            <ToggleControl
              label={__('Show Watchlist Button', 'wpam')}
              checked={showWatchlist}
              onChange={(val) => setAttributes({ showWatchlist: val })}
            />
          </PanelBody>
        </InspectorControls>
        <div {...useBlockProps()}>{__('Auction Block', 'wpam')}</div>
      </>
    );
  },
  save() {
    return null;
  },
});
