import { Edit } from '../index';

// Mock WordPress dependencies
jest.mock('@wordpress/blocks', () => ({
  registerBlockType: jest.fn(),
}));
jest.mock('@wordpress/i18n', () => ({
  __: (str) => str,
}));
jest.mock('@wordpress/block-editor', () => ({
  useBlockProps: jest.fn(() => ({})),
  InspectorControls: ({ children }) => <div>{children}</div>,
}));
jest.mock('@wordpress/components', () => ({
  PanelBody: ({ children }) => <div>{children}</div>,
  ToggleControl: () => <div>ToggleControl</div>,
  TextControl: () => <div>TextControl</div>,
}));

describe('Edit', () => {
	it('is a function', () => {
		expect(typeof Edit).toBe('function');
	});

    it('renders without crashing', () => {
        // We can't easily render without a React environment setup (enzyme/RTL), 
        // and wp-scripts might not have it fully configured for us without more setup.
        // But we can verify it's a valid component function.
        const attributes = {
			showCountdown: true,
			showBidForm: true,
			showStatus: true,
			showWatchlist: true,
			showWinner: true,
			auctionId: 0,
		};
		const setAttributes = jest.fn();
        const result = Edit({ attributes, setAttributes });
        expect(result).toBeTruthy();
    });
});
