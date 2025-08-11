import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';
import prefixer from '@tailwindcss/prefixer';

export default {
		// Avoid conflict with WP admin styles
		content: ['./**/*.php', './index.html', './src/**/*.{js,jsx,ts,tsx}'],
		darkMode: 'class',
		important: '#wpam-auctions-root',
		// theme: {
		// extend: {
		// colors: {
		// wp: {
		// blue: '#2271b1',
		// 'blue-dark': '#135e96',
		// black: '#000',
		// white: '#fff',
		// red: '#cc1818',
		// yellow: '#f0b849',
		// green: '#4ab866',
		// gray: {
		// 900: '#1e1e1e',
		// 700: '#757575',
		// 400: '#ccc',
		// 300: '#ddd',
		// 100: '#f0f0f0',
		// },
		// },
		// },
		// fontFamily: {
		// sans: [
		// '-apple-system',
		// 'BlinkMacSystemFont',
		// 'Segoe UI',
		// 'Roboto',
		// 'Oxygen-Sans',
		// 'Ubuntu',
		// 'Cantarell',
		// 'Helvetica Neue',
		// 'sans-serif',
		// ...defaultTheme.fontFamily.sans,
		// ],
		// },
		// fontSize: {
		// 'wp-xs': ['11px', '16px'],
		// 'wp-sm': ['12px', '20px'],
		// 'wp-base': ['13px', '24px'],
		// 'wp-lg': ['15px', '28px'],
		// 'wp-xl': ['20px', '32px'],
		// 'wp-2xl': ['32px', '40px'],
		// },
		// spacing: {
		// 'wp-0.5': '4px',
		// 'wp-1': '8px',
		// 'wp-1.5': '12px',
		// 'wp-2': '16px',
		// 'wp-3': '24px',
		// 'wp-4': '32px',
		// 'wp-5': '40px',
		// 'wp-6': '48px',
		// 'wp-7': '56px',
		// 'wp-8': '64px',
		// },
		// },
		// },
		plugins: [prefixer( { prefix: 'tw' } ), forms, typography, aspectRatio],
		safelist: [
		{
			pattern:
				/tw-(bg|text|border)-(primary|secondary|gray)-(100|300|500|700|900)/,
			variants: ['hover', 'focus'],
	},
	],
	corePlugins: {
		preflight: false, // Disable Tailwind's base reset to avoid WP admin issues
	},
	};
